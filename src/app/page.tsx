import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { getHomepageContent, getVehicles } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sales, rentals, content] = await Promise.all([
    getVehicles({ listingType: "sale", published: true, featured: true }),
    getVehicles({ listingType: "rental", published: true, featured: true }),
    getHomepageContent(),
  ]);
  const eyebrow = content?.eyebrow || "Kilimani • Nairobi";
  const headline = content?.headline || "Your next car starts with StepOne.";
  const supporting = content?.supporting_text || "Buy confidently or request a reliable self-drive rental — all from one trusted automotive partner.";
  return (
    <SiteShell>
      <section className="hero">
        <div className="container hero-grid">
          <div><span className="pill pill-gold">{eyebrow}</span><h1>{headline}</h1><p>{supporting}</p><div className="hero-actions"><Link href="/cars" className="button button-primary">{content?.primary_button || "Browse cars for sale"}</Link><Link href="/rentals" className="button button-blue">{content?.secondary_button || "Explore rentals"}</Link></div></div>
          <div className="hero-visual"><img src="/car.svg" alt="StepOne vehicle" /></div>
        </div>
      </section>
      <section className="section"><div className="container"><div className="section-head"><div><p className="eyebrow">Cars for sale</p><h2>Featured vehicles worth driving.</h2><p>Clear prices, useful specifications and direct enquiry options.</p></div><Link href="/cars" className="button button-outline">View all cars</Link></div><div className="grid-3">{sales.slice(0,3).map((vehicle)=><VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div></div></section>
      <section className="section section-white"><div className="container"><div className="section-head"><div><p className="eyebrow">Self-drive rentals</p><h2>Drive Nairobi your way.</h2><p>Daily, weekly and monthly options. Every request is reviewed by StepOne.</p></div><Link href="/rentals" className="button button-blue">Explore rentals</Link></div><div className="grid-3">{rentals.slice(0,3).map((vehicle)=><VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div></div></section>
      <section className="section"><div className="container"><div className="section-head"><div><p className="eyebrow">Why StepOne</p><h2>Simple choices. Direct support.</h2></div></div><div className="grid-4">{[["Curated selection","Well-presented cars with practical specifications."],["Direct support","Talk to the team without creating an account."],["Easy rental requests","Choose dates and wait for confirmation."],["Kilimani location","Convenient access from across Nairobi."]].map(([title,text])=><div className="panel panel-pad" key={title}><h3>{title}</h3><p className="meta">{text}</p></div>)}</div></div></section>
    </SiteShell>
  );
}
