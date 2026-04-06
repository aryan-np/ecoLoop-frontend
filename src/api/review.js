import apiClient from "./client";

function unwrapResult(response, fallback = null) {
  if (response && typeof response === "object" && "Result" in response) {
    return response.Result;
  }
  return response ?? fallback;
}

export async function getReviewsByUser(userId, page = 1) {
  const params = new URLSearchParams();
  params.append("user_id", userId);
  if (page) params.append("page", String(page));

  const response = await apiClient(`/api/reviews/?${params.toString()}`, { method: "GET" });
  return unwrapResult(response, { count: 0, next: null, previous: null, results: [] });
}

export async function getReviewSummary(userId) {
  const params = new URLSearchParams();
  params.append("user_id", userId);

  const response = await apiClient(`/api/reviews/summary/?${params.toString()}`, { method: "GET" });
  return unwrapResult(response, { average_rating: 0, total_count: 0, breakdown: {} });
}

export async function canReviewUser(revieweeId) {
  const params = new URLSearchParams();
  params.append("reviewee_id", revieweeId);

  const response = await apiClient(`/api/reviews/can_review/?${params.toString()}`, { method: "GET" });
  return unwrapResult(response, { can_review: false, already_reviewed: false, existing_review_id: null });
}

export async function createReview(payload) {
  const response = await apiClient("/api/reviews/", {
    method: "POST",
    body: payload,
  });
  return unwrapResult(response, response);
}

export async function updateReview(reviewId, payload) {
  const response = await apiClient(`/api/reviews/${reviewId}/`, {
    method: "PATCH",
    body: payload,
  });
  return unwrapResult(response, response);
}

export async function getReviewByIdForUser(revieweeId, reviewId, maxPages = 5) {
  if (!revieweeId || !reviewId) return null;

  let page = 1;
  while (page <= maxPages) {
    const paginated = await getReviewsByUser(revieweeId, page);
    const results = Array.isArray(paginated?.results) ? paginated.results : [];

    const found = results.find((item) => String(item.id) === String(reviewId));
    if (found) return found;
    if (!paginated?.next) break;

    page += 1;
  }

  return null;
}

const reviewAPI = {
  getReviewsByUser,
  getReviewSummary,
  canReviewUser,
  createReview,
  updateReview,
  getReviewByIdForUser,
};

export default reviewAPI;
