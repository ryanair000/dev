import { updateRentalStatusAction } from "@/app/admin-actions";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { getRentalRequests } from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type SearchParams = Promise<{ success?: string; error?: string }>;

export default async function RentalsAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const items = await getRentalRequests();

  return (
    <>
      <div className="admin-head"><div><h1>Rental requests</h1><p>Review dates, availability and customer details.</p></div></div>
      <Flash success={params.success} error={params.error} />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Vehicle</th><th>Pickup</th><th>Return</th><th>Estimate</th><th>Status</th><th>Decision</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.full_name}</strong><br /><span className="meta">{item.phone} • {item.reference}</span></td>
                <td>{item.vehicle?.make} {item.vehicle?.model}</td>
                <td>{formatDateTime(item.pickup_at)}</td>
                <td>{formatDateTime(item.return_at)}</td>
                <td>{formatCurrency(item.estimated_amount)}</td>
                <td><span className={`status status-${item.status}`}>{item.status}</span></td>
                <td>
                  <form action={updateRentalStatusAction} className="admin-form-stack">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" defaultValue={item.status}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
                    <input name="internal_notes" defaultValue={item.internal_notes ?? ""} placeholder="Private note" />
                    <SubmitButton label="Save decision" pendingLabel="Saving..." className="button button-blue" />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">No rental requests yet.</div>}
      </div>
    </>
  );
}
