import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ReviewError, submitReview } from "@/lib/reviews";

function redirectWithMessage(request: NextRequest, key: "sent" | "error", value: string) {
  const target = new URL("/reviews", request.url);
  target.searchParams.set(key, value);
  return NextResponse.redirect(target, 303);
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("review form parse failed", error);
    return redirectWithMessage(request, "error", "The review form could not be read. Please try again.");
  }

  try {
    await submitReview(formData);
    revalidatePath("/reviews");
    revalidatePath("/admin/reviews");
    return redirectWithMessage(request, "sent", "1");
  } catch (error) {
    console.error("review submission failed", error);
    const message = error instanceof ReviewError
      ? error.publicMessage
      : "Your review could not be submitted. Please try again.";
    return redirectWithMessage(request, "error", message);
  }
}
