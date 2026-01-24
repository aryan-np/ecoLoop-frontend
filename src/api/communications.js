import apiClient from "./client";

export async function getThreads() {
  const result = await apiClient("/api/communications/threads/", { method: "GET" });
  return result?.Result || [];
}

export async function getMessages(threadId, page = null) {
  let url = `/api/communications/messages?thread_id=${threadId}`;
  if (page) url += `&page=${page}`;

  const result = await apiClient(url, { method: "GET" });
  return result?.Result || { results: [], count: 0 };
}

export async function createThreadAndSendMessage(token, recipientId, message, productId = null) {
  const result = await apiClient("/api/communications/threads/", {
    method: "POST",
    body: {
      user2: recipientId,
      message: message,
      product: productId,
    },
  });
  return result?.Result || result;
}

export async function sendMessage(threadId, message) {
  const result = await apiClient("/api/communications/messages/", {
    method: "POST",
    body: {
      thread_id: threadId,
      message: message,
    },
  });
  return result?.Result || result;
}
