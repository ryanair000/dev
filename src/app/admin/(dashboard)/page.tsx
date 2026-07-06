import Link from "next/link";
import { getAppointments, getEnquiries, getRentalRequests, getVehicles } from "@/lib/data";
import { getAllReviews } from "@/lib/reviews";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const [vehicles, enquiries, rentals, appointments, reviews] = await Promise.all([
    getVehicles(),
    getEnquiries(),
    getRentalRequests(),
    getAppointments(),
    getAllReviews(),
  ]);

  const pendingReviews = reviews.filter((review) => review.status === "pending");
  const stats = [
    ["Total vehicles", vehicles.length],
    ["Cars for sale", vehicles.filter((vehicle) => vehicle.listing_type === "sale").length],
    ["Rental fleet", vehicles.filter((vehicle) => vehicle.listing_type === "rental").length],
    ["Requests needing review", enquiries.filter((item) => item.status === "new").length + rentals.filter((item) => item.status === "pending").length + appointments.filter((item) => item.status === "pending").length + pendingReviews.length],
  ];

  return (
    <>
      <div className="admin-head">
        <div><h1>Dealership overview</h1><p>Live activity across sales and rentals.</p></div>
        <Link href="/admin/vehicles/new" className="button button-primary">Add vehicle</Link>
      </div>
      <div className="stats">{stats.map(([label, value]) => <div className="stat" key={String(label)}><small>{label}</small><strong>{value}</strong></div>)}</div>
      <div className="detail-grid" style={{ marginTop: 24 }}>
        <section className="panel panel-pad">
          <div className="admin-head"><div><h2>Recent enquiries</h2></div><Link href="/admin/enquiries">View all →</Link></div>
          {enquiries.slice(0, 5).map((item) => <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}><strong>{item.full_name}</strong><p className="meta">{item.vehicle ? `${item.vehicle.make} ${item.vehicle.model}` : item.enquiry_type} • {formatDate(item.created_at)}</p></div>)}
          {!enquiries.length && <p className="meta">No enquiries yet.</p>}
        </section>
        <aside className="panel panel-pad">
          <div className="admin-head"><div><h2>Pending reviews</h2></div><Link href="/admin/reviews">Moderate →</Link></div>
          {pendingReviews.slice(0, 5).map((review) => <div key={review.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}><strong>{review.full_name}</strong><p className="meta">{"★".repeat(review.rating)} • {formatDate(review.created_at)}</p></div>)}
          {!pendingReviews.length && <p className="meta">No pending customer reviews.</p>}
          <div className="admin-head" style={{ marginTop: 24 }}><div><h2>Pending rentals</h2></div><Link href="/admin/rentals">Review →</Link></div>
          {rentals.filter((item) => item.status === "pending").slice(0, 3).map((item) => <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}><strong>{item.vehicle?.make} {item.vehicle?.model}</strong><p className="meta">{item.full_name} • {formatCurrency(item.estimated_amount)}</p></div>)}
          {!rentals.filter((item) => item.status === "pending").length && <p className="meta">No pending rental requests.</p>}
        </aside>
      </div>
    </>
  );
}
