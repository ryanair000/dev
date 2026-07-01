create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create or replace function public.is_stepone_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'stepone_admin')::boolean, false);
$$;
revoke all on function public.is_stepone_admin() from public;
grant execute on function public.is_stepone_admin() to anon, authenticated;

create or replace function public.stepone_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.stepone_set_updated_at() from public;

create table public.stepone_vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  listing_type text not null check (listing_type in ('sale','rental')),
  make text not null,
  model text not null,
  year int not null check (year between 1980 and 2100),
  body_type text not null,
  color text,
  mileage int check (mileage is null or mileage >= 0),
  transmission text not null default 'Automatic',
  fuel_type text not null default 'Petrol',
  engine_capacity text,
  seats int check (seats is null or seats > 0),
  drive_type text,
  luggage_capacity text,
  location text not null default 'Kilimani, Nairobi',
  sale_price bigint check (sale_price is null or sale_price > 0),
  contact_for_price boolean not null default false,
  daily_rate bigint check (daily_rate is null or daily_rate > 0),
  weekly_rate bigint check (weekly_rate is null or weekly_rate > 0),
  monthly_rate bigint check (monthly_rate is null or monthly_rate > 0),
  description text not null,
  features text[] not null default '{}',
  status text not null default 'available' check (status in ('available','reserved','rented','sold','maintenance','unavailable','draft')),
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stepone_vehicle_price_matches_type check (
    (listing_type = 'sale' and (contact_for_price or sale_price is not null))
    or (listing_type = 'rental' and daily_rate is not null)
  )
);
create index stepone_vehicles_listing_type_idx on public.stepone_vehicles (listing_type);
create index stepone_vehicles_public_catalogue_idx on public.stepone_vehicles (published, status, featured);
create index stepone_vehicles_make_model_idx on public.stepone_vehicles (make, model);
create trigger stepone_vehicles_updated_at before update on public.stepone_vehicles for each row execute function public.stepone_set_updated_at();

create table public.stepone_vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.stepone_vehicles(id) on delete cascade,
  image_url text not null,
  storage_path text,
  alt_text text not null default '',
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index stepone_vehicle_images_vehicle_idx on public.stepone_vehicle_images (vehicle_id, sort_order);
create unique index stepone_vehicle_images_one_cover_idx on public.stepone_vehicle_images (vehicle_id) where is_cover;

create table public.stepone_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  vehicle_id uuid references public.stepone_vehicles(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  enquiry_type text not null,
  preferred_contact text not null default 'WhatsApp',
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','follow_up','closed')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index stepone_enquiries_status_created_idx on public.stepone_enquiries (status, created_at desc);
create trigger stepone_enquiries_updated_at before update on public.stepone_enquiries for each row execute function public.stepone_set_updated_at();

create table public.stepone_rental_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  vehicle_id uuid not null references public.stepone_vehicles(id) on delete restrict,
  full_name text not null,
  phone text not null,
  email text,
  preferred_contact text not null default 'WhatsApp',
  pickup_at timestamptz not null,
  return_at timestamptz not null,
  pickup_location text not null default 'Kilimani, Nairobi',
  message text,
  estimated_amount bigint check (estimated_amount is null or estimated_amount >= 0),
  status text not null default 'pending' check (status in ('pending','approved','rejected','active','completed','cancelled')),
  internal_notes text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stepone_valid_rental_period check (return_at > pickup_at)
);
create index stepone_rental_requests_status_pickup_idx on public.stepone_rental_requests (status, pickup_at);
create trigger stepone_rental_requests_updated_at before update on public.stepone_rental_requests for each row execute function public.stepone_set_updated_at();
alter table public.stepone_rental_requests add constraint stepone_rental_requests_no_overlap
exclude using gist (
  vehicle_id with =,
  tstzrange(pickup_at, return_at, '[)') with &&
) where (status in ('approved','active'));

create table public.stepone_appointments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  vehicle_id uuid not null references public.stepone_vehicles(id) on delete restrict,
  full_name text not null,
  phone text not null,
  email text,
  appointment_type text not null check (appointment_type in ('viewing','test_drive')),
  scheduled_at timestamptz not null,
  licence_confirmed boolean not null default false,
  message text,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','no_show')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index stepone_appointments_status_scheduled_idx on public.stepone_appointments (status, scheduled_at);
create trigger stepone_appointments_updated_at before update on public.stepone_appointments for each row execute function public.stepone_set_updated_at();

create table public.stepone_site_content (
  key text primary key,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create trigger stepone_site_content_updated_at before update on public.stepone_site_content for each row execute function public.stepone_set_updated_at();

create table public.stepone_business_settings (
  id boolean primary key default true check (id),
  business_name text not null,
  rental_name text not null,
  tagline text not null,
  location text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  opening_hours text not null,
  currency text not null default 'KES',
  updated_at timestamptz not null default now()
);
create trigger stepone_business_settings_updated_at before update on public.stepone_business_settings for each row execute function public.stepone_set_updated_at();

insert into public.stepone_business_settings (id,business_name,rental_name,tagline,location,phone,whatsapp,email,opening_hours)
values (true,'StepOne Autodealers','StepOne Car Rentals','Buy. Hire. Drive with Confidence.','Kilimani, Nairobi','+254 7XX XXX XXX','254700000000','info@stepone.co.ke','Mon–Sat: 8:00 AM – 6:00 PM')
on conflict (id) do nothing;

insert into public.stepone_site_content (key,content) values (
  'homepage',
  '{"eyebrow":"Kilimani • Nairobi","headline":"Your next car starts with StepOne.","supporting_text":"Buy confidently or request a reliable self-drive rental — all from one trusted automotive partner.","primary_button":"Browse cars for sale","secondary_button":"Explore rentals"}'::jsonb
) on conflict (key) do nothing;

insert into public.stepone_vehicles (id,slug,listing_type,make,model,year,body_type,color,mileage,transmission,fuel_type,engine_capacity,seats,drive_type,luggage_capacity,location,sale_price,contact_for_price,daily_rate,weekly_rate,monthly_rate,description,features,status,featured,published) values
('11111111-1111-4111-8111-111111111111','2019-toyota-harrier','sale','Toyota','Harrier',2019,'SUV','Pearl White',62000,'Automatic','Petrol','2000 cc',5,'2WD','4 bags','Kilimani, Nairobi',3850000,false,null,null,null,'A premium, well-maintained Toyota Harrier with a comfortable cabin, smooth automatic transmission and excellent road presence.',array['Reverse camera','Bluetooth','Air conditioning','Alloy wheels','Keyless start'],'available',true,true),
('22222222-2222-4222-8222-222222222222','2021-mazda-cx-5','sale','Mazda','CX-5',2021,'SUV','Deep Blue',42000,'Automatic','Petrol','2000 cc',5,'2WD','4 bags','Kilimani, Nairobi',4450000,false,null,null,null,'Modern Mazda CX-5 with refined handling, high-quality interior finishes and practical SUV space.',array['Reverse camera','Bluetooth','Air conditioning','Alloy wheels','Cruise control'],'available',true,true),
('33333333-3333-4333-8333-333333333333','2018-mercedes-c200','sale','Mercedes-Benz','C200',2018,'Sedan','Graphite',68000,'Automatic','Petrol','2000 cc',5,'2WD','3 bags','Kilimani, Nairobi',null,true,null,null,null,'Executive Mercedes-Benz sedan offering a quiet cabin, elegant styling and confident performance.',array['Leather seats','Bluetooth','Air conditioning','Alloy wheels','Cruise control'],'available',true,true),
('77777777-7777-4777-8777-777777777777','2019-toyota-vitz-rental','rental','Toyota','Vitz',2019,'Small Car','Sky Blue',null,'Automatic','Petrol','1300 cc',5,'2WD','2 bags','Kilimani, Nairobi',null,false,3500,21000,80000,'Easy-to-drive, economical compact car suited to city errands and short trips around Nairobi.',array['Bluetooth','Air conditioning','Fuel efficient','Compact size'],'available',true,true),
('88888888-8888-4888-8888-888888888888','2021-toyota-fielder-rental','rental','Toyota','Fielder',2021,'Wagon','Ocean Blue',null,'Automatic','Petrol','1500 cc',5,'2WD','5 bags','Kilimani, Nairobi',null,false,4000,24000,95000,'Comfortable and spacious rental car with a large boot and excellent fuel economy.',array['Bluetooth','Air conditioning','Reverse camera','Large boot'],'available',true,true),
('99999999-9999-4999-8999-999999999999','2020-nissan-x-trail-rental','rental','Nissan','X-Trail',2020,'SUV','Blue',null,'Automatic','Petrol','2000 cc',5,'4WD','5 bags','Kilimani, Nairobi',null,false,7000,42000,160000,'Well-equipped executive SUV with comfortable seating, luggage space and confident highway performance.',array['Reverse camera','Bluetooth','Air conditioning','4WD','Cruise control'],'available',true,true)
on conflict (id) do nothing;

insert into public.stepone_vehicle_images (vehicle_id,image_url,alt_text,sort_order,is_cover) values
('11111111-1111-4111-8111-111111111111','/car.svg','2019 Toyota Harrier',0,true),
('22222222-2222-4222-8222-222222222222','/car.svg','2021 Mazda CX-5',0,true),
('33333333-3333-4333-8333-333333333333','/car.svg','2018 Mercedes C200',0,true),
('77777777-7777-4777-8777-777777777777','/car.svg','Toyota Vitz rental',0,true),
('88888888-8888-4888-8888-888888888888','/car.svg','Toyota Fielder rental',0,true),
('99999999-9999-4999-8999-999999999999','/car.svg','Nissan X-Trail rental',0,true)
on conflict do nothing;

alter table public.stepone_vehicles enable row level security;
alter table public.stepone_vehicle_images enable row level security;
alter table public.stepone_enquiries enable row level security;
alter table public.stepone_rental_requests enable row level security;
alter table public.stepone_appointments enable row level security;
alter table public.stepone_site_content enable row level security;
alter table public.stepone_business_settings enable row level security;

create policy "stepone public views published vehicles" on public.stepone_vehicles for select to anon, authenticated using (published or (select public.is_stepone_admin()));
create policy "stepone admins manage vehicles" on public.stepone_vehicles for all to authenticated using ((select public.is_stepone_admin())) with check ((select public.is_stepone_admin()));
create policy "stepone public views published vehicle images" on public.stepone_vehicle_images for select to anon, authenticated using (exists(select 1 from public.stepone_vehicles v where v.id=vehicle_id and (v.published or (select public.is_stepone_admin()))));
create policy "stepone admins manage vehicle images" on public.stepone_vehicle_images for all to authenticated using ((select public.is_stepone_admin())) with check ((select public.is_stepone_admin()));
create policy "stepone public submits enquiries" on public.stepone_enquiries for insert to anon, authenticated with check (status='new' and internal_notes is null);
create policy "stepone admins manage enquiries" on public.stepone_enquiries for all to authenticated using ((select public.is_stepone_admin())) with check ((select public.is_stepone_admin()));
create policy "stepone public submits rental requests" on public.stepone_rental_requests for insert to anon, authenticated with check (status='pending' and internal_notes is null and approved_at is null);
create policy "stepone admins manage rental requests" on public.stepone_rental_requests for all to authenticated using ((select public.is_stepone_admin())) with check ((select public.is_stepone_admin()));
create policy "stepone public submits appointments" on public.stepone_appointments for insert to anon, authenticated with check (status='pending' and internal_notes is null);
create policy "stepone admins manage appointments" on public.stepone_appointments for all to authenticated using ((select public.is_stepone_admin())) with check ((select public.is_stepone_admin()));
create policy "stepone public reads site content" on public.stepone_site_content for select to anon, authenticated using (true);
create policy "stepone admins manage site content" on public.stepone_site_content for all to authenticated using ((select public.is_stepone_admin())) with check ((select public.is_stepone_admin()));
create policy "stepone public reads business settings" on public.stepone_business_settings for select to anon, authenticated using (true);
create policy "stepone admins manage business settings" on public.stepone_business_settings for all to authenticated using ((select public.is_stepone_admin())) with check ((select public.is_stepone_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.stepone_vehicles, public.stepone_vehicle_images, public.stepone_site_content, public.stepone_business_settings to anon, authenticated;
grant insert (reference,vehicle_id,full_name,phone,email,enquiry_type,preferred_contact,message) on public.stepone_enquiries to anon, authenticated;
grant insert (reference,vehicle_id,full_name,phone,email,preferred_contact,pickup_at,return_at,pickup_location,message,estimated_amount) on public.stepone_rental_requests to anon, authenticated;
grant insert (reference,vehicle_id,full_name,phone,email,appointment_type,scheduled_at,licence_confirmed,message) on public.stepone_appointments to anon, authenticated;
grant select,insert,update,delete on public.stepone_vehicles, public.stepone_vehicle_images, public.stepone_enquiries, public.stepone_rental_requests, public.stepone_appointments, public.stepone_site_content, public.stepone_business_settings to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('stepone-vehicle-images','stepone-vehicle-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "stepone admins list vehicle images" on storage.objects for select to authenticated using (bucket_id='stepone-vehicle-images' and (select public.is_stepone_admin()));
create policy "stepone admins upload vehicle images" on storage.objects for insert to authenticated with check (bucket_id='stepone-vehicle-images' and (select public.is_stepone_admin()));
create policy "stepone admins update vehicle images" on storage.objects for update to authenticated using (bucket_id='stepone-vehicle-images' and (select public.is_stepone_admin())) with check (bucket_id='stepone-vehicle-images' and (select public.is_stepone_admin()));
create policy "stepone admins delete vehicle images" on storage.objects for delete to authenticated using (bucket_id='stepone-vehicle-images' and (select public.is_stepone_admin()));
