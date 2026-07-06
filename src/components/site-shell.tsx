import Link from "next/link";
import type { ReactNode } from "react";
import { getBusinessSettings } from "@/lib/data";

export async function SiteShell({ children }: { children: ReactNode }) {
  const settings = await getBusinessSettings();
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="StepOne home">
            <img src="/step-one-logo.svg" alt="Step One Auto Dealers" className="brand-logo" />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/cars">Cars for Sale</Link>
            <Link href="/rentals">Car Rentals</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/about">About</Link>
            <Link href="/help">Help</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <a href={telHref} className="header-phone">{settings.phone}</a>
          <Link href="/contact" className="button button-primary">Enquire now</Link>
          <details className="mobile-menu">
            <summary>Menu</summary>
            <nav>
              <Link href="/cars">Cars for Sale</Link>
              <Link href="/rentals">Car Rentals</Link>
              <Link href="/reviews">Reviews</Link>
              <Link href="/about">About</Link>
              <Link href="/help">Help</Link>
              <Link href="/contact">Contact</Link>
              <a href={telHref}>{settings.phone}</a>
            </nav>
          </details>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link href="/" className="brand brand-dark" aria-label="StepOne home">
              <img src="/step-one-logo.svg" alt="Step One Auto Dealers" className="brand-logo footer-logo" />
            </Link>
            <p>{settings.tagline}</p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/cars">Cars for Sale</Link>
            <Link href="/rentals">Car Rentals</Link>
            <Link href="/reviews">Customer Reviews</Link>
            <Link href="/help">Rental Terms</Link>
          </div>
          <div>
            <h3>Contact</h3>
            <p>{settings.location}</p>
            <a href={telHref}>{settings.phone}</a>
            <p>{settings.email}</p>
            <p>{settings.opening_hours}</p>
          </div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} StepOne Autodealers. All rights reserved.</div>
      </footer>
    </div>
  );
}
