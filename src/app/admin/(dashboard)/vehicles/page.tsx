import Link from "next/link";
import { Flash } from "@/components/flash";
import { getVehicles } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

type SearchParams = Promise<{ success?: string; error?: string }>;

export default async function VehiclesAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const vehicles = await getVehicles();

  return (
    <>
      <div className="admin-head">
        <div><h1>Vehicle inventory</h1><p>Manage sales and rental listings, visibility and cover images.</p></div>
        <Link href="/admin/vehicles/new" className="button button-primary">Add vehicle</Link>
      </div>
      <Flash success={params.success} error={params.error} />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Vehicle</th><th>Listing</th><th>Price / rate</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead>
          <tbody>
            {vehicles.map((vehicle) => {
              const cover = vehicle.images?.find((image) => image.is_cover) ?? vehicle.images?.[0];
              return (
                <tr key={vehicle.id}>
                  <td>
                    <div className="admin-table-vehicle">
                      <img className="admin-table-thumb" src={cover?.image_url || "/vehicles/showroom-silver-suv.jpg"} alt="" />
                      <div>
                        <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong>
                        <div className="admin-badges">
                          <span className="admin-badge">{vehicle.body_type}</span>
                          <span className={`admin-badge ${vehicle.published ? "admin-badge-live" : ""}`}>{vehicle.published ? "Published" : "Not published"}</span>
                          {vehicle.featured && <span className="admin-badge">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{vehicle.listing_type}</td>
                  <td>{vehicle.listing_type === "sale" ? (vehicle.contact_for_price ? "Contact for Price" : formatCurrency(vehicle.sale_price)) : `${formatCurrency(vehicle.daily_rate)}/day`}</td>
                  <td><span className={`status status-${vehicle.status}`}>{vehicle.status}</span></td>
                  <td>{formatDate(vehicle.updated_at)}</td>
                  <td><Link href={`/admin/vehicles/${vehicle.id}`}>Edit →</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!vehicles.length && <div className="empty">No vehicles have been added yet.</div>}
      </div>
    </>
  );
}
