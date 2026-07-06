import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, makeReference, slugify } from "@/lib/utils";

const MAX_VEHICLE_IMAGE_BYTES = 4 * 1024 * 1024;
const VEHICLE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const emailField = z.string().trim().email().optional().or(z.literal(""));
const phoneField = z.string().trim().min(7).max(40);
const nameField = z.string().trim().min(1).max(120);

const enquirySchema = z.object({
  full_name: nameField,
  phone: phoneField,
  email: emailField,
  enquiry_type: z.string().trim().min(1).max(80),
  preferred_contact: z.enum(["WhatsApp", "Phone", "Email"]),
  message: z.string().trim().min(1).max(2000),
  vehicle_id: z.string().trim().max(80).optional().or(z.literal("")),
});

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

export class FormMutationError extends Error {
  constructor(public readonly publicMessage: string, options?: ErrorOptions) {
    super(publicMessage, options);
    this.name = "FormMutationError";
  }
}

function stringFields(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

function normalizePreferredContact(value?: string): "WhatsApp" | "Phone" | "Email" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "phone" || normalized === "call") return "Phone";
  if (normalized === "email" || normalized === "e-mail") return "Email";
  return "WhatsApp";
}

function enquiryValidationMessage(error: z.ZodError) {
  const field = String(error.issues[0]?.path[0] ?? "");
  const messages: Record<string, string> = {
    full_name: "Please enter your name.",
    phone: "Please enter a valid phone number.",
    email: "Please enter a valid email address or leave it blank.",
    enquiry_type: "Please select an enquiry type.",
    message: "Please enter a short message.",
  };
  return messages[field] ?? "Please check the form details and try again.";
}

function numberOrNull(value?: string) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

function imageExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function submitEnquiry(formData: FormData) {
  const fields = stringFields(formData);
  const parsed = enquirySchema.safeParse({
    ...fields,
    enquiry_type: fields.enquiry_type?.trim() || "General enquiry",
    preferred_contact: normalizePreferredContact(fields.preferred_contact),
  });

  if (!parsed.success) {
    console.warn("enquiry validation failed", {
      field: parsed.error.issues[0]?.path[0] ?? "unknown",
      code: parsed.error.issues[0]?.code ?? "unknown",
    });
    throw new FormMutationError(enquiryValidationMessage(parsed.error));
  }
  if (!isSupabaseConfigured()) {
    throw new FormMutationError("Enquiries are temporarily unavailable. Please call or WhatsApp StepOne.");
  }

  const vehicleId = parsed.data.vehicle_id && z.string().uuid().safeParse(parsed.data.vehicle_id).success
    ? parsed.data.vehicle_id
    : null;
  const reference = makeReference("ENQ");
  const supabase = await createClient();
  const { error } = await supabase.from("stepone_enquiries").insert({
    reference,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    enquiry_type: parsed.data.enquiry_type,
    preferred_contact: parsed.data.preferred_contact,
    message: parsed.data.message,
    vehicle_id: vehicleId,
  });

  if (error) {
    console.error("enquiry database insert failed", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw new FormMutationError("We could not send your enquiry. Please try again or use WhatsApp.", { cause: error });
  }

  return { reference };
}

export async function saveVehicle(formData: FormData) {
  const parsed = vehicleSchema.safeParse(stringFields(formData));
  if (!parsed.success) {
    throw new FormMutationError("Please check the vehicle details and try again.");
  }
  if (!isSupabaseConfigured()) {
    throw new FormMutationError("The database is not configured.");
  }

  const v = parsed.data;
  const salePrice = numberOrNull(v.sale_price);
  const dailyRate = numberOrNull(v.daily_rate);
  const contactForPrice = v.contact_for_price === "yes";

  if (v.listing_type === "sale" && !contactForPrice && !salePrice) {
    throw new FormMutationError("Add a sale price or enable Contact for Price.");
  }
  if (v.listing_type === "rental" && !dailyRate) {
    throw new FormMutationError("Add a daily rental rate.");
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (!VEHICLE_IMAGE_TYPES.includes(image.type as (typeof VEHICLE_IMAGE_TYPES)[number])) {
      throw new FormMutationError("Vehicle photo must be a JPG, PNG or WebP image.");
    }
    if (image.size > MAX_VEHICLE_IMAGE_BYTES) {
      throw new FormMutationError("Vehicle photo must be 4 MB or smaller.");
    }
  }

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
  let createdVehicle = false;

  if (vehicleId) {
    const { data, error } = await supabase
      .from("stepone_vehicles")
      .update(payload)
      .eq("id", vehicleId)
      .select("id")
      .single();
    if (error || !data) {
      throw new FormMutationError("The vehicle could not be updated. Please sign in again and retry.", { cause: error });
    }
  } else {
    const { data, error } = await supabase
      .from("stepone_vehicles")
      .insert({
        ...payload,
        slug: `${slugify(`${v.year}-${v.make}-${v.model}`)}-${Date.now().toString(36).slice(-5)}`,
      })
      .select("id")
      .single();
    if (error || !data) {
      throw new FormMutationError("The vehicle could not be created. Please try again.", { cause: error });
    }
    vehicleId = data.id;
    createdVehicle = true;
  }

  if (image instanceof File && image.size > 0) {
    const storagePath = `${vehicleId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${imageExtension(image.type)}`;
    const { error: uploadError } = await supabase.storage
      .from("stepone-vehicle-images")
      .upload(storagePath, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      if (createdVehicle) await supabase.from("stepone_vehicles").delete().eq("id", vehicleId);
      throw new FormMutationError("The vehicle photo could not be uploaded. Please retry with a smaller image.", { cause: uploadError });
    }

    const { data: publicUrl } = supabase.storage.from("stepone-vehicle-images").getPublicUrl(storagePath);
    const { count, error: countError } = await supabase
      .from("stepone_vehicle_images")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", vehicleId);

    if (countError) {
      await supabase.storage.from("stepone-vehicle-images").remove([storagePath]);
      if (createdVehicle) await supabase.from("stepone_vehicles").delete().eq("id", vehicleId);
      throw new FormMutationError("The vehicle photo could not be saved. Please try again.", { cause: countError });
    }

    const { error: imageRecordError } = await supabase.from("stepone_vehicle_images").insert({
      vehicle_id: vehicleId,
      image_url: publicUrl.publicUrl,
      storage_path: storagePath,
      alt_text: `${v.year} ${v.make} ${v.model}`,
      sort_order: count ?? 0,
      is_cover: (count ?? 0) === 0,
    });

    if (imageRecordError) {
      await supabase.storage.from("stepone-vehicle-images").remove([storagePath]);
      if (createdVehicle) await supabase.from("stepone_vehicles").delete().eq("id", vehicleId);
      throw new FormMutationError("The vehicle photo could not be attached to the listing. Please try again.", { cause: imageRecordError });
    }
  }

  return { vehicleId };
}
