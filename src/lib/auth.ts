import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export async function requireAdmin() {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=Supabase%20is%20not%20configured");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims || data.claims.app_metadata?.stepone_admin !== true) {
    redirect("/admin/login");
  }
  return data.claims;
}
