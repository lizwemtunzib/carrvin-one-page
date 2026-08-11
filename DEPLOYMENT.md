# CarrVin Deployment

This project is no longer tied to Hostinger Horizon paths. It runs as three separate services:

- Railway service: `apps/web`
- Railway service: `apps/api`
- Railway service: `apps/pocketbase`

Cloudflare sits in front of all three as DNS + proxy only. An earlier draft of this
document planned `apps/web` for Cloudflare Pages; that is not what is deployed.
Verified 2026-08-12 — responses from `carrvin.com` carry `x-railway-request-id` and
`x-railway-edge` headers, which means the origin is Railway, with Cloudflare proxying.

## Target domains

- `carrvin.com` and `www.carrvin.com` -> Railway web service (proxied by Cloudflare)
- `api.carrvin.com` -> Railway API service
- `pb.carrvin.com` -> Railway PocketBase service

## Architecture

- The frontend is a Vite/React static app.
- The API is an Express service for MailerLite, PDF confirmation, admin login, and sync tasks.
- PocketBase stores blog posts, PDF downloads, resources, and uploaded files.

## 1. PocketBase on Railway

- Create a Railway service from `apps/pocketbase`.
- Start command: `npm run start`
- Attach a persistent volume mounted at `/data`
- Add environment variable `PB_ENCRYPTION_KEY`
- Add a custom domain: `pb.carrvin.com`

PocketBase uses `--dir=/data`, so Railway must provide persistent storage before production cutover.

## 2. API on Railway

- Create a Railway service from `apps/api`
- Start command: `npm run start`
- Add a custom domain: `api.carrvin.com`

Recommended environment variables:

- `PORT=3001`
- `CORS_ORIGIN=https://carrvin.com`
- `POCKETBASE_URL=https://pb.carrvin.com`
- `POCKETBASE_DEV_URL=https://pb.carrvin.com`
- `POCKETBASE_LIVE_URL=https://pb.carrvin.com`
- `MAILERLITE_API_KEY=...`
- `MAILERLITE_GROUP_ID=...`
- `ADMIN_EMAIL=...`
- `ADMIN_PASSWORD=...`
- `JWT_SECRET=...`
- `PB_SUPERUSER_EMAIL=...`
- `PB_SUPERUSER_PASSWORD=...`

If you later remove the blog sync workflow, `POCKETBASE_DEV_URL` and `POCKETBASE_LIVE_URL` can be retired.

## 3. Frontend on Railway

- Create a Railway service from `apps/web`
- Build command: `npm run build`
- Output directory: `dist`
- Add custom domains: `carrvin.com` and `www.carrvin.com`

Environment variables:

- `VITE_API_URL=https://api.carrvin.com`
- `VITE_POCKETBASE_URL=https://pb.carrvin.com`

Vite inlines `VITE_*` values at build time, so changing either one requires a
redeploy, not just a restart.

## 4. DNS in Cloudflare

Create or update these DNS records, pointing at each Railway service's custom
domain target:

- `@` -> Railway web service
- `www` -> Railway web service
- `api` -> Railway API service
- `pb` -> Railway PocketBase service

## 5. Data migration

Before switching traffic:

- Back up `apps/pocketbase/pb_data`
- Upload or copy the current PocketBase database and storage files into Railway's mounted volume
- Verify PocketBase collections, uploaded PDFs, and admin access

## 6. Security cleanup

Checked 2026-08-12: the repo is clean. Only `.env.example` files are tracked, no
real `.env` has ever been committed on any branch, and `.gitignore` excludes
`.env` / `.env.*` while keeping `.env.example`. The earlier warning that "this
repo currently contains local environment files" no longer applies.

Still worth confirming, since it cannot be verified from the repo alone:

- rotate MailerLite credentials
- rotate admin credentials
- rotate `JWT_SECRET`
- keep real secrets only in Railway environment settings

## 7. Static assets

Images must be committed under `apps/web/public` and referenced by root-relative
path (`/carrvin-logo.jpg`). Do not hot-link assets from an external CDN.

The logo and favicon were originally hot-linked from
`horizons-cdn.hostinger.com`. That CDN was decommissioned along with the
Hostinger migration, both files started returning 404, and the live site showed
the `alt` text in place of the logo until they were self-hosted on 2026-08-12.
