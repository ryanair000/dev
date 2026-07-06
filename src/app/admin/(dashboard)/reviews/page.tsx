import { getAllReviews } from "@/lib/reviews";
import { formatDateTime } from "@/lib/utils";

type SearchParams = Promise<{ updated?: string; error?: string }>;

export default async function ReviewsAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const reviews = await getAllReviews();

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Customer reviews</h1>
          <p>Approve, feature or reject customer feedback before it appears publicly.</p>
        </div>
      </div>
      {params.updated && <div className="flash flash-success">Review updated successfully.</div>}
      {params.error && <div className="flash flash-error">{decodeURIComponent(params.error)}</div>}
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Rating</th><th>Review</th><th>Status</th><th>Received</th><th>Moderate</th></tr></thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td><strong>{review.full_name}</strong><br /><span className="meta">{review.review_type.replace("_", " ")}</span></td>
                <td><span className="review-stars admin-review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></td>
                <td style={{ maxWidth: 360 }}><strong>{review.title || "Untitled review"}</strong><br /><span>{review.message}</span></td>
                <td><span className={`status status-${review.status}`}>{review.status}</span>{review.featured && <><br /><span className="meta">Featured</span></>}</td>
                <td>{formatDateTime(review.created_at)}</td>
                <td>
                  <form action="/api/admin/reviews" method="post" className="review-admin-form">
                    <input type="hidden" name="id" value={review.id} />
                    <select name="status" defaultValue={review.status}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
                    <label className="inline-check"><input type="checkbox" name="featured" value="yes" defaultChecked={review.featured} /> Featured</label>
                    <button className="button button-outline" type="submit" name="action" value="update">Save</button>
                    <button className="button button-danger" type="submit" name="action" value="delete">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reviews.length && <div className="empty">No customer reviews have been submitted yet.</div>}
      </div>
    </>
  );
}
