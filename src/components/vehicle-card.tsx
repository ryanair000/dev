import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle } from "@/types";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const rental = vehicle.listing_type === "rental";
  const cover = vehicle.images?.find((image) => image.is_cover) ?? vehicle.images?.[0];
  const href = rental ? `/rentals/${vehicle.slug}` : `/cars/${vehicle.slug}`;
  return (
    <article className="vehicle-card">
      <Link href={href} className="vehicle-image-wrap" aria-label={`View ${vehicle.make} ${vehicle.model}`}>
        <img src={cover?.image_url || "/vehicles/showroom-silver-suv.jpg"} alt={cover?.alt_text || `${vehicle.make} ${vehicle.model}`} className="vehicle-image" />
        <span className={`pill ${rental ? "pill-blue" : "pill-red"}`}>{rental ? "Self-drive" : "For sale"}</span>
      </Link>
      <div className="vehicle-card-body">
        <p className="eyebrow">{vehicle.year} / {vehicle.body_type}</p>
        <h3>{vehicle.make} {vehicle.model}</h3>
        <p className="meta">{vehicle.transmission} / {vehicle.fuel_type} / {vehicle.seats ?? 5} seats</p>
        <div className="card-footer">
          <strong className={rental ? "text-blue" : "text-red"}>
            {rental ? `${formatCurrency(vehicle.daily_rate)}/day` : vehicle.contact_for_price ? "Contact for Price" : formatCurrency(vehicle.sale_price)}
          </strong>
          <Link href={href}>View details</Link>
        </div>
      </div>
    </article>
  );
}
