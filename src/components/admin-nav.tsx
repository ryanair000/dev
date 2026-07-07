"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/admin", "Overview"],
  ["/admin/vehicles", "Vehicles"],
  ["/admin/enquiries", "Sales Enquiries"],
  ["/admin/rentals", "Rental Requests"],
  ["/admin/appointments", "Appointments"],
  ["/admin/reviews", "Customer Reviews"],
  ["/admin/calendar", "Rental Calendar"],
  ["/admin/settings", "Website Settings"],
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation">
      {links.map(([href, label]) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return <Link key={href} href={href} className={active ? "active" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
