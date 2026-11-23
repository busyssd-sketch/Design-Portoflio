# Portfolio CMS — Cloudflare Operations Guide

## 1. Architecture

The portfolio uses a hybrid hosting architecture with Cloudflare as its only CMS backend.

| Service | Responsibility |
|---|---|
| Vercel | Hosts the Next.js portfolio and CMS dashboard |
| Cloudflare Workers | CMS API, authentication and public media delivery |
| Cloudflare D1 | Stores draft and published content snapshots |
| Cloudflare R2 | Stores images, GIFs and video files |
| GitHub | Source-code version control and deployment integration |

### Application URLs

- Public website: `https://design-portoflio.vercel.app/`
- CMS dashboard: `https://design-portoflio.vercel.app/cms`
- CMS login: `https://design-portoflio.vercel.app/cms/login`
- Cloudflare Worker: `https://portfolio-cms-api.ssdcreatives.workers.dev`

The custom domain can be configured later.

## 2. Cloudflare resources

### Worker

- Name: `portfolio-cms-api`
- URL: `https://portfolio-cms-api.ssdcreatives.workers.dev`

Responsibilities:
- Administrator authentication
- CMS content API
- Session validation
- Media upload authorization
- Public media delivery

### D1 database

- Database name: `portfolio-cms`
- Database ID: `1c1b5d72-a008-4e5b-b33e-1cd36231dd71`

Stores:
- Draft content
- Published content
- Content update timestamps

### R2 bucket

- Bucket name: `portfolio-media`

Stores uploaded portfolio media.

## 3. Environment configuration

### Cloudflare Worker secrets

The following secrets are configured in Cloudflare:

- `CMS_ADMIN_EMAIL`
- `CMS_ADMIN_PASSWORD`
- `CMS_SESSION_SECRET`

Never commit these values to GitHub or expose them in frontend code.

### Worker configuration

The `cloudflare/wrangler.toml` file contains the Worker name, D1 binding, R2 binding, allowed CMS origins and media URL configuration.

### Vercel environment variables

The following variables are configured for Production and Preview:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CMS_ENABLED` | Enables the CMS |
| `CLOUDFLARE_CMS_API_URL` | Cloudflare Worker API endpoint |
| `CMS_SESSION_SECRET` | Session validation secret shared with Worker |

Keep the session secret identical between Vercel and Cloudflare.

## 4. Content publishing workflow

1. Open the CMS dashboard.
2. Log in using the Cloudflare administrator credentials.
3. Edit portfolio content.
4. Save the changes.
5. Publish the changes.
6. The Worker stores the content in D1.
7. The public portfolio fetches the published content.

CMS content changes do not require a Vercel deployment.

## 5. Media upload workflow

- Uploads are authorized through the Cloudflare Worker.
- Media files are stored in the `portfolio-media` R2 bucket.
- Public media is delivered through the Worker URL.
- The current media upload limit is 100 MB.
- The current video UI limit is 10 minutes.

Do not upload confidential client files or private documents because portfolio media is publicly accessible.

## 6. Deployment workflow

### Next.js application

1. Make code changes locally.
2. Test using `npm.cmd run build`.
3. Commit changes to Git.
4. Push to the GitHub `main` branch.
5. Vercel automatically builds and deploys the application.

### Cloudflare Worker

The Worker source code is maintained in the `cloudflare/` directory.

The repository includes `.github/workflows/deploy-cloudflare.yml` for automated Worker deployment when the configured workflow conditions are met.

### Important distinction

- CMS content changes: no deployment required.
- Next.js layout, design or application code changes: Vercel deployment required.
- Cloudflare Worker code changes: Worker deployment required.

## 7. Security and maintenance

- Never expose administrator credentials or session secrets.
- Keep Cloudflare API tokens out of frontend code.
- Use a strong, unique CMS password.
- Keep D1 backups and original media backups separately.
- Consider Cloudflare rate limiting for the login endpoint.
- Review Worker logs if CMS requests fail.
- Keep the allowed CMS origins restricted to trusted domains.

## 8. Current migration status

The following have been verified:

- Cloudflare Worker deployed successfully.
- D1 database connected and storing content.
- R2 bucket connected and storing uploaded images.
- CMS login working in Production.
- CMS content updates saving successfully.
- Public portfolio reflecting published changes without a Vercel redeployment.
- Supabase runtime dependency removed from the application.
- Supabase image-domain configuration removed.

The remaining cleanup is to remove obsolete Supabase documentation and environment variables from Vercel, then complete the final Cloudflare-only verification.