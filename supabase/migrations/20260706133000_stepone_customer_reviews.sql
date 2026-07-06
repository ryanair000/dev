create table if not exists public.stepone_reviews (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  rating int not null check (rating between 1 and 5),
  review_type text not null default 'service' check (review_type in ('purchase','rental','service')),
  title text check (title is null or char_length(title) <= 120),
  message text not null check (char_length(message) between 10 and 1200),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stepone_reviews_status_created_idx
on public.stepone_reviews (status, featured desc, created_at desc);

drop trigger if exists stepone_reviews_updated_at on public.stepone_reviews;
create trigger stepone_reviews_updated_at
before update on public.stepone_reviews
for each row execute function public.stepone_set_updated_at();

alter table public.stepone_reviews enable row level security;

drop policy if exists "stepone public reads approved reviews" on public.stepone_reviews;
create policy "stepone public reads approved reviews"
on public.stepone_reviews for select
to anon, authenticated
using (status = 'approved' or (select public.is_stepone_admin()));

drop policy if exists "stepone public submits reviews" on public.stepone_reviews;
create policy "stepone public submits reviews"
on public.stepone_reviews for insert
to anon, authenticated
with check (status = 'pending' and featured = false);

drop policy if exists "stepone admins manage reviews" on public.stepone_reviews;
create policy "stepone admins manage reviews"
on public.stepone_reviews for all
to authenticated
using ((select public.is_stepone_admin()))
with check ((select public.is_stepone_admin()));

grant select on public.stepone_reviews to anon, authenticated;
grant insert (full_name, rating, review_type, title, message) on public.stepone_reviews to anon, authenticated;
grant select, insert, update, delete on public.stepone_reviews to authenticated;
