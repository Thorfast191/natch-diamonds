# Natch Diamonds — Demo

A single-page Next.js demo for Natch Diamonds: a live product collection, a
bespoke inquiry form with photo upload, a diamond sourcing form for private
and trade buyers, and a password-protected admin view — all backed by a
real Postgres database.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Prisma + Neon (Postgres) · Cloudinary (image upload)

## Local setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values (see below).
3. Apply the database schema:
   ```
   npx prisma migrate dev
   ```
4. Seed placeholder products:
   ```
   npm run seed
   ```
5. Run the dev server:
   ```
   npm run dev
   ```

## Creating the required accounts

### Neon (Postgres database) — free tier

1. Go to https://neon.tech and create a free account.
2. Create a new project.
3. Copy the connection string it gives you (starts with `postgresql://`)
   into `DATABASE_URL` in `.env`. Use the pooled connection string if
   offered.
4. Run `npx prisma migrate dev` to create the tables on Neon.

### Cloudinary (image upload) — free tier

1. Go to https://cloudinary.com and create a free account.
2. From the dashboard, copy your **Cloud name** into
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
3. Go to Settings → Upload → Upload presets → Add upload preset.
4. Set **Signing Mode** to **Unsigned**, save, and copy the preset name
   into `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

### Admin password

Set `ADMIN_PASSWORD` in `.env` to whatever password you'll use to view
`/admin`. It's checked with a constant-time comparison and used to sign
the session cookie — anyone with this password can view submitted
inquiries, so treat it like a real credential.

## Deploying to Vercel

```
npx vercel
```

Set the four environment variables (`DATABASE_URL`,
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`,
`ADMIN_PASSWORD`) in the Vercel project settings (or via
`vercel env add`), then:

```
npx vercel --prod
```

## Testing

```
npm test
```

Runs unit tests for the shared motion utilities, the scroll-story index
math, the admin session token logic, and the form validation logic.

## Admin view

Visit `/admin` and sign in with `ADMIN_PASSWORD` to see Bespoke and
Sourcing inquiries as they're submitted, newest first.
