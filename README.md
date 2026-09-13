# STREAMsub

A small PWA for tracking the family's streaming subscriptions — what you're
subscribed to, where it's paid from, cost, billing cycle, start/renewal
dates, and the account credentials.

- **Frontend:** Vite + React + TypeScript + Tailwind, packaged as an
  installable PWA (offline shell + manifest via `vite-plugin-pwa`).
- **Backend:** Supabase (Postgres) — schema lives in `supabase/migrations`.
- **Access control:** the page sits behind Cloudflare Access (Google login,
  restricted to the family), and Supabase Auth (Google OAuth) issues a
  second session so row-level security can require an authenticated user.
- **Hosting:** Cloudflare Pages, deployed from this repo.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

`.env.local` is git-ignored — never commit real Supabase credentials. The
anon key is safe to expose in client code; row-level security policies on
the database are what actually gate access.

## Database

Schema changes live as SQL migrations in `supabase/migrations/`. Apply them
with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Building

```bash
npm run build
npm run preview
```
