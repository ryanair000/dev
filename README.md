# StepOne Autodealers

Production-ready Next.js application for **StepOne Autodealers** and **StepOne Car Rentals** in Kilimani, Nairobi.

## Included

- Public cars-for-sale and self-drive rental catalogues
- Search and category filters
- Vehicle detail pages
- Sales enquiry, viewing and test-drive requests
- Rental request flow with estimated value
- Secure Supabase admin authentication
- Inventory creation, editing and image uploads
- Enquiry, rental and appointment management
- Rental calendar
- Homepage and business settings management
- Supabase RLS, Storage policies and seeded demo inventory
- Health endpoint and GitHub Actions CI

## Stack

- Next.js 16 and React 19
- TypeScript
- Supabase Auth, Postgres and Storage
- Zod validation
- Plain production CSS with no UI framework dependency

## Jenga Supabase

This app is wired to the existing **Jenga** Supabase project:

- Project ref: `llmbgigriltgikzmfmnf`
- URL: `https://llmbgigriltgikzmfmnf.supabase.co`
- Dedicated database tables use the `stepone_` prefix
- Dedicated Storage bucket: `stepone-vehicle-images`
- Admin authorization claim: `app_metadata.stepone_admin = true`

The production schema has already been applied to Jenga. The migration files are kept in `supabase/migrations` for source control and reproducibility.

## Environment variables

Copy `.env.example` to `.env.local` and add the Jenga publishable key:

```bash
cp .env.example .env.local
```

Required values:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://llmbgigriltgikzmfmnf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_WHATSAPP_NUMBER=254700000000
```

Never expose a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Admin access

The existing Jenga user `ryanairawesome@gmail.com` has been assigned the StepOne administrator claim. Sign in at `/admin/login` using that account's existing password.

If the JWT was issued before the claim was added, sign out and sign back in so the refreshed token includes `stepone_admin: true`.
