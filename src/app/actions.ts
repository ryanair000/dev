"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getVehicleById } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  makeReference,
  safeReturnTo,
  slugify,
} from "@/lib/utils";

const emailField = z.string().trim().email().optional().or(z.literal(""));
const phoneField = z.string().trim().min(9).max(30);
const nameField = z.string().trim().min(2).max(120);

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=Supabase%20is%20not%20configured");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect("/admin/login?error=Invalid%20email%20or%20password");
  if (data.user.app_metadata?.stepone_admin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=This%20account%20is%20not%20a%20StepOne%20administrator");
  }
  redirect("/admin");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function createEnquiryAction(formData: FormData) {
  const schema = z.object({
    full_name: nameField,
    phone: phoneField,
    email: emailField,
    enquiry_type: z.string().trim().min(2).max(80),
    preferred_contact: z.enum(["WhatsApp", "Phone", "Email"]),
    message: z.string().trim().min(5).max(1600),
    vehicle_id: z.string().uuid().optional().or(z.literal("")),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  const returnTo = safeReturnTo(formData.get("return_to"), "/contact");
  if (!parsed.success) redirect(`${returnTo}?error=Please%20check%20the%20form%20details`);
  if (!isSupabaseConfigured()) redirect(`${returnTo}?sent=demo&ref=${makeReference("ENQ")}`);

  const supabase = await createClient();
  const { error } = await supabase.from("stepone_enquiries").insert({
    reference: makeReference("ENQ"),
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    enquiry_type: parsed.data.enquiry_type,
    preferred_contact: parsed.data.preferred_contact,
    message: parsed.data.message,
    vehicle_id: parsed.data.vehicle_id || null,
  });
  if (error) {
    console.error(error);
    redirect(`${returnTo}?error=We%20could%20not%20send%20your%20enquiry`);
  }
  revalidatePath("/admin/enquiries");
  redirect(`${returnTo}?sent=enquiry`);
}

export async function createRentalRequestAction(formData: FormData) {
  const schema = z.object({
    vehicle_id: z.string().uuid(),
    full_name: nameField,
    phone: phoneField,
    email: emailField,
    preferred_contact: z.enum(["WhatsApp", "Phone", "Email"]),
    pickup_date: z.string().min(1),
    pickup_time: z.string().min(1),
    return_date: z.string().min(1),
    return_time: z.string().min(1),
    pickup_location: z.string().trim().min(2).max(180),
    message: z.string().trim().max(1200).optional().or(z.literal("")),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  const returnTo = safeReturnTo(formData.get("return_to"), "/rentals/request");
  if (!parsed.success) redirect(`${returnTo}?error=Please%20check%20your%20rental%20details`);

  const pickupAt = new Date(`${parsed.data.pickup_date}T${parsed.data.pickup_time}:00`);
  const returnAt = new Date(`${parsed.data.return_date}T${parsed.data.return_time}:00`);
  if (!Number.isFinite(pickupAt.valueOf()) || !Number.isFinite(returnAt.valueOf()) || pickupAt <= new Date() || returnAt <= pickupAt) {
    redirect(`${returnTo}?error=Choose%20valid%20future%20pickup%20and%20return%20times`);
  }
  const vehicle = await getVehicleById(parsed.data.vehicle_id);
  if (!vehicle || vehicle.listing_type !== "rental") redirect(`${returnTo}?error=The%20selected%20rental%20is%20not%20available`);
  const days = Math.max(1, Math.ceil((returnAt.valueOf() - pickupAt.valueOf()) / 86_400_000));
  const estimate = vehicle.daily_rate ? vehicle.daily_rate * days : null;
  if (!isSupabaseConfigured()) redirect(`${returnTo}?sent=demo&ref=${makeReference("SR")}`);

  const supabase = await createClient();
  const { error } = await supabase.from("stepone_rental_requests").insert({
    reference: makeReference("SR"),
    vehicle_id: parsed.data.vehicle_id,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    preferred_contact: parsed.data.preferred_contact,
    pickup_at: pickupAt.toISOString(),
    return_at: returnAt.toISOString(),
    pickup_location: parsed.data.pickup_location,
    message: parsed.data.message || null,
    estimated_amount: estimate,
  });
  if (error) {
    console.error(error);
    redirect(`${returnTo}?error=We%20could%20not%20submit%20the%20rental%20request`);
  }
  revalidatePath("/admin/rentals");
  redirect(`${returnTo}?sent=rental`);
}

export async function createAppointmentAction(formData: FormData) {
  const schema = z.object({
    vehicle_id: z.string().uuid(),
    full_name: nameField,
    phone: phoneField,
    email: emailField,
    appointment_type: z.enum(["viewing", "test_drive"]),
    scheduled_date: z.string().min(1),
    scheduled_time: z.string().min(1),
    licence_confirmed: z.string().optional(),
    message: z.string().trim().max(1200).optional().or(z.literal("")),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  const returnTo = safeReturnTo(formData.get("return_to"), "/cars");
  if (!parsed.success) redirect(`${returnTo}?error=Please%20check%20the%20appointment%20details`);
  if (parsed.data.appointment_type === "test_drive" && parsed.data.licence_confirmed !== "yes") {
    redirect(`${returnTo}?error=Confirm%20that%20you%20have%20a%20valid%20driving%20licence`);
  }
  const scheduledAt = new Date(`${parsed.data.scheduled_date}T${parsed.data.scheduled_time}:00`);
  if (!Number.isFinite(scheduledAt.valueOf()) || scheduledAt <= new Date()) {
    redirect(`${returnTo}?error=Choose%20a%20future%20appointment%20time`);
  }
  if (!isSupabaseConfigured()) redirect(`${returnTo}?sent=demo&ref=${makeReference("APT")}`);
  const supabase = await createClient();
  const { error } = await supabase.from("stepone_appointments").insert({
    reference: makeReference("APT"),
    vehicle_id: parsed.data.vehicle_id,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    appointment_type: parsed.data.appointment_type,
    scheduled_at: scheduledAt.toISOString(),
    licence_confirmed: parsed.data.licence_confirmed === "yes",
    message: parsed.data.message || null,
  });
  if (error) {
    console.error(error);
    redirect(`${returnTo}?error=We%20could%20not%20submit%20the%20appointment`);
  }
  revalidatePath("/admin/appointments");
  redirect(`${returnTo}?sent=appointment`);
}

const vehicleSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  listing_type: z.enum(["sale", "rental"]),
  make: z.string().trim().min(2).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.coerce.number().int().min(1980).max(2100),
  body_type: z.string().trim().min(2).max(60),
  color: z.string().trim().max(60).optional().or(z.literal("")),
  mileage: z.string().optional(),
  transmission: z.string().trim().min(2).max(50),
  fuel_type: z.string().trim().min(2).max(50),
  engine_capacity: z.string().trim().max(60).optional().or(z.literal("")),
  seats: z.string().optional(),
  drive_type: z.string().trim().max(50).optional().or(z.literal("")),
  luggage_capacity: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().min(2).max(180),
  sale_price: z.string().optional(),
  contact_for_price: z.string().optional(),
  daily_rate: z.string().optional(),
  weekly_rate: z.string().optional(),
  monthly_rate: z.string().optional(),
  description: z.string().trim().min(20).max(5000),
  features: z.string().trim().max(2500),
  status: z.enum(["available", "reserved", "rented", "sold", "maintenance", "unavailable", "draft"]),
  featured: z.string().optional(),
  published: z.string().optional(),
});

function numberOrNull(value?: string) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

export async function saveVehicleAction(formData: FormData) {
  await requireAdmin();
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/vehicles?error=Please%20check%20the%20vehicle%20details");
  const v = parsed.data;
  const salePrice = numberOrNull(v.sale_price);
  const dailyRate = numberOrNull(v.daily_rate);
  const contactForPrice = v.contact_for_price === "yes";
  if (v.listing_type === "sale" && !contactForPrice && !salePrice) redirect("/admin/vehicles?error=Add%20a%20sale%20price%20or%20enable%20contact%20for%20price");
  if (v.listing_type === "rental" && !dailyRate) redirect("/admin/vehicles?error=Add%20a%20daily%20rental%20rate");

  const supabase = await createClient();
  const payload = {
    listing_type: v.listing_type,
    make: v.make,
    model: v.model,
    year: v.year,
    body_type: v.body_type,
    color: v.color || null,
    mileage: numberOrNull(v.mileage),
    transmission: v.transmission,
    fuel_type: v.fuel_type,
    engine_capacity: v.engine_capacity || null,
    seats: numberOrNull(v.seats),
    drive_type: v.drive_type || null,
    luggage_capacity: v.luggage_capacity || null,
    location: v.location,
    sale_price: v.listing_type === "sale" ? salePrice : null,
    contact_for_price: v.listing_type === "sale" ? contactForPrice : false,
    daily_rate: v.listing_type === "rental" ? dailyRate : null,
    weekly_rate: v.listing_type === "rental" ? numberOrNull(v.weekly_rate) : null,
    monthly_rate: v.listing_type === "rental" ? numberOrNull(v.monthly_rate) : null,
    description: v.description,
    features: v.features.split(",").map((item) => item.trim()).filter(Boolean),
    status: v.status,
    featured: v.featured === "yes",
    published: v.published === "yes",
  };

  let vehicleId = v.id || "";
  if (vehicleId) {
    const { error } = await supabase.from("stepone_vehicles").update(payload).eq("id", vehicleId);
    if (error) redirect(`/admin/vehicles/${vehicleId}?error=${encodeURIComponent(error.message)}`);
  } else {
    const { data, error } = await supabase
      .from("stepone_vehicles")
      .insert({ ...payload, slug: `${slugify(`${v.year}-${v.make}-${v.model}`)}-${Date.now().toString().slice(-5)}` })
      .select("id")
      .single();
    if (error || !data) redirect(`/admin/vehicles?error=${encodeURIComponent(error?.message ?? "Could not create vehicle")}`);
    vehicleId = data.id;
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 5 * 1024 * 1024) {
      redirect(`/admin/vehicles/${vehicleId}?error=Image%20must%20be%20JPG%2C%20PNG%20or%20WebP%20under%205MB`);
    }
    const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${vehicleId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("stepone-vehicle-images")
      .upload(storagePath, image, { contentType: image.type, upsert: false });
    if (uploadError) redirect(`/admin/vehicles/${vehicleId}?error=${encodeURIComponent(uploadError.message)}`);
    const { data: publicUrl } = supabase.storage.from("stepone-vehicle-images").getPublicUrl(storagePath);
    const { count } = await supabase.from("stepone_vehicle_images").select("id", { count: "exact", head: true }).eq("vehicle_id", vehicleId);
    await supabase.from("stepone_vehicle_images").insert({
      vehicle_id: vehicleId,
      image_url: publicUrl.publicUrl,
      storage_path: storagePath,
      alt_text: `${v.year} ${v.make} ${v.model}`,
      sort_order: count ?? 0,
      is_cover: (count ?? 0) === 0,
    });
  }

  revalidatePath("/");
  revalidatePath("/cars");
  revalidatePath("/rentals");
  revalidatePath("/admin/vehicles");
  redirect(`/admin/vehicles/${vehicleId}?saved=1`);
}

export async function updateEnquiryStatusAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("stepone_enquiries").update({ status: String(formData.get("status")) }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/enquiries");
}

export async function updateRentalStatusAction(formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  const supabase = await createClient();
  await supabase.from("stepone_rental_requests").update({
    status,
    internal_notes: String(formData.get("internal_notes") ?? "") || null,
    approved_at: status === "approved" ? new Date().toISOString() : null,
  }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/calendar");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("stepone_appointments").update({ status: String(formData.get("status")) }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/appointments");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("stepone_business_settings").upsert({
    id: true,
    business_name: String(formData.get("business_name") ?? ""),
    rental_name: String(formData.get("rental_name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    location: String(formData.get("location") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    opening_hours: String(formData.get("opening_hours") ?? ""),
    currency: "KES",
  });
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=settings");
}

export async function saveHomepageAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("stepone_site_content").upsert({
    key: "homepage",
    content: {
      eyebrow: String(formData.get("eyebrow") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      supporting_text: String(formData.get("supporting_text") ?? ""),
      primary_button: String(formData.get("primary_button") ?? ""),
      secondary_button: String(formData.get("secondary_button") ?? ""),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=homepage");
}
