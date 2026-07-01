import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <p className="eyebrow">About StepOne</p>
            <h1>A smarter way to buy and hire cars in Nairobi.</h1>
            <p>StepOne combines quality vehicle listings, reliable self-drive rentals and direct human support in one clear experience.</p>
            <div className="hero-actions">
              <Link href="/cars" className="button button-primary">Browse cars</Link>
              <Link href="/rentals" className="button button-blue">Explore rentals</Link>
            </div>
          </div>
          <img src="/vehicles/showroom-silver-suv.jpg" alt="Vehicle ready for handover in a showroom" />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Our promise</p>
              <h2>Trust, convenience and useful information.</h2>
            </div>
          </div>
          <div className="grid-4">
            {[
              ["Clear listings", "Useful specifications, real photos and pricing information."],
              ["Direct support", "Speak to a real StepOne team member before you commit."],
              ["Flexible rentals", "Daily, weekly and monthly self-drive options."],
              ["Convenient location", "Vehicle viewing and collection in Kilimani."],
            ].map(([title, text]) => <div className="panel panel-pad" key={title}><h3>{title}</h3><p className="meta">{text}</p></div>)}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
