"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(path: string, key: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [key]: message });
  redirect(`${path}?${params.toString()}`);
}

const idSchema = z.string().uuid();

export async function updateEnquiryStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: idSchema,
    status: z.enum(["new", "contacted", "follow_up", "closed"]),
  }).safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) redirectWithMessage("/admin/enquiries", "error", "Please choose a valid enquiry status.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_enquiries")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id")
    .single();

  if (error || !data) {
    console.error("enquiry status update failed", error);
    redirectWithMessage("/admin/enquiries", "error", "The enquiry status could not be updated.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  redirectWithMessage("/admin/enquiries", "success", "Enquiry status updated successfully.");
}

export async function updateRentalStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: idSchema,
    status: z.enum(["pending", "approved", "rejected", "active", "completed", "cancelled"]),
    internal_notes: z.string().trim().max(1500).optional().or(z.literal("")),
  }).safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) redirectWithMessage("/admin/rentals", "error", "Please check the rental decision and private note.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_rental_requests")
    .update({
      status: parsed.data.status,
      internal_notes: parsed.data.internal_notes || null,
      approved_at: parsed.data.status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.id)
    .select("id")
    .single();

  if (error || !data) {
    console.error("rental status update failed", error);
    redirectWithMessage("/admin/rentals", "error", "The rental request could not be updated.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/calendar");
  redirectWithMessage("/admin/rentals", "success", "Rental request updated successfully.");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: idSchema,
    status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
  }).safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) redirectWithMessage("/admin/appointments", "error", "Please choose a valid appointment status.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id")
    .single();

  if (error || !data) {
    console.error("appointment status update failed", error);
    redirectWithMessage("/admin/appointments", "error", "The appointment could not be updated.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  redirectWithMessage("/admin/appointments", "success", "Appointment updated successfully.");
}

const settingsSchema = z.object({
  business_name: z.string().trim().min(2).max(120),
  rental_name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(180),
  location: z.string().trim().min(2).max(180),
  phone: z.string().trim().min(7).max(40),
  whatsapp: z.string().trim().regex(/^\+?\d{9,15}$/),
  email: z.string().trim().email(),
  opening_hours: z.string().trim().min(2).max(180),
});

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirectWithMessage("/admin/settings", "error", "Please check the business contact details and WhatsApp number.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_business_settings")
    .upsert({ id: true, ...parsed.data, currency: "KES" })
    .select("id")
    .single();

  if (error || !data) {
    console.error("business settings save failed", error);
    redirectWithMessage("/admin/settings", "error", "Business settings could not be saved.");
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  redirectWithMessage("/admin/settings", "success", "Business settings saved successfully.");
}

const homepageSchema = z.object({
  eyebrow: z.string().trim().min(2).max(80),
  headline: z.string().trim().min(5).max(180),
  supporting_text: z.string().trim().min(10).max(600),
  primary_button: z.string().trim().min(2).max(60),
  secondary_button: z.string().trim().min(2).max(60),
});

export async function saveHomepageAction(formData: FormData) {
  await requireAdmin();
  const parsed = homepageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirectWithMessage("/admin/settings", "error", "Please complete all homepage content fields.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_site_content")
    .upsert({ key: "homepage", content: parsed.data })
    .select("key")
    .single();

  if (error || !data) {
    console.error("homepage content save failed", error);
    redirectWithMessage("/admin/settings", "error", "Homepage content could not be saved.");
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirectWithMessage("/admin/settings", "success", "Homepage content saved successfully.");
}
