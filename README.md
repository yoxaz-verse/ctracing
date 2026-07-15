# TeraTrace

TeraTrace is a Next.js and Supabase foundation for a carbon credit marketplace.
The first version includes a public homepage, Supabase-backed authentication,
app-controlled SMTP email verification, role selection at signup, and protected
buyer, seller, and admin dashboards.

## Prerequisites

- Node.js `>=22.13.0`
- A Supabase project for live authentication and database records
- SMTP credentials for TeraTrace verification emails

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your Supabase project URL, publishable key, app URL, and SMTP credentials
to `.env.local`. A Supabase service-role key is not required.

For production SEO, set `NEXT_PUBLIC_SITE_URL` to the canonical public domain,
for example `https://your-domain.com`. `SITE_URL` is also supported as a
fallback for sitemap, robots, canonical, Open Graph, and structured-data URLs.

Apply `supabase/schema.sql` in the Supabase SQL editor before testing live
signup and dashboard data. The dashboards include sample data when no project
records exist yet.

For an existing database, apply `supabase/email-verification-migration.sql`.
In Supabase Auth settings, disable built-in email confirmation so Supabase does
not send verification emails; TeraTrace sends its own SMTP verification link.

## Create First Admin

Admins use the normal `/login` form. Public signup only lets users create buyer
or seller profiles, so create an account first, verify its email, then promote
that profile manually in Supabase:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

For local development only, if the test account is blocked waiting for email
verification, you can mark it verified:

```sql
update public.profiles
set email_verified_at = now()
where email = 'your-email@example.com';
```

## Routes

- `/` public homepage
- `/signup` account creation with buyer or seller role selection
- `/login` email/password login for buyers, sellers, and promoted admins
- `/verify-email` app-owned verification link handler
- `/verify-email/pending` resend/check-email screen
- `/dashboard/buyer` protected buyer workspace
- `/dashboard/seller` protected seller workspace
- `/dashboard/admin` protected admin workspace

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the production build
- `npm test`: build and verify the rendered homepage
