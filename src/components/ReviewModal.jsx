import React, { useEffect, useMemo, useState } from "react";
import reviewAPI from "../api/review";
import { getErrorMessage } from "../utils/errorHandler";

function StarInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl leading-none transition hover:scale-110"
          aria-label={`Set rating to ${star}`}
        >
          <span className={star <= value ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function ReviewModal({
  isOpen,
  onClose,
  revieweeId,
  existingReviewId = null,
  initialReview = null,
  onSubmitted,
}) {
  const isEditMode = useMemo(() => !!existingReviewId, [existingReviewId]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const hydrate = async () => {
      setError("");
      setLoadingExisting(false);

      if (isEditMode) {
        if (initialReview) {
          setRating(Number(initialReview.rating) || 5);
          setComment(initialReview.comment || "");
          return;
        }

        setLoadingExisting(true);
        try {
          const review = await reviewAPI.getReviewByIdForUser(revieweeId, existingReviewId);
          if (!mounted) return;

          if (review) {
            setRating(Number(review.rating) || 5);
            setComment(review.comment || "");
          } else {
            setRating(5);
            setComment("");
          }
        } catch (err) {
          if (mounted) setError(getErrorMessage(err, "Failed to load review details."));
        } finally {
          if (mounted) setLoadingExisting(false);
        }
      } else {
        setRating(5);
        setComment("");
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, [isOpen, isEditMode, revieweeId, existingReviewId, initialReview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!revieweeId && !isEditMode) {
      setError("Could not identify the user to review.");
      return;
    }

    const parsed = Number(rating);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      setError("Rating must be an integer from 1 to 5.");
      return;
    }

    const payload = {
      rating: parsed,
      comment: comment.trim(),
    };

    setSubmitting(true);
    try {
      let result;
      if (isEditMode) {
        result = await reviewAPI.updateReview(existingReviewId, payload);
      } else {
        result = await reviewAPI.createReview({
          reviewee_id: revieweeId,
          ...payload,
        });
      }

      onSubmitted?.(result, isEditMode ? "edit" : "create");
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit review."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Edit Your Review" : "Rate This User"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {loadingExisting ? (
            <div className="text-sm text-gray-500">Loading your existing review...</div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <StarInput value={rating} onChange={setRating} />
                <p className="text-xs text-gray-500 mt-2">Choose from 1 to 5 stars.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="review-comment">
                  Comment
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  placeholder="Share your experience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : isEditMode ? "Update Review" : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
