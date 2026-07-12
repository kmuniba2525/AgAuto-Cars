import React, { useEffect, useState } from "react";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

/**
 * AddReview
 *
 * Self-contained "write / update a review" form.
 * Manages its own rating + comment + existingReview state,
 * and reports the updated product back up via onReviewSubmitted
 * so the parent (ProductDetail) can refresh localProduct, rating, etc.
 *
 * Props:
 * - product:   the current product object (needs _id, reviews[])
 * - user:      current logged-in user (or null/undefined)
 * - axios:     axios instance from AppContext
 * - onReviewSubmitted(updatedProduct): called with the fresh product
 *              returned from the API after a successful submit
 */

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

const AddReview = ({ product, user, axios, onReviewSubmitted }) => {
  const { t } = useTranslation();

  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRating = hoverRating || ratingInput;
  const commentLimit = 500;

  // Keep form pre-filled if the logged-in user already reviewed this product
  useEffect(() => {
    if (product?.reviews && user) {
      const userReview = product.reviews.find(
        (review) => review.user?.toString() === user.id
      );

      if (userReview) {
        setExistingReview(userReview);
        setRatingInput(userReview.rating);
        setComment(userReview.comment);
      } else {
        setExistingReview(null);
        setRatingInput(5);
        setComment("");
      }
    }
  }, [product, user]);

  const submitReview = async () => {
    try {
      if (!user) {
        return toast.error(t("product_detail.toast_login_first"));
      }

      if (!comment.trim()) {
        return toast.error(t("product_detail.toast_comment_required"));
      }

      setIsSubmitting(true);

      const { data } = await axios.post(
        "/api/product/review",
        {
          productId: product._id,
          rating: ratingInput,
          comment,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);

        if (data.product) {
          onReviewSubmitted?.(data.product);

          const userReview = data.product.reviews.find(
            (review) => review.user?.toString() === user.id
          );

          setExistingReview(userReview);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* ambient gradient glow behind the card */}
      <div className="absolute -inset-1 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent rounded-2xl blur-xl opacity-70" />

      <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              {existingReview
                ? t("product_detail.update_your_review")
                : t("product_detail.write_a_review")}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share your experience with this vehicle
            </p>
          </div>

          {existingReview && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
              <FaCheckCircle className="text-[10px]" />
              {t("product_detail.already_reviewed")}
            </span>
          )}
        </div>

        {/* rating selector */}
        <div className="flex items-center gap-4 mb-6 bg-gray-50/80 rounded-xl px-4 py-3.5 border border-gray-100">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRatingInput(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform duration-150 hover:scale-125 active:scale-95"
              >
                <FaStar
                  className={`text-2xl transition-all duration-150 ${
                    star <= activeRating
                      ? "text-accent drop-shadow-[0_0_6px_rgba(217,119,6,0.45)]"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>

          <span
            key={activeRating}
            className="text-sm font-semibold text-gray-700 animate-[fadeIn_0.15s_ease-in]"
          >
            {RATING_LABELS[activeRating]}
          </span>
        </div>

        {/* comment */}
        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, commentLimit))}
            placeholder={t("product_detail.review_placeholder")}
            className="peer border border-gray-200 focus:border-primary outline-none rounded-xl w-full p-4 h-32 resize-none text-sm bg-white/80 transition-colors focus:ring-4 focus:ring-primary/10"
          />
          <span className="absolute bottom-3 right-4 text-[11px] text-gray-400 tabular-nums">
            {comment.length}/{commentLimit}
          </span>
        </div>

        {/* submit */}
        <button
          onClick={submitReview}
          disabled={isSubmitting}
          className="group relative w-full sm:w-auto mt-5 px-7 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden bg-gradient-to-r from-primary to-primary-dull shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/35 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isSubmitting
              ? "Submitting..."
              : existingReview
              ? t("product_detail.update_review")
              : t("product_detail.submit_review")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AddReview;
