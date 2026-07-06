import type { Review } from "@/types";

const reviewTypeLabels: Record<Review["review_type"], string> = {
  purchase: "Vehicle purchase",
  rental: "Car rental",
  service: "Customer service",
};

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="review-card">
      <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < review.rating ? "star-active" : "star-muted"}>★</span>
        ))}
      </div>
      {review.title && <h3>{review.title}</h3>}
      <p className="review-message">“{review.message}”</p>
      <footer>
        <strong>{review.full_name}</strong>
        <span>{reviewTypeLabels[review.review_type]}</span>
      </footer>
    </article>
  );
}
