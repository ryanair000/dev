import Link from "next/link";
import type { ReactNode } from "react";
import { getBusinessSettings } from "@/lib/data";

export async function SiteShell({ children }: { children: ReactNode }) {
  const settings = await getBusinessSettings();
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="StepOne home">
            <span className="brand-mark">S</span>
            <span><strong>STEPONE</strong><small>AUTODEALERS</small></span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/cars">Cars for Sale</Link>
            <Link href="/rentals">Car Rentals</Link>
            <Link href="/about">About</Link>
            <Link href="/help">Help</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <Link href="/contact" className="button button-primary">Enquire now</Link>
          <details className="mobile-menu">
            <summary>Menu</summary>
            <nav>
              <Link href="/cars">Cars for Sale</Link>
              <Link href="/rentals">Car Rentals</Link>
              <Link href="/about">About</Link>
              <Link href="/help">Help</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </details>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand brand-dark"><span className="brand-mark">S</span><span><strong>STEPONE</strong><small>AUTODEALERS</small></span></div>
            <p>{settings.tagline}</p>
          </div>
          <div><h3>Explore</h3><Link href="/cars">Cars for Sale</Link><Link href="/rentals">Car Rentals</Link><Link href="/help">Rental Terms</Link></div>
          <div><h3>Contact</h3><p>{settings.location}</p><p>{settings.phone}</p><p>{settings.email}</p><p>{settings.opening_hours}</p></div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} StepOne Autodealers. All rights reserved.</div>
      </footer>
    </div>
  );
}
