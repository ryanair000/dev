import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { FormMutationError, submitEnquiry } from "@/lib/form-mutations";
import { safeReturnTo } from "@/lib/utils";

function redirectWithMessage(request: NextRequest, returnTo: string, key: "sent" | "error", value: string) {
  const target = new URL(returnTo, request.url);
  target.searchParams.set(key, value);
  return NextResponse.redirect(target, 303);
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("enquiry form parse failed", error);
    return redirectWithMessage(request, "/contact", "error", "The form could not be read. Please try again.");
  }

  const returnTo = safeReturnTo(formData.get("return_to"), "/contact");

  try {
    const { reference } = await submitEnquiry(formData);
    revalidatePath("/admin/enquiries");
    return redirectWithMessage(request, returnTo, "sent", reference);
  } catch (error) {
    console.error("enquiry submission failed", error);
    const message = error instanceof FormMutationError
      ? error.publicMessage
      : "We could not send your enquiry. Please try again or use WhatsApp.";
    return redirectWithMessage(request, returnTo, "error", message);
  }
}
