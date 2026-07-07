import { updateEnquiryStatusAction } from "@/app/admin-actions";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { getEnquiries } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

type SearchParams = Promise<{ success?: string; error?: string }>;

export default async function EnquiriesAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const items = await getEnquiries();

  return (
    <>
      <div className="admin-head"><div><h1>Sales enquiries</h1><p>Track customer interest and follow-up status.</p></div></div>
      <Flash success={params.success} error={params.error} />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Vehicle / type</th><th>Message</th><th>Status</th><th>Received</th><th>Update</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.full_name}</strong><br /><span className="meta">{item.phone}</span>{item.email && <><br /><span className="meta">{item.email}</span></>}</td>
                <td>{item.vehicle ? `${item.vehicle.make} ${item.vehicle.model}` : item.enquiry_type}</td>
                <td style={{ maxWidth: 300 }}>{item.message}</td>
                <td><span className={`status status-${item.status}`}>{item.status.replaceAll("_", " ")}</span></td>
                <td>{formatDateTime(item.created_at)}</td>
                <td>
                  <form action={updateEnquiryStatusAction} className="admin-form-inline">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" defaultValue={item.status}><option value="new">New</option><option value="contacted">Contacted</option><option value="follow_up">Follow-up</option><option value="closed">Closed</option></select>
                    <SubmitButton label="Save" pendingLabel="Saving..." className="button button-outline" />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">No enquiries yet.</div>}
      </div>
    </>
  );
}
