import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const moderationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
  featured: z.string().optional(),
});

function redirectToReviews(request: NextRequest, key: "updated" | "error", value: string) {
  const target = new URL("/admin/reviews", request.url);
  target.searchParams.set(key, value);
  return NextResponse.redirect(target, 303);
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("review moderation form parse failed", error);
    return redirectToReviews(request, "error", "The review update could not be read.");
  }

  const action = String(formData.get("action") ?? "update");
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  if (action === "delete") {
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) return redirectToReviews(request, "error", "Invalid review ID.");
    const { error } = await supabase.from("stepone_reviews").delete().eq("id", parsedId.data);
    if (error) {
      console.error("review delete failed", error);
      return redirectToReviews(request, "error", "The review could not be deleted.");
    }
  } else {
    const parsed = moderationSchema.safeParse({
      id,
      status: String(formData.get("status") ?? "pending"),
      featured: String(formData.get("featured") ?? ""),
    });
    if (!parsed.success) return redirectToReviews(request, "error", "Please check the review update.");

    const { data, error } = await supabase
      .from("stepone_reviews")
      .update({
        status: parsed.data.status,
        featured: parsed.data.featured === "yes" && parsed.data.status === "approved",
      })
      .eq("id", parsed.data.id)
      .select("id")
      .single();

    if (error || !data) {
      console.error("review moderation failed", error);
      return redirectToReviews(request, "error", "The review could not be updated.");
    }
  }

  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  return redirectToReviews(request, "updated", "1");
}
