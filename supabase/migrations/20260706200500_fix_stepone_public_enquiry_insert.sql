revoke all on table public.stepone_enquiries from anon;

grant insert (
  reference,
  vehicle_id,
  full_name,
  phone,
  email,
  enquiry_type,
  preferred_contact,
  message
) on table public.stepone_enquiries to anon;

drop policy if exists "stepone public submits enquiries" on public.stepone_enquiries;

create policy "stepone public submits enquiries"
on public.stepone_enquiries
for insert
to anon
with check (true);
