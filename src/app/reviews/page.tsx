import { ReviewCard } from "@/components/review-card";
import { SiteShell } from "@/components/site-shell";
import { getApprovedReviews } from "@/lib/reviews";

type SearchParams = Promise<{ sent?: string; error?: string }>;
export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const reviews = await getApprovedReviews();

  return (
    <SiteShell>
      <section className="page-hero page-hero-blue">
        <div className="container page-hero-grid">
          <div>
            <p className="eyebrow">Customer reviews</p>
            <h1>Real experiences from StepOne customers.</h1>
            <p>Read approved feedback from buyers, renters and customers who worked with the StepOne team.</p>
          </div>
          <div className="review-summary-card">
            <span className="review-summary-stars">★★★★★</span>
            <strong>Share your StepOne experience</strong>
            <p>Every review is checked before it appears publicly.</p>
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Published feedback</p>
              <h2>What customers are saying.</h2>
            </div>
          </div>
          {reviews.length ? (
            <div className="review-grid">
              {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          ) : (
            <div className="panel empty">No reviews have been published yet. Be the first to share your experience below.</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container narrow-container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Leave a review</p>
              <h2>Tell us how we did.</h2>
              <p>Your review will be submitted for approval before it appears on the website.</p>
            </div>
          </div>
          {params.sent && <div className="flash flash-success">Thank you. Your review was submitted and is awaiting approval.</div>}
          {params.error && <div className="flash flash-error">{decodeURIComponent(params.error)}</div>}
          <form action="/api/reviews" method="post" className="panel form-grid">
            <div className="field"><label>Full name</label><input name="full_name" required /></div>
            <div className="field"><label>Rating</label><select name="rating" defaultValue="5" required><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></div>
            <div className="field"><label>Experience</label><select name="review_type" defaultValue="purchase"><option value="purchase">Vehicle purchase</option><option value="rental">Car rental</option><option value="service">Customer service</option></select></div>
            <div className="field"><label>Review title</label><input name="title" maxLength={120} placeholder="A short summary" /></div>
            <div className="field field-full"><label>Your review</label><textarea name="message" rows={6} minLength={10} maxLength={1200} required /></div>
            <div className="field field-full"><button className="button button-primary" type="submit">Submit review</button></div>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
