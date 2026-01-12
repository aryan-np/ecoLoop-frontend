import React, { useEffect, useState } from "react";
import AuthContext from "../auth/AuthProvider";
import { useContext } from "react";
import { getThreads } from "../api/communications";
import ChatModal from "./ChatModal";

function timeShort(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function MessageDropdown() {
  const { access, user } = useContext(AuthContext);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openThread, setOpenThread] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await getThreads(access);
        if (mounted) setThreads(res);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (access) load();
    return () => (mounted = false);
  }, [access]);

  const totalUnread = threads.reduce((s, t) => s + (t.unread_count || 0), 0);

  return (
    <div className="relative">
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalUnread}</span>
        )}
      </button>

      <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg overflow-hidden z-50">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-semibold">Messages</div>
          <div className="text-sm text-gray-500">{loading ? "Loading..." : `${threads.length} threads`}</div>
        </div>
        <div className="max-h-80 overflow-auto">
          {threads.length === 0 && !loading && (
            <div className="p-4 text-sm text-gray-500">No messages</div>
          )}
          {threads.map((t) => (
            <button key={t.id} onClick={() => setOpenThread(t)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 items-start border-b">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-semibold">{(t.user2_name||"U").charAt(0)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">{t.user2_name || t.user2_email || "Participant"}</div>
                  <div className="text-xs text-gray-400">{timeShort(t.updated_at || (t.last_message && t.last_message.created_at))}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{t.last_message ? t.last_message.content : "No messages yet"}</div>
              </div>
              {t.unread_count > 0 && <div className="ml-2 bg-green-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">{t.unread_count}</div>}
            </button>
          ))}
        </div>
        <div className="p-3 text-right border-t">
          <a href="/messages" className="text-sm text-green-600 hover:underline">View all</a>
        </div>
      </div>

      {openThread && (
        <ChatModal thread={openThread} onClose={() => setOpenThread(null)} />
      )}
    </div>
  );
}
