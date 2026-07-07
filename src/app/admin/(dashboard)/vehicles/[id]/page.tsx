import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash } from "@/components/flash";
import { VehicleForm } from "@/components/vehicle-form";
import { getVehicleById } from "@/lib/data";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ saved?: string; error?: string }>;

export default async function EditVehiclePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const messages = await searchParams;
  const vehicle = await getVehicleById(id);
  if (!vehicle) notFound();

  const publicPath = vehicle.listing_type === "rental" ? `/rentals/${vehicle.slug}` : `/cars/${vehicle.slug}`;
  const success = messages.saved === "image"
    ? "Vehicle details and cover image updated successfully."
    : messages.saved
      ? "Vehicle details saved successfully."
      : undefined;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Edit {vehicle.make} {vehicle.model}</h1>
          <p>{vehicle.year} • {vehicle.body_type} • {vehicle.status}</p>
        </div>
        {vehicle.published && <Link className="button button-outline" href={publicPath} target="_blank">View listing ↗</Link>}
      </div>
      <Flash success={success} error={messages.error} />
      <VehicleForm vehicle={vehicle} />
    </>
  );
}
