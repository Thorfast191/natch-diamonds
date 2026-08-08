# Natch Diamonds — Demo Site Design

Date: 2026-08-08
Status: Approved

## Purpose

Single-page Next.js demo for a luxury diamond jewellery brand, built for a
client pitch. Must look editorial/restrained (Cartier/Messika/Bvlgari
register) and must prove real platform capability a stock Shopify theme
can't match: a live database-backed product grid, two working lead-capture
forms (Bespoke, Sourcing) with server-side persistence and image upload,
and an admin view that proves the data loop closes.

The full functional/visual spec (sections, palette, animation rules,
Prisma schema) was provided by the user as a complete build brief. This
document captures the build decisions made on top of that brief where it
left room for judgment, plus the answers to the clarifying questions
asked before implementation.

## Decisions made during brainstorming

| Question | Decision |
|---|---|
| Infra accounts (Neon/Cloudinary/Vercel) | Scaffold the full app first; create accounts and wire env vars together afterward. No deploy without explicit go-ahead. |
| Product seed images | Placeholder Unsplash diamond-jewelry photos, 2 per collection (6 products), via `prisma/seed.ts`. Swappable to real Cloudinary URLs later — same field. |
| Package manager | npm |
| Display font | Cormorant Garamond (chosen over Playfair Display for a thinner, more editorial weight) paired with Inter for body |
| `/admin` auth | Simple password gate: `ADMIN_PASSWORD` env var, checked via a login server action that sets an httpOnly cookie, enforced by `middleware.ts` on `/admin/*`. No user accounts/session store. |

## Stack

- Next.js 14, App Router, TypeScript
- Tailwind CSS
- Framer Motion
- Prisma ORM → Neon (serverless Postgres) via `DATABASE_URL`
- `next-cloudinary`'s `CldUploadWidget` for unsigned client-side image
  upload (no custom upload API route needed)
- Deployable to Vercel

## Project structure

```
app/
  layout.tsx            # fonts, metadata, global providers
  page.tsx               # server component: fetches products, composes sections
  admin/
    page.tsx             # server component: lists inquiries (guarded by middleware)
    login/page.tsx        # password form
  globals.css
components/
  Hero.tsx
  CollectionGrid.tsx
  ProductCard.tsx
  ScrollStory.tsx         # "Three Houses, One Vision"
  BespokeForm.tsx
  SourcingForm.tsx
  Footer.tsx
actions/
  bespoke.ts              # 'use server' — create BespokeInquiry
  sourcing.ts             # 'use server' — create SourcingInquiry
  admin-auth.ts           # 'use server' — check password, set cookie
lib/
  prisma.ts               # Prisma client singleton
  motion.ts                # shared ease curve + variants, reduced-motion aware
middleware.ts              # guards /admin/*
prisma/
  schema.prisma
  seed.ts
```

## Data layer

`prisma/schema.prisma` exactly as specified in the source brief: `Product`,
`BespokeInquiry`, `SourcingInquiry`. `prisma/seed.ts` inserts 6 `Product`
rows (2 each for "The Studs" / "The Hoops" / "The Tennis") using Unsplash
photo URLs as stand-ins for real Cloudinary URLs.

## Pages & animation system

`app/page.tsx` fetches products server-side via Prisma and renders, in
order: Hero, CollectionGrid, ScrollStory, BespokeForm, SourcingForm,
Footer. `lib/motion.ts` centralizes the ease curve `[0.22, 1, 0.36, 1]`
and variant objects so every section animates consistently, and wraps
`useReducedMotion()` so all animated components fall back to opacity-only
transitions when the user has reduced motion enabled.

**Hero**: dark full-viewport section, product image fades/scales in on
load, headline + subheadline staggered, pulsing scroll-indicator line.

**CollectionGrid**: server-rendered product cards from Neon, stagger
fade-up on `whileInView` (`once: true`), hover scale + animated gold
underline.

**ScrollStory** (highest-risk interaction): a 300vh container wrapping a
`position: sticky` panel. `useScroll({ target })` + `useTransform` derive
a 0/1/2 index from scroll progress across three thresholds
(Collection/Bespoke/Sourcing), with text crossfading via `AnimatePresence`
as thresholds are crossed. Below the `md` breakpoint the sticky pin is
dropped — panels stack and reveal individually via `whileInView` instead
— to avoid the jank a pinned layout causes on small viewports.

**Footer**: dark, minimal, gold hairline divider.

## Forms

`BespokeForm` and `SourcingForm` are client components submitting to
`'use server'` actions that validate input and write via Prisma
(`actions/bespoke.ts`, `actions/sourcing.ts`). Both use `useTransition`
so submission never triggers a full page reload, and both show a
fade+scale success state on completion.

- **BespokeForm**: embeds `CldUploadWidget` for the optional inspiration
  photo — preview and upload progress come from the widget's own
  callbacks against the unsigned preset in
  `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
- **SourcingForm**: buyer-type toggle (private/trade); the company-name
  field animates in/out via `AnimatePresence` only when "trade" is
  selected; writes `interest` (natural/lab-grown/both) alongside.

## Admin (`/admin`)

Server component listing `BespokeInquiry` and `SourcingInquiry` rows
newest-first in plain tables, with Cloudinary thumbnails on Bespoke rows.
Guarded: `middleware.ts` checks for a signed session cookie on
`/admin` and `/admin/*` (except `/admin/login`); missing/invalid cookie
redirects to `/admin/login`, which posts to `actions/admin-auth.ts` to
check `ADMIN_PASSWORD` and set the cookie on success.

## Env vars

```
DATABASE_URL=<neon connection string>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<unsigned upload preset>
ADMIN_PASSWORD=<shared password for /admin>
```

## Deployment

App is built and run locally first (dev DB the user and I set up
together). README documents: creating a free Neon project, running
`npx prisma migrate dev`, creating a free Cloudinary account + unsigned
upload preset, setting all four env vars, and deploying via
`vercel deploy`. Actual account creation and the live `vercel deploy` /
push happen in an explicitly confirmed follow-up step — not run
automatically as part of the build.

## Out of scope

- Cart/checkout, payments
- Real product photography (placeholder Unsplash images stand in until
  the user provides real Natch Diamonds photos)
- Multi-user admin accounts / RBAC
- Email notifications on inquiry submission
