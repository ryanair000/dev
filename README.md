# StepOne Autodealers

Production-ready vehicle catalogue and dealership management web application for **StepOne Autodealers** and **StepOne Car Rentals**, based in Kilimani, Nairobi.

## Product scope

### Public website

- Cars-for-sale catalogue with search and filtering
- Self-drive rental catalogue with daily, weekly and monthly rates
- Vehicle detail galleries and direct WhatsApp actions
- Rental-request flow with date selection and estimated value
- Car enquiry, vehicle-viewing and test-drive forms
- About, contact, FAQ and rental-terms pages
- Responsive navigation and mobile-first layouts
- SEO metadata and a health endpoint

### Admin dashboard

- Secure Supabase authentication with admin-role checks
- Dashboard overview and operational statistics
- Add, edit, publish, hide and update vehicle listings
- Upload and reorder vehicle images in Supabase Storage
- Sales-enquiry workflow and status tracking
- Rental-request review, approval and rejection
- Rental calendar and appointment management
- Homepage-content and business-settings management

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, Storage and Row Level Security
- Zod validation and Server Actions
- Lucide icons and Sonner notifications

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The public website uses built-in demo inventory when Supabase variables are absent. Admin routes require a configured Supabase project and an authenticated user with `app_metadata.role = "admin"`.

## Supabase setup

1. Create or choose a Supabase project.
2. Apply `supabase/migrations/20260630182323_initial_stepone_schema.sql`.
3. Copy the project URL and **publishable key** into `.env.local`.
4. Create an admin user in Supabase Authentication.
5. Assign the admin role using the SQL editor while replacing the email:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

6. Sign in at `/admin/login`.

The migration creates the application tables, indexes, constraints, storage bucket, seed data, grants and RLS policies. Public users can only read published inventory and submit forms. Admin mutations require the admin app-metadata role.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public URL |
| `NEXT_PUBLIC_SUPABASE_URL` | For live data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For live data | Browser-safe publishable key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | Contact number without `+` |

Never place a secret or service-role key in a `NEXT_PUBLIC_` variable.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
# or
npm run check
```

GitHub Actions runs these checks on pushes and pull requests.

## Deployment

Deploy to Vercel, add the environment variables, and set `NEXT_PUBLIC_SITE_URL` to the production domain. The included `/api/health` endpoint can be used by uptime monitoring.

## Important production follow-ups

- Replace the placeholder contact number and email in admin settings.
- Replace vector demo vehicles with the client’s real photography.
- Add the final rental policy, minimum-age rule, deposit and mileage terms.
- Create the first administrator account before launch.
