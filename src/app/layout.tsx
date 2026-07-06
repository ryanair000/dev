import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./reviews.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "StepOne Autodealers", template: "%s | StepOne Autodealers" },
  description: "Quality cars for sale and reliable self-drive rentals from Kilimani, Nairobi.",
  openGraph: { title: "StepOne Autodealers", description: "Buy. Hire. Drive with Confidence.", type: "website", locale: "en_KE" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
