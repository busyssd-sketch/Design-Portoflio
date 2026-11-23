# Portfolio CMS: Vercel + Cloudflare migration

## Target architecture

- **Vercel:** Keep the existing Next.js portfolio and `/cms` dashboard here.
- **Cloudflare Worker:** Private CMS API, administrator login validation, and public media delivery.
- **Cloudflare D1:** Stores the existing JSON snapshots (`draft` and `published`).
- **Cloudflare R2:** Stores uploaded images, GIFs and video files.
- **GitHub:** Continues deploying the Next.js app to Vercel. A GitHub Actions workflow deploys the Worker when files under `cloudflare/` change.

The CMS dashboard remains part of the existing Next.js app. This avoids splitting or rebuilding the UI. The browser sends uploads directly to the Worker/R2 using short-lived upload tickets; large media files do not pass through Vercel serverless functions.

## 1. Create Cloudflare resources

1. Sign in at https://dash.cloudflare.com/.
2. Open **Workers & Pages** and create/enable a Workers project.
3. Install Node.js 22 on your computer.
4. Open a terminal in this project's `cloudflare` folder and run:

   ```bash
   npm install
   npx wrangler login
   npx wrangler d1 create portfolio-cms
   ```

5. Copy the returned D1 `database_id` into `cloudflare/wrangler.toml`, replacing `REPLACE_WITH_D1_DATABASE_ID`.
6. Create the R2 bucket:

   ```bash
   npx wrangler r2 bucket create portfolio-media
   ```

7. Apply the D1 schema:

   ```bash
   npx wrangler d1 migrations apply portfolio-cms --remote
   ```

## 2. Configure Worker secrets and variables

Generate one strong session secret:

```bash
openssl rand -base64 48
```

Set these Worker secrets (use the same email/password that you will enter on `/cms/login`):

```bash
npx wrangler secret put CMS_ADMIN_EMAIL
npx wrangler secret put CMS_ADMIN_PASSWORD
npx wrangler secret put CMS_SESSION_SECRET
```

In `cloudflare/wrangler.toml`, set `MEDIA_PUBLIC_BASE_URL` to the Worker URL you will receive after deployment, for example:

`https://portfolio-cms-api.YOUR-SUBDOMAIN.workers.dev`

Set `CMS_ORIGIN` to your exact Vercel website origin, without a trailing slash, e.g. `https://your-project.vercel.app`. You may provide a comma-separated list to allow local testing too, e.g. `https://your-project.vercel.app,http://localhost:3000`. Keep only trusted origins in this list. This origin is used only for browser-to-Worker media uploads.

Deploy the Worker once:

```bash
npx wrangler deploy
```

Check `https://YOUR-WORKER-URL/health`; it should return `{"ok":true,...}`.

After deployment, set `MEDIA_PUBLIC_BASE_URL` to the actual Worker URL and deploy again if it was still a placeholder.

## 3. Configure Vercel

In Vercel → your project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CMS_ENABLED` | `true` |
| `CLOUDFLARE_CMS_API_URL` | Your Worker URL, e.g. `https://portfolio-cms-api.YOUR-SUBDOMAIN.workers.dev` |
| `CMS_SESSION_SECRET` | The exact same secret set on the Worker |

Add them to Production and Preview as appropriate, but **do not redeploy Vercel with the new API URL until after you have imported your Supabase snapshots in step 5**. Otherwise the live site will temporarily show its built-in fallback content because the new D1 database is still empty. For local development, copy `.env.example` to `.env.local` and fill in the same values.

## 4. Connect Cloudflare deployment to GitHub

The repository includes `.github/workflows/deploy-cloudflare.yml`.

1. Push this project to GitHub (keep your current Vercel GitHub integration unchanged).
2. In Cloudflare, create an API token with permission to deploy Workers and manage the required D1/R2 resources as needed.
3. In GitHub → repository → **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Push changes to `cloudflare/` on the `main` branch. GitHub Actions will deploy the Worker.

Vercel will continue deploying the Next.js app from the same GitHub repository. Cloudflare's Worker deployment is an additional workflow, not a replacement for Vercel.

## 5. Import existing Supabase content

Do not delete or pause your Supabase project yet.

In the Supabase SQL editor, run:

```sql
select kind, data, updated_at
from public.site_content
order by kind;
```

Export/copy the two returned rows as JSON into a local file named `supabase-content-export.json`. The file should be an array like:

```json
[
  { "kind": "draft", "data": { "...": "..." }, "updated_at": "2026-01-01T00:00:00Z" },
  { "kind": "published", "data": { "...": "..." }, "updated_at": "2026-01-01T00:00:00Z" }
]
```

Run the import script from the project root (do not commit the export file):

```bash
CLOUDFLARE_CMS_API_URL="https://YOUR-WORKER-URL" \
CMS_ADMIN_EMAIL="your-admin-email" \
CMS_ADMIN_PASSWORD="your-admin-password" \
node scripts/import-cloudflare-content.mjs ./supabase-content-export.json
```

The import script copies both JSON snapshots into D1. **It does not copy the actual media files.** Existing snapshot URLs will continue pointing to Supabase Storage until you upload/replace those assets in the CMS with their new R2 URLs. Keep Supabase Storage active until you have checked and migrated all images/videos. Once the import succeeds, redeploy Vercel so the live site starts reading the imported `published` snapshot from D1.

## 6. Verify before switching off Supabase

1. Visit `/api/debug` on the Vercel site and confirm `backendConfigured: true` and a non-epoch `updated_at`.
2. Sign in at `/cms/login` with the Worker admin credentials.
3. Check that the existing draft and published content appears.
4. Change a small text field, save, refresh, and confirm it persists.
5. Upload a small image and a short video/GIF; confirm the returned URL starts with your Worker URL and the asset loads publicly.
6. Publish a harmless test change and confirm the public Vercel site updates.
7. Only after all media has been migrated and verified should you remove Supabase environment variables and retire the Supabase project.

## Security and operational notes

- Never put `CMS_SESSION_SECRET`, the administrator password, Cloudflare API tokens, or R2 credentials in `NEXT_PUBLIC_*` variables or browser code.
- The admin password is configured as a Worker secret; the session cookie is HttpOnly, Secure in production, and validated by both Next middleware and the Worker.
- Use a unique, strong CMS password. Consider adding Cloudflare rate limiting/WAF rules to `/auth/login` before public launch.
- R2 media URLs served through this Worker are public, which is appropriate for portfolio assets. Do not upload private documents or confidential client files to this public bucket.
- Keep a separate backup of the D1 snapshots and original media. R2 is storage, not a backup strategy.
- The current video UI limit remains 100 MB and 10 minutes. Large video streaming/transcoding is not included; R2 serves the original uploaded file.
