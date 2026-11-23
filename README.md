# Sandeep Sathivada — Portfolio

Next.js 14 (App Router) + Tailwind portfolio, deployed on Vercel. The custom CMS dashboard remains inside this Next.js app at `/cms`; its data, authentication validation, and media storage are provided by a Cloudflare Worker, D1, and R2.

## Architecture

- **Vercel:** Public portfolio and CMS dashboard (`/cms`).
- **Cloudflare Workers:** CMS API, administrator sign-in, and public media delivery.
- **Cloudflare D1:** Draft and published JSON snapshots.
- **Cloudflare R2:** Uploaded photos, GIFs, and videos.
- **GitHub:** Vercel deploys the Next.js app; GitHub Actions deploys the Worker when `cloudflare/` changes.

See [CLOUDFLARE-MIGRATION.md](./CLOUDFLARE-MIGRATION.md) for the full resource setup, environment variables, GitHub connection, content import, and verification checklist.

## Local run

```bash
npm install
cp .env.example .env.local
# Fill in the Cloudflare Worker URL, CMS session secret, and enable flag.
npm run dev
```

Open http://localhost:3000. The public site falls back to `lib/fallback-content.ts` if the Cloudflare published snapshot has not been imported yet.

## Deploy the Next.js app

Keep the existing GitHub → Vercel integration. Add the variables documented in `.env.example` to Vercel and redeploy. Vercel continues to deploy the root Next.js project on pushes to the connected branch.

## Deploy the Cloudflare API

Follow the Cloudflare setup in `CLOUDFLARE-MIGRATION.md`. The Worker source and D1 migration are under `cloudflare/`. Once the GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured, pushes to `cloudflare/**` on `main` deploy the Worker.

## Project layout

```text
app/                     Next.js pages, CMS dashboard and same-origin API proxy
components/               Portfolio and CMS UI
lib/cms-store.ts          Draft/published snapshot cache and API client
lib/cms-api.ts            CMS readiness and direct-to-Worker media uploads
lib/server-content.ts     Server-side published content fetcher
lib/session.ts            Edge-compatible CMS session verification
cloudflare/src/index.ts   Worker API, auth, D1 and R2 handlers
cloudflare/migrations/    D1 schema migrations
scripts/                  One-time content import helper
.github/workflows/        Automatic Cloudflare Worker deployment
```

## Important migration note

The content import script copies the `draft` and `published` JSON snapshots from Supabase into D1. It does **not** copy media bytes. Existing project media URLs can continue pointing to Supabase while you replace/re-upload assets into R2. Keep the old Supabase project and Storage bucket active until you have verified all images and videos on the live site.
