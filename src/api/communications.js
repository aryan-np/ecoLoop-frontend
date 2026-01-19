const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function getThreads(token) {
  const res = await fetch(`${BASE}/api/communications/threads/`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.Result || [];
}

export async function getMessages(token, threadId, page = null) {
  const url = new URL(`${BASE}/api/communications/messages`);
  url.searchParams.set("thread_id", threadId);
  if (page) url.searchParams.set("page", page);

  const res = await fetch(url.toString(), {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.Result || { results: [], count: 0 };
}

export async function createThreadAndSendMessage(token, recipientId, message, productId = null) {
  const res = await fetch(`${BASE}/api/communications/threads/`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user2: recipientId,
      message: message,
      product: productId,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.Result || json;
}

export async function sendMessage(token, threadId, message) {
  const res = await fetch(`${BASE}/api/communications/messages/`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      thread_id: threadId,
      message: message,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.Result || json;
}
