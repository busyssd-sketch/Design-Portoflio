# Sandeep Sathivada — Portfolio

Next.js 14 (App Router) + Tailwind portfolio, deployed on Vercel.

The CMS dashboard remains part of the Next.js application at `/cms`. Its backend, authentication and media storage are powered entirely by Cloudflare Workers, D1 and R2.

## Architecture

- **Vercel:** Public portfolio and CMS dashboard.
- **Cloudflare Workers:** CMS API, administrator authentication and public media delivery.
- **Cloudflare D1:** Draft and published content snapshots.
- **Cloudflare R2:** Uploaded photos, GIFs and videos.
- **GitHub:** Source-code version control and deployment integration.

See [CLOUDFLARE-MIGRATION.md](./CLOUDFLARE-MIGRATION.md) for the Cloudflare resource configuration, environment variables, deployment instructions and operational guide.

## Local development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the Cloudflare Worker URL, CMS session secret and CMS enable flag in `.env.local`.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment

### Next.js application

1. Commit and push changes to the connected GitHub branch.
2. Vercel automatically builds and deploys the application.
3. CMS content changes do not require a new deployment.

### Cloudflare Worker

The Worker source and D1 migrations are maintained under `cloudflare/`.

The repository includes a GitHub Actions workflow for automated Worker deployment. Configure the required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Worker code changes can then be deployed through the configured workflow.

## Project structure

```text
app/                     Next.js pages, CMS dashboard and API proxy
components/              Portfolio and CMS UI
lib/cms-store.ts         Draft/published snapshot cache and API client
lib/cms-api.ts           CMS readiness and media upload handling
lib/server-content.ts    Server-side published content fetcher
lib/session.ts           CMS session verification
cloudflare/src/index.ts  Worker API, authentication, D1 and R2 handlers
cloudflare/migrations/   D1 schema migrations
.github/workflows/       Cloudflare Worker deployment workflow
```

## Content publishing

1. Sign in through `/cms/login`.
2. Edit your portfolio content.
3. Save and publish.
4. Cloudflare D1 stores the updated content.
5. The public website displays the published version automatically.

Media uploads are stored in Cloudflare R2 and delivered through the Worker.

## Important deployment distinction

- Content updates through the CMS do not require a deployment.
- Application code and design changes require a Vercel deployment.
- Cloudflare Worker code changes require a Worker deployment.

## Security and maintenance

- Keep administrator credentials and session secrets private.
- Never expose Cloudflare API tokens in frontend code.
- Keep independent backups of D1 data and R2 media.
- Do not upload confidential or private files to the public portfolio media bucket.