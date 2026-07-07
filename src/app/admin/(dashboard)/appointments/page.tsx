import { updateAppointmentStatusAction } from "@/app/admin-actions";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { getAppointments } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

type SearchParams = Promise<{ success?: string; error?: string }>;

export default async function AppointmentsAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const items = await getAppointments();

  return (
    <>
      <div className="admin-head"><div><h1>Appointments</h1><p>Manage vehicle viewings and test-drive requests.</p></div></div>
      <Flash success={params.success} error={params.error} />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Vehicle</th><th>Date</th><th>Type</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.full_name}</strong><br /><span className="meta">{item.phone}</span></td>
                <td>{item.vehicle?.make} {item.vehicle?.model}</td>
                <td>{formatDateTime(item.scheduled_at)}</td>
                <td>{item.appointment_type.replace("_", " ")}</td>
                <td><span className={`status status-${item.status}`}>{item.status.replace("_", " ")}</span></td>
                <td>
                  <form action={updateAppointmentStatusAction} className="admin-form-inline">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" defaultValue={item.status}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No-show</option></select>
                    <SubmitButton label="Save" pendingLabel="Saving..." className="button button-outline" />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">No appointments yet.</div>}
      </div>
    </>
  );
}
