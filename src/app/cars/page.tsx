import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { getVehicles } from "@/lib/data";

type SearchParams = Promise<{ q?: string; body?: string }>;
export const dynamic = "force-dynamic";

export default async function CarsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const vehicles = await getVehicles({ listingType: "sale", published: true, query: params.q, bodyType: params.body });
  const all = await getVehicles({ listingType: "sale", published: true });
  const bodies = [...new Set(all.map((item) => item.body_type))].sort();

  return (
    <SiteShell>
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <p className="eyebrow">Cars for sale</p>
            <h1>Find a car that fits your life.</h1>
            <p>Browse StepOne&apos;s current sales catalogue, compare practical details and enquire directly with the team.</p>
          </div>
          <img src="/vehicles/white-suv-front.jpg" alt="White SUV at StepOne" />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <form className="panel search-bar">
            <input name="q" defaultValue={params.q} placeholder="Search make or model" />
            <select name="body" defaultValue={params.body ?? ""}>
              <option value="">All body types</option>
              {bodies.map((body) => <option key={body}>{body}</option>)}
            </select>
            <button className="button button-primary" type="submit">Search</button>
          </form>
          {vehicles.length ? (
            <div className="grid-3">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
          ) : (
            <div className="panel empty">No cars match those filters. <Link href="/cars">Reset filters</Link></div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
