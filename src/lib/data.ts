import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { Appointment, BusinessSettings, Enquiry, RentalRequest, Vehicle } from "@/types";

const now = new Date().toISOString();

export const fallbackSettings: BusinessSettings = {
  business_name: "StepOne Autodealers",
  rental_name: "StepOne Car Rentals",
  tagline: "Buy. Hire. Drive with Confidence.",
  location: "Kilimani, Nairobi",
  phone: "0742 752439",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254742752439",
  email: "info@stepone.co.ke",
  opening_hours: "Mon-Sat: 8:00 AM - 6:00 PM",
  currency: "KES",
};

export const demoVehicles: Vehicle[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "2022-land-rover-defender",
    listing_type: "sale",
    make: "Land Rover",
    model: "Defender",
    year: 2022,
    body_type: "SUV",
    color: "Pearl White",
    mileage: 62000,
    transmission: "Automatic",
    fuel_type: "Petrol",
    engine_capacity: "2000 cc",
    seats: 5,
    drive_type: "2WD",
    luggage_capacity: "4 bags",
    location: "Kilimani, Nairobi",
    sale_price: 8950000,
    contact_for_price: false,
    daily_rate: null,
    weekly_rate: null,
    monthly_rate: null,
    description: "A premium SUV with a commanding stance, refined cabin and confident road presence for city and weekend driving.",
    features: ["Reverse camera", "Bluetooth", "Air conditioning", "Alloy wheels", "Keyless start"],
    status: "available",
    featured: true,
    published: true,
    created_at: now,
    updated_at: now,
    images: [{ id: "img-1", image_url: "/vehicles/white-suv-front.jpg", alt_text: "White premium SUV", is_cover: true, sort_order: 0 }],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "2021-bmw-320i",
    listing_type: "sale",
    make: "BMW",
    model: "320i",
    year: 2021,
    body_type: "Sedan",
    color: "Deep Blue",
    mileage: 42000,
    transmission: "Automatic",
    fuel_type: "Petrol",
    engine_capacity: "2000 cc",
    seats: 5,
    drive_type: "2WD",
    luggage_capacity: "4 bags",
    location: "Kilimani, Nairobi",
    sale_price: 4850000,
    contact_for_price: false,
    daily_rate: null,
    weekly_rate: null,
    monthly_rate: null,
    description: "A refined executive sedan with sharp handling, a quality cabin and strong everyday comfort.",
    features: ["Reverse camera", "Cruise control", "Bluetooth", "Air conditioning"],
    status: "available",
    featured: true,
    published: true,
    created_at: now,
    updated_at: now,
    images: [{ id: "img-2", image_url: "/vehicles/blue-suv.jpg", alt_text: "Blue SUV", is_cover: true, sort_order: 0 }],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "2018-bmw-m-sport",
    listing_type: "sale",
    make: "BMW",
    model: "M Sport",
    year: 2018,
    body_type: "Sedan",
    color: "Graphite",
    mileage: 68000,
    transmission: "Automatic",
    fuel_type: "Petrol",
    engine_capacity: "2000 cc",
    seats: 5,
    drive_type: "2WD",
    luggage_capacity: "3 bags",
    location: "Kilimani, Nairobi",
    sale_price: null,
    contact_for_price: true,
    daily_rate: null,
    weekly_rate: null,
    monthly_rate: null,
    description: "An executive sport sedan with elegant styling, a quiet cabin and confident performance.",
    features: ["Leather seats", "Bluetooth", "Cruise control", "Air conditioning"],
    status: "available",
    featured: true,
    published: true,
    created_at: now,
    updated_at: now,
    images: [{ id: "img-3", image_url: "/vehicles/grey-sedan.jpg", alt_text: "Grey executive sedan", is_cover: true, sort_order: 0 }],
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    slug: "2019-toyota-vitz-rental",
    listing_type: "rental",
    make: "Toyota",
    model: "Vitz",
    year: 2019,
    body_type: "Small Car",
    color: "Sky Blue",
    mileage: null,
    transmission: "Automatic",
    fuel_type: "Petrol",
    engine_capacity: "1300 cc",
    seats: 5,
    drive_type: "2WD",
    luggage_capacity: "2 bags",
    location: "Kilimani, Nairobi",
    sale_price: null,
    contact_for_price: false,
    daily_rate: 3500,
    weekly_rate: 21000,
    monthly_rate: 80000,
    description: "An economical city car suited to errands and short trips around Nairobi.",
    features: ["Bluetooth", "Air conditioning", "Fuel efficient", "Compact size"],
    status: "available",
    featured: true,
    published: true,
    created_at: now,
    updated_at: now,
    images: [{ id: "img-4", image_url: "/vehicles/small-blue-car.jpg", alt_text: "Compact blue city car", is_cover: true, sort_order: 0 }],
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    slug: "2021-toyota-fielder-rental",
    listing_type: "rental",
    make: "Toyota",
    model: "Fielder",
    year: 2021,
    body_type: "Wagon",
    color: "Ocean Blue",
    mileage: null,
    transmission: "Automatic",
    fuel_type: "Petrol",
    engine_capacity: "1500 cc",
    seats: 5,
    drive_type: "2WD",
    luggage_capacity: "5 bags",
    location: "Kilimani, Nairobi",
    sale_price: null,
    contact_for_price: false,
    daily_rate: 4000,
    weekly_rate: 24000,
    monthly_rate: 95000,
    description: "A comfortable and spacious rental with a large boot and excellent fuel economy.",
    features: ["Bluetooth", "Air conditioning", "Reverse camera", "Large boot"],
    status: "available",
    featured: true,
    published: true,
    created_at: now,
    updated_at: now,
    images: [{ id: "img-5", image_url: "/vehicles/compact-rental.jpg", alt_text: "Compact rental car", is_cover: true, sort_order: 0 }],
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    slug: "2020-nissan-x-trail-rental",
    listing_type: "rental",
    make: "Nissan",
    model: "X-Trail",
    year: 2020,
    body_type: "SUV",
    color: "Blue",
    mileage: null,
    transmission: "Automatic",
    fuel_type: "Petrol",
    engine_capacity: "2000 cc",
    seats: 5,
    drive_type: "4WD",
    luggage_capacity: "5 bags",
    location: "Kilimani, Nairobi",
    sale_price: null,
    contact_for_price: false,
    daily_rate: 7000,
    weekly_rate: 42000,
    monthly_rate: 160000,
    description: "A well-equipped SUV with comfortable seating, luggage room and strong highway performance.",
    features: ["Reverse camera", "Bluetooth", "Air conditioning", "4WD", "Cruise control"],
    status: "available",
    featured: true,
    published: true,
    created_at: now,
    updated_at: now,
    images: [{ id: "img-6", image_url: "/vehicles/black-suv-city.jpg", alt_text: "Black SUV in the city", is_cover: true, sort_order: 0 }],
  },
];

type VehicleFilters = {
  listingType?: "sale" | "rental";
  published?: boolean;
  featured?: boolean;
  query?: string;
  bodyType?: string;
};

function filterDemo(filters: VehicleFilters) {
  let items = [...demoVehicles];
  if (filters.listingType) items = items.filter((item) => item.listing_type === filters.listingType);
  if (filters.published != null) items = items.filter((item) => item.published === filters.published);
  if (filters.featured != null) items = items.filter((item) => item.featured === filters.featured);
  if (filters.bodyType) items = items.filter((item) => item.body_type.toLowerCase() === filters.bodyType?.toLowerCase());
  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter((item) => `${item.make} ${item.model} ${item.year}`.toLowerCase().includes(q));
  }
  return items;
}

export async function getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  if (!isSupabaseConfigured()) return filterDemo(filters);
  const supabase = await createClient();
  let query = supabase
    .from("stepone_vehicles")
    .select("*, images:stepone_vehicle_images(*)")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (filters.listingType) query = query.eq("listing_type", filters.listingType);
  if (filters.published != null) query = query.eq("published", filters.published);
  if (filters.featured != null) query = query.eq("featured", filters.featured);
  if (filters.bodyType) query = query.eq("body_type", filters.bodyType);
  if (filters.query) query = query.or(`make.ilike.%${filters.query}%,model.ilike.%${filters.query}%`);
  const { data, error } = await query;
  if (error) {
    console.error("getVehicles", error);
    return filterDemo(filters);
  }
  return (data ?? []) as unknown as Vehicle[];
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!isSupabaseConfigured()) return demoVehicles.find((item) => item.slug === slug) ?? null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_vehicles")
    .select("*, images:stepone_vehicle_images(*)")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as unknown as Vehicle;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  if (!isSupabaseConfigured()) return demoVehicles.find((item) => item.id === id) ?? null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stepone_vehicles")
    .select("*, images:stepone_vehicle_images(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as Vehicle;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (!isSupabaseConfigured()) return fallbackSettings;
  const supabase = await createClient();
  const { data, error } = await supabase.from("stepone_business_settings").select("*").eq("id", true).single();
  if (error || !data) return fallbackSettings;
  return data as BusinessSettings;
}

export async function getHomepageContent() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("stepone_site_content").select("content").eq("key", "homepage").single();
  return (data?.content ?? null) as null | Record<string, string>;
}

export async function getEnquiries(): Promise<Enquiry[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("stepone_enquiries")
    .select("*, vehicle:stepone_vehicles(id,make,model,slug)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Enquiry[];
}

export async function getRentalRequests(): Promise<RentalRequest[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("stepone_rental_requests")
    .select("*, vehicle:stepone_vehicles(id,make,model,slug,daily_rate)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as RentalRequest[];
}

export async function getAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("stepone_appointments")
    .select("*, vehicle:stepone_vehicles(id,make,model,slug)")
    .order("scheduled_at", { ascending: true });
  return (data ?? []) as unknown as Appointment[];
}
