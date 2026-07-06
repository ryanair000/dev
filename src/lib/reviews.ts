import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { Review } from "@/types";

const reviewSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  review_type: z.enum(["purchase", "rental", "service"]),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(1200),
});

export class ReviewError extends Error {
  constructor(public readonly publicMessage: string, options?: ErrorOptions) {
    super(publicMessage, options);
    this.name = "ReviewError";
  }
}

function stringFields(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

export async function getApprovedReviews(limit?: number): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("stepone_reviews")
    .select("*")
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error("getApprovedReviews", error);
    return [];
  }
  return (data ?? []) as Review[];
}

export async function getAllReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getAllReviews", error);
    return [];
  }
  return (data ?? []) as Review[];
}

export async function submitReview(formData: FormData) {
  const parsed = reviewSchema.safeParse(stringFields(formData));
  if (!parsed.success) {
    throw new ReviewError("Please check your review details and try again.");
  }
  if (!isSupabaseConfigured()) {
    throw new ReviewError("Reviews are temporarily unavailable. Please try again later.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stepone_reviews").insert({
    full_name: parsed.data.full_name,
    rating: parsed.data.rating,
    review_type: parsed.data.review_type,
    title: parsed.data.title || null,
    message: parsed.data.message,
  });

  if (error) {
    throw new ReviewError("Your review could not be submitted. Please try again.", { cause: error });
  }
}
