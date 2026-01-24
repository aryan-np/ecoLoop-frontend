import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getThreads, getMessages } from "../api/communications";
import AuthContext from "../auth/AuthProvider";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function timeShort(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const { access, user } = useContext(AuthContext);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [threadsLoading, setThreadsLoading] = useState(false);
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const textInputRef = useRef(null);

  // Load threads on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setThreadsLoading(true);
      try {
        const res = await getThreads();
        if (mounted) {
          setThreads(res);
          
          // Check if we have a threadId from navigation state
          const threadIdFromState = location.state?.threadId;
          if (threadIdFromState && res.length > 0) {
            // Find the thread with matching ID
            const foundThread = res.find(t => t.id === threadIdFromState);
            if (foundThread) {
              setSelectedThread(foundThread);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setThreadsLoading(false);
      }
    }
    if (access) load();
    return () => (mounted = false);
  }, [access, location.state?.threadId]);

  // Load messages when thread changes
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!selectedThread) return;
      setLoading(true);
      try {
        const res = await getMessages(selectedThread.id);
        if (mounted) {
          setMessages(res.results ? res.results.slice().reverse() : []);
          // Scroll to bottom after messages load
          setTimeout(() => {
            if (listRef.current) {
              listRef.current.scrollTop = listRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [selectedThread, access]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 50);
    }
  }, [messages]);

  // Auto-focus text input when thread is loaded
  useEffect(() => {
    if (selectedThread && !loading) {
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
    }
  }, [selectedThread, loading]);

  // WebSocket connection
  useEffect(() => {
    if (!selectedThread) return;

    const wsUrl = import.meta.env.VITE_WS_BASE_URL;
    const url = `${wsUrl}/ws/chat/${selectedThread.id}/?token=${access}`;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log("WebSocket connected");
      };
      
      ws.onmessage = (e) => {
        try {
          console.log("Received WS:", e.data);
          const data = JSON.parse(e.data);
          if (data.type === "message") {
            // Sender is now a UUID string, compare with self_id
            const senderId = data.sender; // UUID of the sender
            const isMine = senderId === selectedThread.self_id;
            
            const msg = {
              id: data.id || Date.now(),
              content: data.content || "", // New format uses 'content' instead of 'body'
              created_at: data.created_at || new Date().toISOString(),
              sender: { 
                email: isMine ? user?.email : selectedThread.participant_email,
                full_name: isMine ? user?.full_name : selectedThread.participant_name
              },
              isMine: isMine,
            };
            
            console.log("Adding message:", msg);
            setMessages((m) => [...m, msg]);
            
            // Refresh threads to update last message
            getThreads().then((res) => setThreads(res)).catch(console.error);
          }
        } catch (err) {
          console.error("WebSocket parse error:", err);
        }
      };
      
      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
      
      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };
    } catch (err) {
      console.error("WebSocket creation error:", err);
    }

    return () => {
      try {
        wsRef.current?.close();
      } catch {}
    };
  }, [selectedThread, access, user?.email]);

  function send() {
    if (!text.trim()) return;
    const payload = { type: "message", body: text };
    // Don't add message locally - wait for it to come back from WebSocket
    wsRef.current?.send(JSON.stringify(payload));
    setText("");
  }

  return (
    <div className="flex gap-4 rounded-lg w-full h-[calc(100vh-120px)]">
      {/* Left panel: Threads list */}
      <div className="w-full md:w-80 border-r flex flex-col overflow-hidden" style={{backgroundColor: 'var(--bg)', borderColor: 'var(--border)'}}>
        <div className="p-4 border-b" style={{borderColor: 'var(--border)'}}>
          <h2 className="font-semibold text-lg" style={{color: 'var(--text-primary)'}}>Messages</h2>
          <input
            type="text"
            placeholder="Search messages..."
            className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
            style={{borderColor: 'var(--border)', color: 'var(--text-primary)'}}
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
                onClick={() => setSelectedThread(t)}
                className={`w-full text-left px-4 py-3 border-b flex gap-3 items-center transition`}
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: selectedThread?.id === t.id ? 'var(--section)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (selectedThread?.id !== t.id) e.currentTarget.style.backgroundColor = 'var(--section)'; }}
                onMouseLeave={(e) => { if (selectedThread?.id !== t.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {t.participant_profile_picture ? (
                  <img src={t.participant_profile_picture} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0" style={{backgroundColor: 'var(--section)', color: 'var(--eco-primary)'}}>
                    {(t.participant_name || "U").charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <div className="font-medium text-sm" style={{color: 'var(--text-primary)'}}>{t.participant_name || t.participant_email || "Participant"}</div>
                    <div className="text-xs flex-shrink-0" style={{color: 'var(--text-secondary)'}}>
                      {timeShort(t.updated_at || (t.last_message && t.last_message.created_at))}
                    </div>
                  </div>
                  {t.product_name && (
                    <div className="text-xs mt-1 truncate" style={{color: 'var(--eco-primary)'}}>
                      About: {t.product_name}
                    </div>
                  )}
                  <div className="text-xs mt-1 truncate" style={{color: 'var(--text-secondary)'}}>
                    {t.last_message ? t.last_message.content : "No messages yet"}
                  </div>
                </div>
                {t.unread_count > 0 && (
                  <div className="ml-2 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'var(--eco-primary)'}}>
                    {t.unread_count}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Chat */}
      <div className="hidden md:flex flex-1 flex-col rounded-lg overflow-hidden" style={{backgroundColor: 'var(--bg)'}}>
        {selectedThread ? (
          <>
            <div className="p-4 border-b flex items-start gap-3 flex-shrink-0" style={{borderColor: 'var(--border)'}}>
              {selectedThread.participant_profile_picture ? (
                <img src={selectedThread.participant_profile_picture} alt="profile" className="w-12 h-12 rounded-full object-cover flex-shrink-0 mt-1" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold flex-shrink-0 mt-1" style={{backgroundColor: 'var(--section)', color: 'var(--eco-primary)'}}>
                  {(selectedThread.participant_name || "U").charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{color: 'var(--text-primary)'}}>{selectedThread.participant_name || selectedThread.participant_email}</div>
                {selectedThread.product_name && selectedThread.product_id && (
                  <button
                    onClick={() => navigate(`/products/${selectedThread.product_id}`)}
                    className="text-sm hover:underline cursor-pointer transition mt-1 block"
                    style={{color: 'var(--eco-primary)'}}
                  >
                    About: {selectedThread.product_name}
                  </button>
                )}
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-80" style={{backgroundColor: 'var(--section)'}}>
              {loading && <div className="text-sm" style={{color: 'var(--text-secondary)'}}>Loading messages...</div>}
              {messages.map((m) => {
                const mine = m.isMine !== undefined ? m.isMine : (m.sender && m.sender.email === user?.email);
                const senderName = mine ? user?.full_name || user?.email : selectedThread.participant_name;
                const senderPic = mine ? null : selectedThread.participant_profile_picture;
                return (
                  <div key={m.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start items-end"}`}>
                    {!mine && (
                      <>
                        {senderPic ? (
                          <img src={senderPic} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0" style={{backgroundColor: 'var(--section)', color: 'var(--eco-primary)'}}>
                            {(senderName || "U").charAt(0)}
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex flex-col gap-1 max-w-xl">
                      {!mine && <div className="text-xs font-medium px-2" style={{color: 'var(--text-secondary)'}}>{senderName}</div>}
                      <div className="px-4 py-2 rounded-lg" style={{backgroundColor: mine ? 'var(--eco-primary)' : 'var(--bg)', color: mine ? 'white' : 'var(--text-primary)', border: mine ? 'none' : `1px solid var(--border)`}}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t flex gap-3 items-end flex-shrink-0" style={{backgroundColor: 'var(--bg)', borderColor: 'var(--border)'}}>
              <input
                ref={textInputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--card)'}}
              />
              <button onClick={send} className="text-white px-4 py-2 rounded-lg transition whitespace-nowrap" style={{backgroundColor: 'var(--eco-primary)'}} onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'} onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{color: 'var(--text-secondary)'}}>
            <svg className="w-20 h-20 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Select a conversation</h3>
              <p style={{color: 'var(--text-secondary)'}}>Choose a conversation from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
