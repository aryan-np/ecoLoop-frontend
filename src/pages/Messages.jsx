import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getThreads, getMessages, markMessagesRead,
  createOffer, respondToOffer, getOfferHistory,
} from "../api/communications";
import reviewAPI from "../api/review";
import AuthContext from "../auth/AuthProvider";
import ReportModal from "../components/ReportModal";
import ReviewModal from "../components/ReviewModal";
import Toast from "../components/Toast";
import paymentAPI from "../api/payment";
import productAPI from "../api/product";
import { getErrorMessage } from "../utils/errorHandler";

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function normalizeThread(thread, currentUserId) {
  const selfId = firstDefined(thread?.self_id, thread?.self?.id, currentUserId, thread?.user1_id, thread?.user1?.id);

  let participantId = firstDefined(
    thread?.participant_id,
    thread?.participant?.id,
    thread?.user2_id,
    thread?.user2?.id,
    thread?.other_user_id,
    thread?.receiver_id,
    thread?.recipient_id
  );

  if (!participantId && thread?.user1_id && thread?.user2_id && selfId) {
    participantId = String(thread.user1_id) === String(selfId) ? thread.user2_id : thread.user1_id;
  }

  return {
    ...thread,
    self_id: selfId,
    participant_id: participantId,
    participant_name: firstDefined(thread?.participant_name, thread?.participant?.full_name, thread?.user2_name, thread?.other_user_name),
    participant_email: firstDefined(thread?.participant_email, thread?.participant?.email, thread?.user2_email, thread?.other_user_email),
    participant_profile_picture: firstDefined(
      thread?.participant_profile_picture,
      thread?.participant?.profile_picture,
      thread?.user2_profile_picture,
      thread?.other_user_profile_picture
    ),
  };
}

function timeShort(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "bg-amber-100 text-amber-800",  label: "Pending"  },
    accepted: { cls: "bg-green-500 text-white",       label: "Accepted" },
    rejected: { cls: "bg-red-500   text-white",       label: "Rejected" },
    expired:  { cls: "bg-gray-200  text-gray-500",   label: "Expired"  },
  };
  const s = map[status] || { cls: "bg-gray-100 text-gray-600", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function Messages() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { access, user } = useContext(AuthContext);

  // ── Thread / message state ───────────────────────────────────────────────
  const [threads,        setThreads]        = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [text,           setText]           = useState("");
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [showReportModal,setShowReportModal]= useState(false);
  const [olderPage,      setOlderPage]      = useState(null);
  const [loadingOlder,   setLoadingOlder]   = useState(false);
  const [toast,          setToast]          = useState(null);

  // ── Offer state ──────────────────────────────────────────────────────────
  const [latestOffer,         setLatestOffer]         = useState(null);
  const [showOfferInput,      setShowOfferInput]      = useState(false);
  const [offerInputAmount,    setOfferInputAmount]    = useState("");
  const [offerLoading,        setOfferLoading]        = useState(false);
  const [showOfferHistory,    setShowOfferHistory]    = useState(false);
  const [offerHistory,        setOfferHistory]        = useState([]);
  const [offerHistoryLoading, setOfferHistoryLoading] = useState(false);

  const [reviewPermission,      setReviewPermission]      = useState(null);
  const [reviewPermissionLoading,setReviewPermissionLoading]= useState(false);
  const [showReviewModal,       setShowReviewModal]       = useState(false);
  const [reviewRefreshKey,      setReviewRefreshKey]      = useState(0);
  const [wsReady,               setWsReady]               = useState(false);

  const wsRef       = useRef(null);
  const listRef     = useRef(null);
  const textInputRef= useRef(null);

  // ── Load threads on mount ────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      setThreadsLoading(true);
      try {
        const res = await getThreads();
        const normalizedThreads = Array.isArray(res)
          ? res.map((item) => normalizeThread(item, user?.id))
          : [];
        if (mounted) {
          setThreads(normalizedThreads);
          const threadIdFromState = location.state?.threadId;
          if (threadIdFromState && normalizedThreads.length > 0) {
            const found = normalizedThreads.find((t) => String(t.id) === String(threadIdFromState));
            if (found) selectThread(found, normalizedThreads);
          }
        }
      } catch (e) { console.error(e); }
      finally { if (mounted) setThreadsLoading(false); }
    }
    if (access) load();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, location.state?.threadId, user?.id]);

  // ── Select a thread ──────────────────────────────────────────────────────
  function selectThread(thread, threadList) {
    setSelectedThread(thread);
    setLatestOffer(thread.latest_offer || null);
    setShowOfferInput(false);
    setOfferInputAmount("");
    setShowOfferHistory(false);
    setOfferHistory([]);
    setReviewPermission(null);
    setThreads((prev) =>
      (threadList || prev).map((t) =>
        t.id === thread.id ? { ...t, unread_count: 0 } : t
      )
    );
  }

  // ── Load messages when thread changes ────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!selectedThread) return;
      setLoading(true);
      setMessages([]);
      setOlderPage(null);
      try {
        const res = await getMessages(selectedThread.id, 1);
        if (!mounted) return;
        const reversed = res.results ? res.results.slice().reverse() : [];
        setMessages(reversed);
        setOlderPage(res.next ? 2 : null);
        const unreadIds = reversed
          .filter((m) => !m.is_read && m.sender?.id !== user?.id)
          .map((m) => m.id);
        if (unreadIds.length > 0) markMessagesRead(unreadIds).catch(console.error);
        setTimeout(() => {
          if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
        }, 100);
      } catch (e) { console.error(e); }
      finally { if (mounted) setLoading(false); }
    }
    load();
    return () => (mounted = false);
  }, [selectedThread, access]);

  // ── Auto-scroll on new messages ──────────────────────────────────────────
  useEffect(() => {
    if (listRef.current)
      setTimeout(() => { listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
  }, [messages]);

  // ── Auto-focus input ─────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedThread && !loading)
      setTimeout(() => { textInputRef.current?.focus(); }, 100);
  }, [selectedThread, loading]);

  // ── WebSocket ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedThread) return;
    const wsUrl = import.meta.env.VITE_WS_BASE_URL;
    const url   = `${wsUrl}/ws/chat/${selectedThread.id}/?token=${access}`;
    try {
      setWsReady(false);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen  = () => {
        console.log("WebSocket connected");
        setWsReady(true);
      };
      ws.onerror = (err) => console.error("WebSocket error:", err);
      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setWsReady(false);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          // ── TASK 3: handle offer events ──────────────────────────────
          if (data.type === "offer") {
            const updatedOffer = {
              id:             data.offer_id,
              amount:         data.amount,
              status:         data.status,
              proposed_by_id: data.proposed_by,
              is_paid:        data.is_paid === true,
            };
            setLatestOffer(updatedOffer);

            if (data.is_paid === true) {
              // Mark thread as sold in selectedThread and sidebar
              setSelectedThread((prev) => prev ? { ...prev, product_is_sold: true } : prev);
              setThreads((prev) =>
                prev.map((t) =>
                  t.id === selectedThread.id ? { ...t, product_is_sold: true } : t
                )
              );
            }
            return;
          }

          if (data.type !== "message") return;

          const isMine = data.sender === selectedThread.self_id;
          const msg = {
            id:         data.id || Date.now(),
            content:    data.content || "",
            created_at: data.created_at || new Date().toISOString(),
            sender: {
              id:        isMine ? user?.id        : selectedThread.participant_id,
              email:     isMine ? user?.email     : selectedThread.participant_email,
              full_name: isMine ? user?.full_name : selectedThread.participant_name,
            },
            is_read: isMine,
            isMine,
          };

          setMessages((m) => [...m, msg]);

          // Optimistically update sidebar last_message
          setThreads((prev) =>
            prev.map((t) =>
              t.id === selectedThread.id
                ? { ...t, last_message: { content: data.content || "", created_at: data.created_at || new Date().toISOString() } }
                : t
            )
          );

          if (!isMine && data.id) markMessagesRead([data.id]).catch(console.error);
          getThreads()
            .then((res) => {
              const normalizedThreads = Array.isArray(res)
                ? res.map((item) => normalizeThread(item, user?.id))
                : [];
              setThreads(normalizedThreads);
            })
            .catch(console.error);
        } catch (err) { console.error("WebSocket parse error:", err); }
      };
    } catch (err) { console.error("WebSocket creation error:", err); }

    return () => { try { wsRef.current?.close(); } catch {} };
  }, [selectedThread, access, user?.email]);

  // ── Load older messages ──────────────────────────────────────────────────
  async function loadOlderMessages() {
    if (!olderPage || loadingOlder) return;
    const prevScrollHeight = listRef.current?.scrollHeight || 0;
    setLoadingOlder(true);
    try {
      const res   = await getMessages(selectedThread.id, olderPage);
      const older = res.results ? res.results.slice().reverse() : [];
      setMessages((prev) => [...older, ...prev]);
      setOlderPage(res.next ? olderPage + 1 : null);
      requestAnimationFrame(() => {
        if (listRef.current)
          listRef.current.scrollTop = listRef.current.scrollHeight - prevScrollHeight;
      });
    } catch (e) { console.error(e); }
    finally { setLoadingOlder(false); }
  }

  // ── Send message via WS ──────────────────────────────────────────────────
  function send() {
    if (!text.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setToast({ type: "error", message: "Connection not ready. Please wait...", key: Date.now() });
      return;
    }
    wsRef.current.send(JSON.stringify({ type: "message", body: text }));
    setText("");
  }

  // ── Offer actions ────────────────────────────────────────────────────────
  function openOfferInput(prefill) {
    setOfferInputAmount(String(prefill || selectedThread?.product_price || ""));
    setShowOfferInput(true);
  }

  async function handleSubmitOffer() {
    const amount = parseFloat(offerInputAmount);
    if (!amount || amount <= 0) {
      setToast({ type: "error", message: "Enter a valid amount.", key: Date.now() });
      return;
    }
    setOfferLoading(true);
    try {
      const result = await createOffer(selectedThread.id, amount);
      setLatestOffer(result);
      setShowOfferInput(false);
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to send offer."), key: Date.now() });
    } finally { setOfferLoading(false); }
  }

  async function handleRespondOffer(status) {
    setOfferLoading(true);
    try {
      const result = await respondToOffer(latestOffer.id, status);
      setLatestOffer(result);
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to update offer."), key: Date.now() });
    } finally { setOfferLoading(false); }
  }

  async function handlePayNow() {
    setOfferLoading(true);
    try {
      const resp = await paymentAPI.initiate({
        amount: Math.round(parseFloat(latestOffer.amount) * 100),
        purchase_order_name: selectedThread.product_name || "EcoLoop Product",
        return_url: `${window.location.origin}/payment/callback`,
        thread_id: selectedThread.id,
        customer_info: {
          name:  user?.full_name || "Customer",
          email: user?.email || "",
          phone: user?.phone_number || "",
        },
      });
      const result = resp?.Result || resp?.result || resp;
      if (!result?.pidx || !result?.payment_url) throw new Error("Invalid payment response");
      localStorage.setItem("khalti_pidx", result.pidx);
      window.location.href = result.payment_url;
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Payment initiation failed."), key: Date.now() });
      setOfferLoading(false);
    }
  }

  async function handleMarkSold() {
    setOfferLoading(true);
    try {
      await productAPI.partialUpdateProduct(selectedThread.product_id, { status: "sold" });
      setToast({ type: "success", message: "Listing marked as sold!", key: Date.now() });
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to mark as sold."), key: Date.now() });
    } finally { setOfferLoading(false); }
  }

  async function handleToggleOfferHistory() {
    if (showOfferHistory) { setShowOfferHistory(false); return; }
    setShowOfferHistory(true);
    if (offerHistory.length > 0) return;
    setOfferHistoryLoading(true);
    try {
      const res = await getOfferHistory(selectedThread.id);
      setOfferHistory(res);
    } catch (e) { console.error(e); }
    finally { setOfferHistoryLoading(false); }
  }

  useEffect(() => {
    const participantId = selectedThread?.participant_id;
    const selfId = selectedThread?.self_id || user?.id;

    if (!participantId || !access) {
      setReviewPermissionLoading(false);
      setReviewPermission(null);
      return;
    }

    if (String(participantId) === String(selfId)) {
      setReviewPermissionLoading(false);
      setReviewPermission({
        can_review: false,
        already_reviewed: false,
        existing_review_id: null,
      });
      return;
    }

    let mounted = true;
    setReviewPermissionLoading(true);

    reviewAPI
      .canReviewUser(participantId)
      .then((response) => {
        if (!mounted) return;
        setReviewPermission({
          can_review: !!response?.can_review,
          already_reviewed: !!response?.already_reviewed,
          existing_review_id: response?.existing_review_id || null,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setReviewPermission({
          can_review: false,
          already_reviewed: false,
          existing_review_id: null,
        });
      })
      .finally(() => {
        if (mounted) setReviewPermissionLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedThread?.participant_id, selectedThread?.self_id, access, reviewRefreshKey, user?.id]);

  function handleOpenReviewModal() {
    if (!selectedThread?.participant_id) {
      setToast({ type: "error", message: "Could not identify this user for review.", key: Date.now() });
      return;
    }
    if (!reviewPermission?.can_review) return;
    setShowReviewModal(true);
  }

  function handleReviewSubmitted(_review, mode) {
    setToast({
      type: "success",
      message: mode === "edit" ? "Review updated successfully." : "Review submitted successfully.",
      key: Date.now(),
    });
    setReviewRefreshKey((value) => value + 1);
  }

  // ── Derive offer UI state ────────────────────────────────────────────────
  function renderOfferSection() {
    if (!selectedThread?.product_id) return null;

    const selfId  = selectedThread.self_id;
    const isBuyer = !selectedThread.is_owner;
    const status  = latestOffer?.status;
    const iMadeIt = latestOffer?.proposed_by_id === selfId;
    const isPaid  = latestOffer?.is_paid === true;
    const isSold  = !isPaid && selectedThread.product_is_sold === true;

    return (
      <>
        <style>{`
          @keyframes eco-dot-pulse{0%,60%,100%{opacity:.2;transform:scale(.75)}30%{opacity:1;transform:scale(1)}}
          .eco-dot{display:inline-block;width:4px;height:4px;border-radius:9999px;background:currentColor;margin:0 1.5px;vertical-align:middle;animation:eco-dot-pulse 1.4s ease-in-out infinite}
          .eco-dot:nth-child(2){animation-delay:.2s}
          .eco-dot:nth-child(3){animation-delay:.4s}
          @keyframes eco-slide{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
          .eco-slide{animation:eco-slide .18s ease-out}
          .eco-btn{transition:transform .15s ease,opacity .15s ease}
          .eco-btn:hover:not(:disabled){transform:scale(1.02)}
        `}</style>

        <div
          className="border-b flex-shrink-0 px-4 py-4"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", opacity: isSold ? 0.8 : 1, transition: "opacity .2s" }}
        >
          {/* ── Row 1: product name + top-right badge ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {isSold ? (
                <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {selectedThread.product_name}
                </span>
              ) : (
                <button
                  onClick={() => navigate(`/products/${selectedThread.product_id}`)}
                  className="font-semibold text-sm hover:underline text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  {selectedThread.product_name}
                </button>
              )}

              {/* Price + role badge */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {latestOffer && !isPaid ? (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>NPR {selectedThread.product_price}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-bold text-sm" style={{ color: "#5C2D91" }}>NPR {latestOffer.amount}</span>
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Listed at NPR {selectedThread.product_price}
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedThread.is_owner ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                  {selectedThread.is_owner ? "Seller" : "Buyer"}
                </span>
              </div>
            </div>

            {/* Top-right state badge */}
            <div className="flex-shrink-0 mt-0.5">
              {isPaid && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">Paid</span>}
              {isSold && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-300 text-gray-700">Sold</span>}
              {latestOffer && !isSold && !isPaid && <StatusBadge status={status} />}
            </div>
          </div>

          {/* ── Paid state ── */}
          {isPaid && (
            <div className="mt-3 flex items-center gap-2 eco-slide">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-green-700">
                {isBuyer ? "Your payment was successfully sent." : "Payment has been received for this item."}
              </p>
            </div>
          )}

          {/* ── Sold notice ── */}
          {isSold && (
            <p className="mt-2 text-xs italic text-gray-400 eco-slide">This product has already been sold.</p>
          )}

          {/* ── Offer actions (hidden when sold or paid) ── */}
          {!isSold && !isPaid && (
            <div className="mt-3 space-y-2">

              {/* State A: no offer */}
              {!latestOffer && !showOfferInput && (
                <button
                  onClick={() => openOfferInput(selectedThread.product_price)}
                  className="eco-btn text-sm px-4 py-1.5 rounded-full border font-semibold transition"
                  style={{ borderColor: "var(--eco-primary)", color: "var(--eco-primary)" }}
                >
                  Make Offer
                </button>
              )}

              {/* State B: I proposed — waiting */}
              {status === "pending" && iMadeIt && !showOfferInput && (
                <div className="flex items-center gap-3 flex-wrap eco-slide">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>NPR {latestOffer.amount}</span>
                  <span className="flex items-center gap-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    Waiting for response<span className="eco-dot"/><span className="eco-dot"/><span className="eco-dot"/>
                  </span>
                  <button
                    onClick={() => openOfferInput(latestOffer.amount)}
                    className="eco-btn text-xs px-3 py-1 rounded-full border transition"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Counter
                  </button>
                </div>
              )}

              {/* State C: they proposed */}
              {status === "pending" && !iMadeIt && !showOfferInput && (
                <div className="flex items-center gap-2 flex-wrap eco-slide">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>NPR {latestOffer.amount} offered</span>
                  <button
                    onClick={() => handleRespondOffer("accepted")}
                    disabled={offerLoading}
                    className="eco-btn text-xs px-3 py-1.5 rounded-full font-semibold text-white bg-green-500 disabled:opacity-60 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => openOfferInput(latestOffer.amount)}
                    disabled={offerLoading}
                    className="eco-btn text-xs px-3 py-1.5 rounded-full border font-semibold disabled:opacity-60 transition"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    Counter
                  </button>
                  <button
                    onClick={() => handleRespondOffer("rejected")}
                    disabled={offerLoading}
                    className="eco-btn text-xs px-3 py-1.5 rounded-full border font-semibold text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-60 transition"
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* State D: accepted */}
              {status === "accepted" && (
                isBuyer ? (
                  <button
                    onClick={handlePayNow}
                    disabled={offerLoading}
                    className="eco-btn inline-flex items-center gap-2 text-sm px-5 py-2 rounded-full font-semibold text-white disabled:opacity-60 transition"
                    style={{ backgroundColor: "#5C2D91" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {offerLoading ? "Redirecting…" : `Pay Now — NPR ${latestOffer.amount}`}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      Awaiting payment<span className="eco-dot"/><span className="eco-dot"/><span className="eco-dot"/>
                    </span>
                    <button
                      onClick={handleMarkSold}
                      disabled={offerLoading}
                      className="eco-btn text-xs px-3 py-1.5 rounded-full font-semibold text-white disabled:opacity-60 transition"
                      style={{ backgroundColor: "var(--eco-primary)" }}
                    >
                      {offerLoading ? "Saving…" : "Mark as Sold"}
                    </button>
                  </div>
                )
              )}

              {/* State E: rejected */}
              {status === "rejected" && !showOfferInput && (
                <div className="flex items-center gap-3 flex-wrap eco-slide">
                  <span className="text-sm font-medium text-red-500">Offer rejected</span>
                  <button
                    onClick={() => openOfferInput(selectedThread.product_price)}
                    className="eco-btn text-xs px-3 py-1.5 rounded-full border transition"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Make New Offer
                  </button>
                </div>
              )}

              {/* Inline offer input */}
              {showOfferInput && (
                <div className="eco-slide">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-xl overflow-hidden flex-1" style={{ borderColor: "var(--border)" }}>
                      <span className="px-3 py-2 text-xs font-semibold border-r bg-gray-50 text-gray-500 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                        NPR
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={offerInputAmount}
                        onChange={(e) => setOfferInputAmount(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitOffer()}
                        className="flex-1 px-3 py-2 text-sm outline-none"
                        style={{ color: "var(--text-primary)", backgroundColor: "var(--card)" }}
                        placeholder="Enter your offer amount"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleSubmitOffer}
                      disabled={offerLoading}
                      className="eco-btn px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-500 disabled:opacity-60 transition flex-shrink-0"
                    >
                      {offerLoading ? "…" : "Send Offer"}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowOfferInput(false)}
                    className="mt-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Offer history ── */}
          <button
            onClick={handleToggleOfferHistory}
            className="mt-3 flex items-center gap-1 text-xs hover:opacity-80 transition"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              className="w-3 h-3 transition-transform duration-200"
              style={{ transform: showOfferHistory ? "rotate(180deg)" : "rotate(0deg)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showOfferHistory ? "Hide offer history" : "View offer history"}
          </button>

          {showOfferHistory && (
            <div className="mt-2 eco-slide rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              {offerHistoryLoading ? (
                <p className="text-xs px-3 py-2" style={{ color: "var(--text-secondary)" }}>Loading…</p>
              ) : offerHistory.length === 0 ? (
                <p className="text-xs px-3 py-2" style={{ color: "var(--text-secondary)" }}>No offers yet.</p>
              ) : (
                offerHistory.map((o, i) => (
                  <div
                    key={o.id}
                    className={`flex items-center gap-3 px-3 py-2 text-xs ${i !== offerHistory.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>NPR {o.amount}</span>
                    <StatusBadge status={o.status} />
                    <span className="ml-auto" style={{ color: "var(--text-secondary)" }}>
                      {o.proposed_by_id === selfId ? "You" : selectedThread.participant_name}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-4 rounded-lg w-full h-[calc(100vh-120px)]">
      {/* ── Left panel: Thread list ── */}
      <div className="w-full md:w-80 border-r flex flex-col overflow-hidden" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Messages</h2>
          <input
            type="text"
            placeholder="Search messages..."
            className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="flex-1 overflow-auto">
          {threadsLoading ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No messages yet</div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t)}
                className="w-full text-left px-4 py-3 border-b flex gap-3 items-center transition"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: selectedThread?.id === t.id ? "var(--section)" : "transparent",
                }}
                onMouseEnter={(e) => { if (selectedThread?.id !== t.id) e.currentTarget.style.backgroundColor = "var(--section)"; }}
                onMouseLeave={(e) => { if (selectedThread?.id !== t.id) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {t.participant_profile_picture ? (
                  <img src={t.participant_profile_picture} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0" style={{ backgroundColor: "var(--section)", color: "var(--eco-primary)" }}>
                    {(t.participant_name || "U").charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {t.participant_name || t.participant_email || "Participant"}
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                      {timeShort(t.updated_at || t.last_message?.created_at)}
                    </div>
                  </div>
                  {t.product_name && (
                    <div className="text-xs mt-1 truncate" style={{ color: "var(--eco-primary)" }}>
                      About: {t.product_name}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="text-sm truncate font-bold" style={{ color: "var(--text-secondary)" }}>
                      {t.last_message ? t.last_message.content : "No messages yet"}
                    </div>
                    {t.unread_count > 0 && (
                      <div className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--eco-primary)" }}>
                        {t.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: Chat ── */}
      <div className="hidden md:flex flex-1 flex-col rounded-lg overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
        {selectedThread ? (
          <>
            {/* Header — participant info only, no "About:" link */}
            <div className="p-4 border-b flex items-center gap-3 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
              {selectedThread.participant_profile_picture ? (
                <img src={selectedThread.participant_profile_picture} alt="profile" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0" style={{ backgroundColor: "var(--section)", color: "var(--eco-primary)" }}>
                  {(selectedThread.participant_name || "U").charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {selectedThread.participant_name || selectedThread.participant_email}
                </div>
              </div>

              <button
                onClick={handleOpenReviewModal}
                disabled={reviewPermissionLoading || !reviewPermission?.can_review}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ borderColor: "#FCD34D", color: "#B45309", backgroundColor: "#FFFBEB" }}
                title="Rate this user"
              >
                <span className="text-base leading-none">★</span>
                {reviewPermissionLoading
                  ? "Checking..."
                  : reviewPermission?.already_reviewed
                  ? "Edit Review"
                  : "Rate User"}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition hover:bg-red-50 hover:border-red-300"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                title="Report this conversation"
              >
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* TASK 1: Product context card + offer UI */}
            {renderOfferSection()}

            {/* Message list */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: "var(--section)" }}>
              {olderPage && (
                <div className="flex justify-center pb-2">
                  <button
                    onClick={loadOlderMessages}
                    disabled={loadingOlder}
                    className="text-xs px-4 py-1.5 rounded-full border transition disabled:opacity-50"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg)" }}
                  >
                    {loadingOlder ? "Loading..." : "Load earlier messages"}
                  </button>
                </div>
              )}
              {loading && <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading messages...</div>}
              {messages.map((m) => {
                const mine       = m.isMine !== undefined ? m.isMine : m.sender?.email === user?.email;
                const senderName = mine ? user?.full_name || user?.email : selectedThread.participant_name;
                const senderPic  = mine ? null : selectedThread.participant_profile_picture;
                return (
                  <div key={m.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start items-end"}`}>
                    {!mine && (
                      senderPic
                        ? <img src={senderPic} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0" style={{ backgroundColor: "var(--section)", color: "var(--eco-primary)" }}>{(senderName || "U").charAt(0)}</div>
                    )}
                    <div className="flex flex-col gap-1 max-w-xl">
                      {!mine && <div className="text-xs font-medium px-2" style={{ color: "var(--text-secondary)" }}>{senderName}</div>}
                      <div
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: mine ? "var(--eco-primary)" : "var(--bg)",
                          color:           mine ? "white"              : "var(--text-primary)",
                          border:          mine ? "none"               : "1px solid var(--border)",
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message input */}
            <div className="p-4 border-t flex gap-3 items-end flex-shrink-0" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
              <input
                ref={textInputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--card)" }}
              />
              <button
                onClick={send}
                disabled={!wsReady || !text.trim()}
                className="text-white px-4 py-2 rounded-lg transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--eco-primary)" }}
                onMouseEnter={(e) => !wsReady || !text.trim() ? null : (e.currentTarget.style.filter = "brightness(0.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: "var(--text-secondary)" }}>
            <svg className="w-20 h-20 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Select a conversation</h3>
              <p style={{ color: "var(--text-secondary)" }}>Choose a conversation from the list to view messages</p>
            </div>
          </div>
        )}
      </div>

      {selectedThread && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          conversationId={selectedThread.id}
          targetUserId={selectedThread.participant_id}
          category="message"
        />
      )}

      {selectedThread && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          revieweeId={selectedThread.participant_id}
          existingReviewId={reviewPermission?.already_reviewed ? reviewPermission?.existing_review_id : null}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {toast && (
        <Toast type={toast.type} message={toast.message} duration={4000} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
