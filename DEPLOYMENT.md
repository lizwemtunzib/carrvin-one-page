# CarrVin Deployment

This project is no longer tied to Hostinger Horizon paths. Deploy it as three separate services:

- Cloudflare Pages: `apps/web`
- Railway service: `apps/api`
- Railway service: `apps/pocketbase`

## Target domains

- `carrvin.com` and `www.carrvin.com` -> Cloudflare Pages
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

## 3. Frontend on Cloudflare Pages

- Project root: `apps/web`
- Build command: `npm run build`
- Output directory: `../../dist/apps/web`

Environment variables:

- `VITE_API_URL=https://api.carrvin.com`
- `VITE_POCKETBASE_URL=https://pb.carrvin.com`

Add custom domains in Cloudflare Pages:

- `carrvin.com`
- `www.carrvin.com`

## 4. DNS in Cloudflare

Create or update these DNS records after Pages and Railway assign targets:

- `@` -> Cloudflare Pages
- `www` -> Cloudflare Pages
- `api` -> Railway custom domain target
- `pb` -> Railway custom domain target

## 5. Data migration

Before switching traffic:

- Back up `apps/pocketbase/pb_data`
- Upload or copy the current PocketBase database and storage files into Railway's mounted volume
- Verify PocketBase collections, uploaded PDFs, and admin access

## 6. Security cleanup

This repo currently contains local environment files. After migration:

- rotate MailerLite credentials
- rotate admin credentials
- rotate `JWT_SECRET`
- keep real secrets only in Railway and Cloudflare environment settings
