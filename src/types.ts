export type ListingType = "sale" | "rental";

export type VehicleImage = {
  id: string;
  image_url: string;
  alt_text: string;
  is_cover: boolean;
  sort_order: number;
};

export type Vehicle = {
  id: string;
  slug: string;
  listing_type: ListingType;
  make: string;
  model: string;
  year: number;
  body_type: string;
  color: string | null;
  mileage: number | null;
  transmission: string;
  fuel_type: string;
  engine_capacity: string | null;
  seats: number | null;
  drive_type: string | null;
  luggage_capacity: string | null;
  location: string;
  sale_price: number | null;
  contact_for_price: boolean;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  description: string;
  features: string[];
  status: string;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  images: VehicleImage[];
};

export type Enquiry = {
  id: string;
  reference: string;
  full_name: string;
  phone: string;
  email: string | null;
  enquiry_type: string;
  preferred_contact: string;
  message: string;
  status: string;
  created_at: string;
  vehicle?: { id: string; make: string; model: string; slug: string } | null;
};

export type RentalRequest = {
  id: string;
  reference: string;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_contact: string;
  pickup_at: string;
  return_at: string;
  pickup_location: string;
  message: string | null;
  estimated_amount: number | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
  vehicle?: { id: string; make: string; model: string; slug: string; daily_rate: number | null } | null;
};

export type Appointment = {
  id: string;
  reference: string;
  full_name: string;
  phone: string;
  email: string | null;
  appointment_type: "viewing" | "test_drive";
  scheduled_at: string;
  licence_confirmed: boolean;
  message: string | null;
  status: string;
  created_at: string;
  vehicle?: { id: string; make: string; model: string; slug: string } | null;
};

export type BusinessSettings = {
  business_name: string;
  rental_name: string;
  tagline: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  opening_hours: string;
  currency: string;
};
