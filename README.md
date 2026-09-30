# Sandeep Sathivada — Portfolio

Next.js 14 (App Router) + Tailwind + Supabase, built from the Figma design at
`Team Design Help / Main Design – Front end` (file `WrdJurkSuBHNiZpy9YHNRs`).

Four tabs:

- `/` — Designs (3×3 image grid)
- `/videos` — Videos (2×3 with play affordance)
- `/appreciations` — Testimonial cards
- `/about` — About / Timeline toggle with side panels

The site renders correctly **without Supabase configured** — it falls back to
static seed data in `lib/fallback-content.ts`. Wire up Supabase later without
changing any page code.

## Local run

```bash
cd "Portfolio Website"
npm install
npm run dev
```

Then open http://localhost:3000. Toggle theme via the switch in the top nav.

## Optional: wire up Supabase (CMS)

1. Create a new Supabase project.
2. In the SQL editor, run `supabase/schema.sql` then `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and paste your `Project URL` and
   `anon public` key (Project settings → API).
4. Restart `npm run dev`. Pages now read from Supabase; if the request fails
   or env vars are missing, they fall back to seed data silently.

To edit content, use the Supabase Table Editor — rows are ordered by
`order_index`. No redeploy needed.

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub / GitLab / Bitbucket).
2. On https://vercel.com → **Add New Project** → import the repo.
   Framework preset auto-detects **Next.js**.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Skip this step if you're deploying without Supabase — the site will use
   the built-in fallback data.)
4. Click **Deploy**. Every push to `main` auto-deploys after that.

## Project layout

```
app/
  layout.tsx           shared shell (top nav, profile, tabs, footer)
  page.tsx             /  → Designs grid
  videos/page.tsx      /videos
  appreciations/page.tsx
  about/page.tsx       /about (About/Timeline toggle)
components/
  theme-provider.tsx   light/dark, persisted in localStorage
  top-nav.tsx          IST clock + theme switch
  profile-header.tsx   avatar, bio, socials
  tabs-nav.tsx         underline-on-active tab bar
  about-switcher.tsx   About ↔ Timeline
  footer.tsx
lib/
  supabase.ts          lazy client
  content.ts           Supabase-first fetchers with fallback
  fallback-content.ts  seed data used when Supabase isn't set up
  types.ts
supabase/
  schema.sql           tables + read-only RLS
  seed.sql             matches fallback data
public/
  avatar.svg           SS monogram placeholder — swap for real logo
  about-banner.svg     illustrated placeholder banner — swap for real art
```

## Swapping placeholder assets

- **Avatar / logo** — replace `public/avatar.svg` with your final logo
  (any square PNG/SVG works; the header crops it to a circle).
- **About banner** — replace `public/about-banner.svg` with the finished
  illustration; the container is 16:5.
- **Gallery imagery** — either edit `lib/fallback-content.ts` or update the
  `image_url` values in the `designs` table.

## Notes

- Only two animations are used (`animate-fade-up`, `animate-fade-in`) — kept
  short and staggered to feel calm rather than showy.
- Fonts are loaded from Google Fonts (`Inter`, `Caveat`). If you'd rather bundle
  them via `next/font`, that's a one-file change in `app/layout.tsx`.
