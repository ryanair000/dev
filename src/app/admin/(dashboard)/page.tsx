import Link from "next/link";
import { getAppointments, getEnquiries, getRentalRequests, getVehicles } from "@/lib/data";
import { getAllReviews } from "@/lib/reviews";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default async function AdminDashboard() {
  const [vehicles, enquiries, rentals, appointments, reviews] = await Promise.all([
    getVehicles(),
    getEnquiries(),
    getRentalRequests(),
    getAppointments(),
    getAllReviews(),
  ]);

  const newEnquiries = enquiries.filter((item) => item.status === "new");
  const pendingRentals = rentals.filter((item) => item.status === "pending");
  const pendingAppointments = appointments.filter((item) => item.status === "pending");
  const pendingReviews = reviews.filter((review) => review.status === "pending");
  const stats = [
    ["Total vehicles", vehicles.length],
    ["Published listings", vehicles.filter((vehicle) => vehicle.published).length],
    ["New enquiries", newEnquiries.length],
    ["Items needing review", pendingRentals.length + pendingAppointments.length + pendingReviews.length],
  ];

  return (
    <>
      <div className="admin-head">
        <div><h1>Dealership overview</h1><p>Live activity across vehicle sales, rentals, appointments and reviews.</p></div>
        <Link href="/admin/vehicles/new" className="button button-primary">Add vehicle</Link>
      </div>

      <div className="stats">
        {stats.map(([label, value]) => <div className="stat" key={String(label)}><small>{label}</small><strong>{value}</strong></div>)}
      </div>

      <div className="detail-grid" style={{ marginTop: 24 }}>
        <section className="panel panel-pad">
          <div className="admin-head"><div><h2>Recent enquiries</h2><p>Latest customer interest.</p></div><Link href="/admin/enquiries">View all →</Link></div>
          {enquiries.slice(0, 5).map((item) => (
            <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <strong>{item.full_name}</strong>
              <p className="meta">{item.vehicle ? `${item.vehicle.make} ${item.vehicle.model}` : item.enquiry_type} • {formatDate(item.created_at)}</p>
            </div>
          ))}
          {!enquiries.length && <p className="meta">No enquiries yet.</p>}
        </section>

        <aside className="panel panel-pad">
          <div className="admin-head"><div><h2>Pending rentals</h2></div><Link href="/admin/rentals">Review →</Link></div>
          {pendingRentals.slice(0, 3).map((item) => (
            <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <strong>{item.vehicle?.make} {item.vehicle?.model}</strong>
              <p className="meta">{item.full_name} • {formatCurrency(item.estimated_amount)}</p>
            </div>
          ))}
          {!pendingRentals.length && <p className="meta">No pending rental requests.</p>}
        </aside>
      </div>

      <div className="detail-grid" style={{ marginTop: 24 }}>
        <section className="panel panel-pad">
          <div className="admin-head"><div><h2>Pending appointments</h2></div><Link href="/admin/appointments">Manage →</Link></div>
          {pendingAppointments.slice(0, 4).map((item) => (
            <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <strong>{item.full_name} — {item.vehicle?.make} {item.vehicle?.model}</strong>
              <p className="meta">{item.appointment_type.replace("_", " ")} • {formatDateTime(item.scheduled_at)}</p>
            </div>
          ))}
          {!pendingAppointments.length && <p className="meta">No pending appointments.</p>}
        </section>

        <aside className="panel panel-pad">
          <div className="admin-head"><div><h2>Pending reviews</h2></div><Link href="/admin/reviews">Moderate →</Link></div>
          {pendingReviews.slice(0, 4).map((review) => (
            <div key={review.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <strong>{review.full_name}</strong>
              <p className="meta">{"★".repeat(review.rating)} • {formatDate(review.created_at)}</p>
            </div>
          ))}
          {!pendingReviews.length && <p className="meta">No pending customer reviews.</p>}
        </aside>
      </div>
    </>
  );
}
