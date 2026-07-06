import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { FormMutationError, saveVehicle } from "@/lib/form-mutations";

function redirectWithError(request: NextRequest, path: string, message: string) {
  const target = new URL(path, request.url);
  target.searchParams.set("error", message);
  return NextResponse.redirect(target, 303);
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("vehicle form parse failed", error);
    return redirectWithError(request, "/admin/vehicles/new", "The vehicle form could not be read. Please try again.");
  }

  const existingId = String(formData.get("id") ?? "");
  const errorPath = existingId ? `/admin/vehicles/${existingId}` : "/admin/vehicles/new";

  try {
    const { vehicleId } = await saveVehicle(formData);
    revalidatePath("/");
    revalidatePath("/cars");
    revalidatePath("/rentals");
    revalidatePath("/admin/vehicles");
    revalidatePath(`/admin/vehicles/${vehicleId}`);

    const target = new URL(`/admin/vehicles/${vehicleId}`, request.url);
    target.searchParams.set("saved", "1");
    return NextResponse.redirect(target, 303);
  } catch (error) {
    console.error("vehicle save failed", error);
    const message = error instanceof FormMutationError
      ? error.publicMessage
      : "The vehicle could not be saved. Please try again.";
    return redirectWithError(request, errorPath, message);
  }
}
