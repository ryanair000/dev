import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { getBusinessSettings, getHomepageContent, getVehicles } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sales, rentals, content, settings] = await Promise.all([
    getVehicles({ listingType: "sale", published: true, featured: true }),
    getVehicles({ listingType: "rental", published: true, featured: true }),
    getHomepageContent(),
    getBusinessSettings(),
  ]);
  const eyebrow = content?.eyebrow || "Kilimani, Nairobi";
  const headline = content?.headline || "Buy or hire your next car with confidence.";
  const supporting = content?.supporting_text || "StepOne Auto Dealers pairs a curated sales yard with practical self-drive rentals, clear details and direct support.";
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;

  return (
    <SiteShell>
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <img src="/vehicles/showroom-silver-suv.jpg" alt="" />
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <img src="/step-one-logo.svg" alt="Step One Auto Dealers" className="hero-logo" />
            <span className="pill pill-gold">{eyebrow}</span>
            <h1>{headline}</h1>
            <p>{supporting}</p>
            <div className="hero-actions">
              <Link href="/cars" className="button button-primary">{content?.primary_button || "Browse cars for sale"}</Link>
              <Link href="/rentals" className="button button-blue">{content?.secondary_button || "Explore rentals"}</Link>
              <a href={telHref} className="button button-ghost">{settings.phone}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Cars for sale</p>
              <h2>Featured vehicles worth viewing.</h2>
              <p>Clear prices, useful specifications and direct enquiry options for buyers in Nairobi.</p>
            </div>
            <Link href="/cars" className="button button-outline">View all cars</Link>
          </div>
          <div className="grid-3">{sales.slice(0, 3).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
        </div>
      </section>

      <section className="section section-white">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Self-drive rentals</p>
              <h2>Daily, weekly and monthly rental options.</h2>
              <p>Request a clean, reliable vehicle and get confirmation from the StepOne team.</p>
            </div>
            <Link href="/rentals" className="button button-blue">Explore rentals</Link>
          </div>
          <div className="grid-3">{rentals.slice(0, 3).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
        </div>
      </section>

      <section className="section proof-band">
        <div className="container proof-grid">
          {[
            ["Curated stock", "Vehicles are presented with practical specs, condition notes and real photos."],
            ["Direct support", "Call, WhatsApp or send a form enquiry without creating an account."],
            ["Rental-ready", "Short and long-term hire requests are reviewed before confirmation."],
            ["Kilimani access", "Convenient location for viewings, pickups and returns around Nairobi."],
          ].map(([title, text]) => (
            <div className="proof-item" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
