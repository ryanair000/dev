import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions";
import { AdminNav } from "@/components/admin-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand brand-dark" aria-label="StepOne admin home">
          <img src="/step-one-logo.svg" alt="Step One Auto Dealers" className="brand-logo admin-logo" />
        </Link>
        <AdminNav />
        <form action={logoutAction}><button className="button button-ghost" type="submit">Sign out</button></form>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><strong>StepOne Management</strong><Link href="/" target="_blank" rel="noreferrer">View website ↗</Link></header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
