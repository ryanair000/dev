export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.includes("REPLACE"),
  );
}

export function formatCurrency(value?: number | null) {
  if (value == null) return "Contact for Price";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("KES", "KSh");
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function makeReference(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  const candidate = String(value ?? "");
  return candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : fallback;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
