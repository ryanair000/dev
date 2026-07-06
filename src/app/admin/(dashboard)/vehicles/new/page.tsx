import { Flash } from "@/components/flash";
import { VehicleForm } from "@/components/vehicle-form";

type SearchParams = Promise<{ error?: string }>;

export default async function NewVehiclePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Add a new vehicle</h1>
          <p>Create a complete sales or rental listing.</p>
        </div>
      </div>
      <Flash error={params.error} />
      <VehicleForm />
    </>
  );
}
