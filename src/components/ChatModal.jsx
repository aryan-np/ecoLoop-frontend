import React, { useEffect, useState, useRef, useContext } from "react";
import { getMessages } from "../api/communications";
import AuthContext from "../auth/AuthProvider";

export default function ChatModal({ thread, onClose }) {
  const { access, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(null);
  const [text, setText] = useState("");
  const wsRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await getMessages(access, thread.id);
        if (mounted) {
          setMessages(res.results ? res.results.slice().reverse() : []);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    return () => (mounted = false);
  }, [thread, access]);

  useEffect(() => {
    // open websocket
    const url = `ws://127.0.0.1:8000/ws/chat/${thread.id}/`;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "message") {
            const msg = {
              id: Date.now(),
              content: data.body,
              created_at: new Date().toISOString(),
              sender: { email: data.sender_email || "other" },
            };
            setMessages((m) => [...m, msg]);
            // scroll into view
            setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 40);
          }
        } catch (err) {
          // ignore
        }
      };
    } catch (err) {
      // ignore
    }

    return () => {
      try {
        wsRef.current?.close();
      } catch {}
    };
  }, [thread.id]);

  function send() {
    if (!text.trim()) return;
    const payload = { type: "message", body: text };
    // optimistically append
    const localMsg = { id: Date.now(), content: text, created_at: new Date().toISOString(), sender: { email: user?.email } };
    setMessages((m) => [...m, localMsg]);
    wsRef.current?.send(JSON.stringify(payload));
    setText("");
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 40);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl h-5/6 rounded-t-lg md:rounded-lg overflow-hidden shadow-lg flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">{thread.user2_name || thread.user2_email}</div>
            <div className="text-sm text-gray-500">About: Vintage Wooden Chair</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>

        <div ref={listRef} className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {messages.map((m) => {
            const mine = m.sender && (m.sender.email === user?.email);
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`${mine ? 'bg-green-600 text-white' : 'bg-white border'} max-w-lg px-4 py-2 rounded-lg`}>{m.content}</div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t flex gap-3 items-center">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-lg border" />
          <button onClick={send} className="bg-green-600 text-white px-4 py-2 rounded-lg">Send</button>
        </div>
      </div>
    </div>
  );
}
