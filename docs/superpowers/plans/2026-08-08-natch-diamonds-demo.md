# Natch Diamonds Demo Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js 14 demo for Natch Diamonds — an animated marketing site with a live database-backed product grid, a scroll-driven story section, two working lead-capture forms (Bespoke with Cloudinary photo upload, Sourcing with private/trade branching), and a password-protected admin view — deployable to Vercel.

**Architecture:** Next.js 14 App Router app. `app/page.tsx` is a server component that fetches products via Prisma and composes client components for each animated section. Two Server Actions persist form submissions to Postgres (Neon in production, a local Postgres database during this build). A cookie-based password gate (HMAC-signed token, no session store) protects `/admin`. Animation logic that has real branching (scroll-index math, reduced-motion variant selection, session-token validity, form validation) is extracted into small pure functions and unit-tested; presentational components are verified by actually running the dev server and driving it with Playwright.

**Tech Stack:** Next.js 14 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Prisma + Postgres (local Postgres 18 for this build, Neon in production) · `next-cloudinary` (`CldUploadWidget`) · Vitest · Playwright (verification only, via MCP tools) · npm

## Global Constraints

- Next.js 14, App Router, TypeScript, npm as package manager (no yarn/pnpm lockfiles).
- Tailwind CSS for all layout/spacing; Framer Motion for all animation.
- Palette: ivory `#FAF8F3` (light sections), near-black `#141414` (hero/footer, referenced as `charcoal`), gold `#B08D57` (accent, sparing use, referenced as `gold`), ink `#1A1A1A` (text on light, referenced as `ink`), white text on dark sections.
- Display font Cormorant Garamond, body font Inter, both via `next/font/google`.
- Animation ease is always `[0.22, 1, 0.36, 1]` — never linear, never spring/bounce.
- No animation duration below 0.4s or above 1.5s (an ambient/looping indicator may loop indefinitely but each individual cycle must still be ≤ 1.5s).
- All scroll-triggered animation uses `whileInView` with `viewport={{ once: true }}` — never re-trigger on scroll-back-up.
- Respect `prefers-reduced-motion`: every animated component must fall back to an opacity-only transition (no y/x/scale movement) when `useReducedMotion()` is true.
- No layout-jank-causing parallax on mobile; verify at 375px width.
- Prisma schema fields/types are exactly as specified in the source brief (`Product`, `BespokeInquiry`, `SourcingInquiry`) — do not rename or add fields beyond what's listed in Task 2.
- `/admin` is protected by a password gate (`ADMIN_PASSWORD` env var + httpOnly signed cookie) — this was added during design review; the original brief didn't specify it, but it's now a hard requirement since the site deploys to a public URL.
- During this build, a local Postgres database stands in for Neon (identical wire protocol — swapping `DATABASE_URL` to a Neon connection string later requires no code changes). Do not hardcode anything Neon-specific.
- Do not run `vercel deploy` or create the real Neon/Cloudinary accounts as part of this plan — that happens in an explicitly confirmed follow-up step after implementation.
- Images are rendered with plain `<img>` (not `next/image`) so the app isn't coupled to a not-yet-known Cloudinary domain for `remotePatterns` — each such tag needs `{/* eslint-disable-next-line @next/next/no-img-element */}` above it.

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `next-env.d.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `vitest.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx` (placeholder, replaced incrementally in later tasks)

**Interfaces:**
- Produces: Tailwind color tokens `ivory` `#FAF8F3`, `charcoal` `#141414`, `gold` `#B08D57`, `ink` `#1A1A1A`; font families `font-display` (Cormorant Garamond) and `font-sans`/body (Inter) exposed via CSS variables `--font-display` / `--font-body`. Path alias `@/*` → project root. `npm test` runs Vitest; `npm run dev`/`build`/`start`/`lint`/`seed` all defined.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "natch-diamonds",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "framer-motion": "^11.5.0",
    "next": "^14.2.5",
    "next-cloudinary": "^6.13.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "postcss": "^8.4.40",
    "prisma": "^5.20.0",
    "tailwindcss": "^3.4.7",
    "tsx": "^4.16.5",
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.js`, `next-env.d.ts`, `.eslintrc.json`, `.gitignore`**

`next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
```

`next-env.d.ts`:
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

`.eslintrc.json`:
```json
{
  "extends": "next/core-web-vitals"
}
```

`.gitignore`:
```
node_modules
.next
.env
.env*.local
.DS_Store
*.tsbuildinfo
```

- [ ] **Step 4: Write `tailwind.config.ts` and `postcss.config.js`**

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F3',
        charcoal: '#141414',
        gold: '#B08D57',
        ink: '#1A1A1A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

`postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 6: Write `app/globals.css`, `app/layout.tsx`, placeholder `app/page.tsx`**

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Natch Diamonds',
  description:
    'Natural and lab-grown diamond jewellery — collection, bespoke, and trade sourcing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ivory font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
```

`app/page.tsx` (placeholder — replaced with the full composition in Task 12):
```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-display text-4xl text-ink">Natch Diamonds</h1>
    </main>
  )
}
```

- [ ] **Step 7: Install dependencies and verify the app runs**

Run: `npm install`
Expected: installs without error, creates `package-lock.json`.

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` then wait a few seconds and check the output for `Ready in`.
Then fetch `http://localhost:3000` (e.g. `curl -s http://localhost:3000 | grep -i "Natch Diamonds"`) and confirm the placeholder heading is present.
Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 8: Verify production build**

Run: `npm run build`
Expected: build completes successfully with no type errors.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.js next-env.d.ts tailwind.config.ts postcss.config.js .eslintrc.json .gitignore vitest.config.ts app/
git commit -m "Scaffold Next.js 14 project with Tailwind, Framer Motion, and fonts"
```

---

### Task 2: Prisma schema, local dev database, Prisma client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `.env` (not committed)
- Create: `.env.example`

**Interfaces:**
- Consumes: nothing (first data-layer task).
- Produces: `prisma` singleton exported from `@/lib/prisma`, typed via generated `@prisma/client` with models `Product { id, name, collection, price, imageUrl, createdAt }`, `BespokeInquiry { id, name, email, description, inspirationImageUrl, createdAt }`, `SourcingInquiry { id, name, email, buyerType, companyName, interest, details, createdAt }`. All later tasks import `prisma` from `@/lib/prisma` and use these exact field names.

- [ ] **Step 1: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id         String   @id @default(cuid())
  name       String
  collection String
  price      Int
  imageUrl   String
  createdAt  DateTime @default(now())
}

model BespokeInquiry {
  id                  String   @id @default(cuid())
  name                String
  email               String
  description         String
  inspirationImageUrl String?
  createdAt           DateTime @default(now())
}

model SourcingInquiry {
  id          String   @id @default(cuid())
  name        String
  email       String
  buyerType   String
  companyName String?
  interest    String
  details     String
  createdAt   DateTime @default(now())
}
```

- [ ] **Step 2: Create the local dev database**

Run: `createdb natch_diamonds_dev`
Verify: `psql -l | grep natch_diamonds_dev` shows the new database.

(This uses the Postgres 18 server already running locally via `brew services` — confirmed listening on `localhost:5432` under the current OS user with trust auth, no password needed. Do not stop or reconfigure this service; only create a new database inside it.)

- [ ] **Step 3: Write `.env` (local only, gitignored) and `.env.example` (committed)**

`.env`:
```
DATABASE_URL="postgresql://macbookair@localhost:5432/natch_diamonds_dev?schema=public"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="demo"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="demo-preset"
ADMIN_PASSWORD="natch-admin-dev"
```

`.env.example`:
```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-unsigned-preset"
ADMIN_PASSWORD="choose-a-shared-admin-password"
```

- [ ] **Step 4: Run the migration**

Run: `npx prisma migrate dev --name init`
Expected: creates `prisma/migrations/<timestamp>_init/migration.sql`, applies it, and generates the Prisma client.

Verify: `psql natch_diamonds_dev -c '\dt'` lists `Product`, `BespokeInquiry`, `SourcingInquiry`, and `_prisma_migrations`.

- [ ] **Step 5: Write `lib/prisma.ts`**

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 6: Verify the client compiles and connects**

Run: `npx tsx -e "import { prisma } from './lib/prisma'; prisma.product.count().then((n) => { console.log('product count:', n); process.exit(0); })"`
Expected: prints `product count: 0` (table exists and is empty).

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/prisma.ts .env.example
git commit -m "Add Prisma schema, local dev database, and Prisma client singleton"
```

---

### Task 3: Seed script with verified placeholder product photos

**Files:**
- Create: `prisma/seed.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma` (Task 2), `Product` model shape.
- Produces: 6 `Product` rows in the database (2 each for "The Studs", "The Hoops", "The Tennis") that `CollectionGrid` (Task 9) reads.

- [ ] **Step 1: Write `prisma/seed.ts`**

The six image URLs below were fetched from live Unsplash photo pages and confirmed to return HTTP 200 before being used here — do not swap in URLs that haven't been verified the same way.

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    name: 'Solitaire Studs',
    collection: 'The Studs',
    price: 128000,
    imageUrl:
      'https://images.unsplash.com/photo-1638734205377-f21045bf6ebe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bezel Studs',
    collection: 'The Studs',
    price: 96000,
    imageUrl:
      'https://images.unsplash.com/photo-1687253946687-a3713aa25b2f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Classic Hoops',
    collection: 'The Hoops',
    price: 154000,
    imageUrl:
      'https://images.unsplash.com/photo-1677913842001-3941986ca979?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Pavé Hoops',
    collection: 'The Hoops',
    price: 187000,
    imageUrl:
      'https://images.unsplash.com/photo-1605035184674-1ee3fa430b7e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Classic Tennis Bracelet',
    collection: 'The Tennis',
    price: 342000,
    imageUrl:
      'https://images.unsplash.com/photo-1705575518997-82a71bcc75a2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tennis Necklace',
    collection: 'The Tennis',
    price: 486000,
    imageUrl:
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1200&q=80',
  },
]

async function main() {
  await prisma.product.deleteMany()
  await prisma.product.createMany({ data: products })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
```

- [ ] **Step 2: Run the seed script**

Run: `npm run seed`
Expected: exits 0 with no errors.

- [ ] **Step 3: Verify the data landed correctly**

Run: `psql natch_diamonds_dev -c 'SELECT collection, count(*) FROM "Product" GROUP BY collection ORDER BY collection;'`
Expected: three rows, each with count `2` — `The Hoops`, `The Studs`, `The Tennis`.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "Add seed script with verified placeholder product photos"
```

---

### Task 4: Shared motion utilities

**Files:**
- Create: `lib/motion.ts`
- Test: `lib/motion.test.ts`

**Interfaces:**
- Produces: `EASE: [number, number, number, number]`, `STAGGER_CHILDREN: number`. Every animated component (Tasks 8–13) imports `EASE`; `ProductCard` (Task 9) imports `STAGGER_CHILDREN` for its stagger delay.

- [ ] **Step 1: Write the failing test**

```ts
// lib/motion.test.ts
import { describe, expect, it } from 'vitest'
import { EASE, STAGGER_CHILDREN } from './motion'

describe('EASE', () => {
  it('matches the brand ease curve', () => {
    expect(EASE).toEqual([0.22, 1, 0.36, 1])
  })
})

describe('STAGGER_CHILDREN', () => {
  it('is 0.15s per the brand stagger spec', () => {
    expect(STAGGER_CHILDREN).toBe(0.15)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL — `lib/motion.ts` does not exist yet.

- [ ] **Step 3: Write `lib/motion.ts`**

```ts
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const STAGGER_CHILDREN = 0.15
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS, both assertions.

- [ ] **Step 5: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts
git commit -m "Add shared Framer Motion easing/variant utilities"
```

---

### Task 5: Scroll-story index logic (pure, tested)

**Files:**
- Create: `lib/scroll-story.ts`
- Test: `lib/scroll-story.test.ts`

**Interfaces:**
- Produces: `type StoryKey = 'collection' | 'bespoke' | 'sourcing'`, `interface StoryPanel { key: StoryKey; title: string; body: string }`, `STORY_PANELS: StoryPanel[]` (length 3, in order collection/bespoke/sourcing), `getStoryIndex(progress: number): 0 | 1 | 2`. Consumed by `ScrollStory` component in Task 10.

- [ ] **Step 1: Write the failing test**

```ts
// lib/scroll-story.test.ts
import { describe, expect, it } from 'vitest'
import { getStoryIndex, STORY_PANELS } from './scroll-story'

describe('STORY_PANELS', () => {
  it('has exactly three panels in order: collection, bespoke, sourcing', () => {
    expect(STORY_PANELS.map((panel) => panel.key)).toEqual(['collection', 'bespoke', 'sourcing'])
  })
})

describe('getStoryIndex', () => {
  it('returns 0 for the first third', () => {
    expect(getStoryIndex(0)).toBe(0)
    expect(getStoryIndex(0.32)).toBe(0)
  })

  it('returns 1 for the middle third', () => {
    expect(getStoryIndex(0.34)).toBe(1)
    expect(getStoryIndex(0.65)).toBe(1)
  })

  it('returns 2 for the final third', () => {
    expect(getStoryIndex(0.67)).toBe(2)
    expect(getStoryIndex(1)).toBe(2)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/scroll-story.test.ts`
Expected: FAIL — `lib/scroll-story.ts` does not exist yet.

- [ ] **Step 3: Write `lib/scroll-story.ts`**

```ts
export type StoryKey = 'collection' | 'bespoke' | 'sourcing'

export interface StoryPanel {
  key: StoryKey
  title: string
  body: string
}

export const STORY_PANELS: StoryPanel[] = [
  {
    key: 'collection',
    title: 'The Collection',
    body: 'Ready-to-order pieces from The Studs, The Hoops, and The Tennis — designed once, cut precisely, available now.',
  },
  {
    key: 'bespoke',
    title: 'Bespoke',
    body: 'A piece built around one idea: yours. Guided from the first sketch to the final polish.',
  },
  {
    key: 'sourcing',
    title: 'Sourcing',
    body: 'Natural or lab-grown, private client or trade buyer — stones sourced and verified to the specification you set.',
  },
]

export function getStoryIndex(progress: number): 0 | 1 | 2 {
  if (progress < 1 / 3) return 0
  if (progress < 2 / 3) return 1
  return 2
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/scroll-story.test.ts`
Expected: PASS, all 4 assertions.

- [ ] **Step 5: Commit**

```bash
git add lib/scroll-story.ts lib/scroll-story.test.ts
git commit -m "Add pure scroll-progress-to-panel-index logic for the story section"
```

---

### Task 6: Admin session logic (pure, tested)

**Files:**
- Create: `lib/session.ts`
- Test: `lib/session.test.ts`

**Interfaces:**
- Produces: `SESSION_COOKIE_NAME: string`, `checkPassword(candidate: string): boolean`, `createSessionToken(now?: number): string`, `verifySessionToken(token: string | undefined, now?: number): boolean`. Consumed by `middleware.ts` and `actions/admin-auth.ts` in Task 13.

- [ ] **Step 1: Write the failing test**

```ts
// lib/session.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkPassword, createSessionToken, verifySessionToken } from './session'

describe('admin session', () => {
  const originalPassword = process.env.ADMIN_PASSWORD

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalPassword
  })

  it('accepts the correct password', () => {
    expect(checkPassword('test-password-123')).toBe(true)
  })

  it('rejects an incorrect password', () => {
    expect(checkPassword('wrong')).toBe(false)
  })

  it('round-trips a freshly created session token', () => {
    const token = createSessionToken()
    expect(verifySessionToken(token)).toBe(true)
  })

  it('rejects a tampered token', () => {
    const token = createSessionToken()
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')
    expect(verifySessionToken(tampered)).toBe(false)
  })

  it('rejects an expired token', () => {
    const now = Date.now()
    const token = createSessionToken(now)
    const nineHoursLater = now + 1000 * 60 * 60 * 9
    expect(verifySessionToken(token, nineHoursLater)).toBe(false)
  })

  it('rejects a missing token', () => {
    expect(verifySessionToken(undefined)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/session.test.ts`
Expected: FAIL — `lib/session.ts` does not exist yet.

- [ ] **Step 3: Write `lib/session.ts`**

```ts
import { createHmac, timingSafeEqual } from 'crypto'

export const SESSION_COOKIE_NAME = 'natch_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD is not set')
  return secret
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function checkPassword(candidate: string): boolean {
  const expected = getSecret()
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function createSessionToken(now: number = Date.now()): string {
  const expiry = String(now + SESSION_TTL_MS)
  return `${expiry}.${sign(expiry)}`
}

export function verifySessionToken(token: string | undefined, now: number = Date.now()): boolean {
  if (!token) return false
  const [expiry, signature] = token.split('.')
  if (!expiry || !signature) return false
  if (sign(expiry) !== signature) return false
  return Number(expiry) > now
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/session.test.ts`
Expected: PASS, all 6 assertions.

- [ ] **Step 5: Commit**

```bash
git add lib/session.ts lib/session.test.ts
git commit -m "Add HMAC-based admin session token logic"
```

---

### Task 7: Form validation logic (pure, tested)

**Files:**
- Create: `actions/validation.ts`
- Test: `actions/validation.test.ts`

**Interfaces:**
- Produces: `interface BespokeInput { name: string; email: string; description: string; inspirationImageUrl?: string }`, `validateBespokeInput(input: BespokeInput): string[]`, `interface SourcingInput { name: string; email: string; buyerType: string; companyName?: string; interest: string; details: string }`, `validateSourcingInput(input: SourcingInput): string[]` (empty array = valid). Consumed by `actions/bespoke.ts` and `actions/sourcing.ts` in Tasks 11–12.

- [ ] **Step 1: Write the failing test**

```ts
// actions/validation.test.ts
import { describe, expect, it } from 'vitest'
import { validateBespokeInput, validateSourcingInput } from './validation'

describe('validateBespokeInput', () => {
  const valid = { name: 'Jane Doe', email: 'jane@example.com', description: 'A custom ring.' }

  it('accepts valid input', () => {
    expect(validateBespokeInput(valid)).toEqual([])
  })

  it('rejects a missing name', () => {
    expect(validateBespokeInput({ ...valid, name: '  ' })).toContain('Name is required.')
  })

  it('rejects a malformed email', () => {
    expect(validateBespokeInput({ ...valid, email: 'not-an-email' })).toContain(
      'A valid email is required.'
    )
  })

  it('rejects a missing description', () => {
    expect(validateBespokeInput({ ...valid, description: '' })).toContain(
      'Please describe the piece you have in mind.'
    )
  })
})

describe('validateSourcingInput', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    buyerType: 'private',
    interest: 'natural',
    details: 'Looking for a 2-carat round brilliant.',
  }

  it('accepts valid private-client input', () => {
    expect(validateSourcingInput(valid)).toEqual([])
  })

  it('requires a company name for trade buyers', () => {
    const errors = validateSourcingInput({ ...valid, buyerType: 'trade', companyName: undefined })
    expect(errors).toContain('Company name is required for trade buyers.')
  })

  it('accepts trade buyers that provide a company name', () => {
    const errors = validateSourcingInput({
      ...valid,
      buyerType: 'trade',
      companyName: 'Acme Jewels',
    })
    expect(errors).toEqual([])
  })

  it('rejects an invalid interest value', () => {
    expect(validateSourcingInput({ ...valid, interest: 'synthetic' })).toContain(
      'Select a diamond interest.'
    )
  })

  it('rejects an invalid buyer type', () => {
    expect(validateSourcingInput({ ...valid, buyerType: 'wholesale' })).toContain(
      'Select a buyer type.'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run actions/validation.test.ts`
Expected: FAIL — `actions/validation.ts` does not exist yet.

- [ ] **Step 3: Write `actions/validation.ts`**

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface BespokeInput {
  name: string
  email: string
  description: string
  inspirationImageUrl?: string
}

export function validateBespokeInput(input: BespokeInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Name is required.')
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.push('A valid email is required.')
  if (!input.description.trim()) errors.push('Please describe the piece you have in mind.')
  return errors
}

export interface SourcingInput {
  name: string
  email: string
  buyerType: string
  companyName?: string
  interest: string
  details: string
}

export function validateSourcingInput(input: SourcingInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Name is required.')
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.push('A valid email is required.')
  if (!['private', 'trade'].includes(input.buyerType)) errors.push('Select a buyer type.')
  if (input.buyerType === 'trade' && !input.companyName?.trim()) {
    errors.push('Company name is required for trade buyers.')
  }
  if (!['natural', 'lab-grown', 'both'].includes(input.interest)) {
    errors.push('Select a diamond interest.')
  }
  if (!input.details.trim()) errors.push('Please add a few details about what you are sourcing.')
  return errors
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run actions/validation.test.ts`
Expected: PASS, all 9 assertions.

- [ ] **Step 5: Commit**

```bash
git add actions/validation.ts actions/validation.test.ts
git commit -m "Add pure validation logic for Bespoke and Sourcing forms"
```

---

### Task 8: Hero section

**Files:**
- Create: `components/Hero.tsx`
- Modify: `app/page.tsx` (render `<Hero />` as the first element in `<main>`, replacing the Task 1 placeholder heading)

**Interfaces:**
- Consumes: `EASE` from `@/lib/motion` (Task 4).
- Produces: `Hero` component, default export not required (named export `Hero`). No props.

- [ ] **Step 1: Write `components/Hero.tsx`**

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'

export function Hero() {
  const reduced = useReducedMotion()

  return (
    <section className="relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden bg-charcoal text-white">
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 1.05 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: reduced ? 0.4 : 1.5, ease: EASE }}
        className="absolute inset-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1638734205377-f21045bf6ebe?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.4 : 1, ease: EASE }}
          className="font-display text-5xl tracking-[0.3em] sm:text-7xl"
        >
          NATCH DIAMONDS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.4 : 0.8, delay: reduced ? 0 : 0.3, ease: EASE }}
          className="mt-4 text-sm uppercase tracking-[0.2em] text-white/70"
        >
          Natural &amp; Lab-Grown, Cut for the Occasion
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: reduced ? 0.6 : 0.3 }}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.3, 1, 0.3] }}
        transition={
          reduced
            ? { duration: 0.4, ease: EASE }
            : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="absolute bottom-10 h-16 w-px bg-gold"
        aria-hidden
      />
    </section>
  )
}
```

- [ ] **Step 2: Wire `Hero` into `app/page.tsx`**

```tsx
import { Hero } from '@/components/Hero'

export default function HomePage() {
  return (
    <main>
      <Hero />
    </main>
  )
}
```

- [ ] **Step 3: Verify in the browser**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` and wait for `Ready in`.

Use the Playwright MCP browser tools to:
1. Navigate to `http://localhost:3000`.
2. Take a snapshot and confirm the heading "NATCH DIAMONDS" and the subheadline "Natural & Lab-Grown, Cut for the Occasion" are present.
3. Take a screenshot and visually confirm: full-viewport dark hero, image visible behind the text, thin vertical gold line near the bottom.
4. Resize the browser to 375×812 and confirm the layout doesn't overflow horizontally (no horizontal scrollbar).

Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "Add animated Hero section"
```

---

### Task 9: Collection grid + product card (live database data)

**Files:**
- Create: `components/ProductCard.tsx`
- Create: `components/CollectionGrid.tsx`
- Modify: `app/page.tsx` (fetch products via Prisma, render `<CollectionGrid products={products} />` after `<Hero />`)

**Interfaces:**
- Consumes: `Product` type from `@prisma/client` (Task 2), `EASE`, `STAGGER_CHILDREN` from `@/lib/motion` (Task 4), seeded data from Task 3.
- Produces: `ProductCard({ product, index }: { product: Product; index: number })`, `CollectionGrid({ products }: { products: Product[] })`.

- [ ] **Step 1: Write `components/ProductCard.tsx`**

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE, STAGGER_CHILDREN } from '@/lib/motion'
import type { Product } from '@prisma/client'

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const reduced = useReducedMotion()

  return (
    <motion.article
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: reduced ? 0.4 : 0.7,
        delay: reduced ? 0 : index * STAGGER_CHILDREN,
        ease: EASE,
      }}
      className="group"
    >
      <div className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-gold">{product.collection}</p>
        <h3 className="relative mt-1 inline-block font-display text-xl text-ink">
          {product.name}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-500 ease-out group-hover:w-full" />
        </h3>
        <p className="mt-1 text-sm text-ink/70">${product.price.toLocaleString('en-US')}</p>
      </div>
    </motion.article>
  )
}
```

- [ ] **Step 2: Write `components/CollectionGrid.tsx`**

```tsx
import { ProductCard } from './ProductCard'
import type { Product } from '@prisma/client'

const COLLECTIONS = ['The Studs', 'The Hoops', 'The Tennis'] as const

export function CollectionGrid({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="font-display text-3xl text-ink sm:text-4xl">
        The Studs · The Hoops · The Tennis
      </h2>
      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.flatMap((collection) =>
          products
            .filter((product) => product.collection === collection)
            .map((product, i) => <ProductCard key={product.id} product={product} index={i} />)
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Wire into `app/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma'
import { Hero } from '@/components/Hero'
import { CollectionGrid } from '@/components/CollectionGrid'

export default async function HomePage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <main>
      <Hero />
      <CollectionGrid products={products} />
    </main>
  )
}
```

- [ ] **Step 4: Verify in the browser**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` and wait for `Ready in`.

Use the Playwright MCP browser tools to:
1. Navigate to `http://localhost:3000`.
2. Take a snapshot and confirm exactly 6 product cards render with names: Solitaire Studs, Bezel Studs, Classic Hoops, Pavé Hoops, Classic Tennis Bracelet, Tennis Necklace — 2 under each collection label.
3. Hover over a product card image and confirm (via screenshot or computed style check) the image scales up and the gold underline appears beneath the product name.
4. Resize to 375×812 and confirm cards stack in a single column with no horizontal overflow.

Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 5: Commit**

```bash
git add components/ProductCard.tsx components/CollectionGrid.tsx app/page.tsx
git commit -m "Add database-backed collection grid with hover animations"
```

---

### Task 10: Scroll story component ("Three Houses, One Vision")

**Files:**
- Create: `components/ScrollStory.tsx`
- Modify: `app/page.tsx` (render `<ScrollStory />` after `<CollectionGrid />`)

**Interfaces:**
- Consumes: `STORY_PANELS`, `getStoryIndex` from `@/lib/scroll-story` (Task 5), `EASE` from `@/lib/motion` (Task 4).
- Produces: `ScrollStory` component, no props.

- [ ] **Step 1: Write `components/ScrollStory.tsx`**

```tsx
'use client'

import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { EASE } from '@/lib/motion'
import { STORY_PANELS, getStoryIndex } from '@/lib/scroll-story'

export function ScrollStory() {
  const reduced = !!useReducedMotion()

  return (
    <section className="bg-charcoal text-white">
      <h2 className="sr-only">Three Houses, One Vision</h2>
      <DesktopScrollStory reduced={reduced} />
      <MobileScrollStory reduced={reduced} />
    </section>
  )
}

function DesktopScrollStory({ reduced }: { reduced: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const [index, setIndex] = useState<0 | 1 | 2>(0)

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = getStoryIndex(value)
    setIndex((current) => (current === next ? current : next))
  })

  const panel = STORY_PANELS[index]

  return (
    <div ref={containerRef} className="relative hidden h-[300vh] md:block">
      <div className="sticky top-0 flex h-screen items-center gap-16 px-16">
        <div className="w-1/2">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Three Houses, One Vision</p>
        </div>
        <div className="w-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={panel.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.4 : 0.6, ease: EASE }}
            >
              <h3 className="font-display text-4xl">{panel.title}</h3>
              <p className="mt-4 max-w-md text-white/70">{panel.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function MobileScrollStory({ reduced }: { reduced: boolean }) {
  return (
    <div className="space-y-16 px-6 py-24 md:hidden">
      {STORY_PANELS.map((panel) => (
        <motion.div
          key={panel.key}
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0.4 : 0.7, ease: EASE }}
        >
          <h3 className="font-display text-3xl">{panel.title}</h3>
          <p className="mt-4 text-white/70">{panel.body}</p>
        </motion.div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Wire into `app/page.tsx`**

Add `import { ScrollStory } from '@/components/ScrollStory'` and render `<ScrollStory />` immediately after `<CollectionGrid products={products} />`.

- [ ] **Step 3: Verify in the browser**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` and wait for `Ready in`.

Use the Playwright MCP browser tools to:
1. Navigate to `http://localhost:3000`, resize to a desktop size (e.g. 1440×900).
2. Scroll to the top of the story section and confirm "The Collection" is visible.
3. Continue scrolling through the section and confirm the panel text changes to "Bespoke" and then "Sourcing" as you scroll, and that the pinned left label ("Three Houses, One Vision") stays fixed on screen while this happens (no jump cut — the right-hand text crossfades).
4. Resize to 375×812, navigate to the page again, and scroll through the same section: confirm it now renders as three stacked panels (no sticky pin) and there is no horizontal overflow or layout jank.

Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 4: Commit**

```bash
git add components/ScrollStory.tsx app/page.tsx
git commit -m "Add scroll-driven Three Houses story section with mobile fallback"
```

---

### Task 11: Bespoke inquiry form (Server Action + Cloudinary upload)

**Files:**
- Create: `actions/bespoke.ts`
- Create: `components/BespokeForm.tsx`
- Modify: `app/page.tsx` (render the Bespoke section after `<ScrollStory />`)

**Interfaces:**
- Consumes: `validateBespokeInput`, `BespokeInput` from `@/actions/validation` (Task 7), `prisma` from `@/lib/prisma` (Task 2), `EASE` from `@/lib/motion` (Task 4).
- Produces: `submitBespokeInquiry(input: BespokeInput): Promise<{ success: boolean; errors?: string[] }>` (server action), `BespokeForm` component.

- [ ] **Step 1: Write `actions/bespoke.ts`**

```ts
'use server'

import { prisma } from '@/lib/prisma'
import { validateBespokeInput, type BespokeInput } from './validation'

export interface BespokeActionResult {
  success: boolean
  errors?: string[]
}

export async function submitBespokeInquiry(input: BespokeInput): Promise<BespokeActionResult> {
  const errors = validateBespokeInput(input)
  if (errors.length > 0) return { success: false, errors }

  await prisma.bespokeInquiry.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim(),
      description: input.description.trim(),
      inspirationImageUrl: input.inspirationImageUrl || null,
    },
  })

  return { success: true }
}
```

- [ ] **Step 2: Write `components/BespokeForm.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CldUploadWidget } from 'next-cloudinary'
import { submitBespokeInquiry } from '@/actions/bespoke'
import { EASE } from '@/lib/motion'

export function BespokeForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const reduced = useReducedMotion()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await submitBespokeInquiry({
        name,
        email,
        description,
        inspirationImageUrl: imageUrl ?? undefined,
      })
      if (!result.success) {
        setErrors(result.errors ?? [])
        return
      }
      setErrors([])
      setSuccess(true)
    })
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.4 : 0.6, ease: EASE }}
        className="rounded border border-gold/40 bg-ivory px-8 py-12 text-center"
      >
        <h3 className="font-display text-2xl text-ink">Thank you, {name.split(' ')[0] || 'there'}.</h3>
        <p className="mt-2 text-ink/70">
          We&apos;ve received your bespoke inquiry and will be in touch shortly.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="bespoke-form">
      <div>
        <label htmlFor="bespoke-name" className="block text-sm text-ink/70">
          Name
        </label>
        <input
          id="bespoke-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="bespoke-email" className="block text-sm text-ink/70">
          Email
        </label>
        <input
          id="bespoke-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="bespoke-description" className="block text-sm text-ink/70">
          Describe the piece you have in mind
        </label>
        <textarea
          id="bespoke-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <span className="block text-sm text-ink/70">Inspiration photo (optional)</span>
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result) => {
            const info = result?.info
            if (info && typeof info === 'object' && 'secure_url' in info) {
              setImageUrl(String((info as { secure_url: string }).secure_url))
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="mt-2 border border-ink/20 px-4 py-2 text-sm hover:border-gold"
            >
              {imageUrl ? 'Replace photo' : 'Upload photo'}
            </button>
          )}
        </CldUploadWidget>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Inspiration preview" className="mt-4 h-32 w-32 object-cover" />
        )}
      </div>
      {errors.length > 0 && (
        <ul className="text-sm text-red-700">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-charcoal px-8 py-3 text-sm uppercase tracking-widest text-white hover:bg-gold disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit Inquiry'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Wire into `app/page.tsx`**

```tsx
import { BespokeForm } from '@/components/BespokeForm'
```

Add after `<ScrollStory />`:

```tsx
<section className="mx-auto max-w-2xl px-6 py-24">
  <h2 className="font-display text-3xl text-ink sm:text-4xl">Bespoke</h2>
  <p className="mt-4 text-ink/70">
    Tell us what you have in mind, and share a photo if you have one.
  </p>
  <div className="mt-12">
    <BespokeForm />
  </div>
</section>
```

- [ ] **Step 4: Verify end-to-end against the local database**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` and wait for `Ready in`.

Use the Playwright MCP browser tools to:
1. Navigate to `http://localhost:3000` and scroll to the Bespoke section.
2. Fill in Name = "Playwright Test User", Email = "playwright-test@example.com", Description = "A custom eternity band, platinum, 1.5 carats total.". Skip the photo upload (Cloudinary isn't configured yet — the button will open a widget that can't finish an upload without real credentials; that's expected at this stage).
3. Click "Submit Inquiry" and confirm the success message ("Thank you, Playwright.") fades/scales in with no page navigation (URL stays on `/`).

Then verify the row landed in Postgres:
Run: `psql natch_diamonds_dev -c "SELECT name, email, description FROM \"BespokeInquiry\" WHERE email = 'playwright-test@example.com';"`
Expected: one row matching the submitted data.

Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 5: Commit**

```bash
git add actions/bespoke.ts components/BespokeForm.tsx app/page.tsx
git commit -m "Add Bespoke inquiry form with Cloudinary upload and Server Action"
```

---

### Task 12: Sourcing inquiry form + Footer + full page assembly

**Files:**
- Create: `actions/sourcing.ts`
- Create: `components/SourcingForm.tsx`
- Create: `components/Footer.tsx`
- Modify: `app/page.tsx` (final section order: Hero, CollectionGrid, ScrollStory, Bespoke, Sourcing, Footer)

**Interfaces:**
- Consumes: `validateSourcingInput`, `SourcingInput` from `@/actions/validation` (Task 7), `prisma` from `@/lib/prisma` (Task 2), `EASE` from `@/lib/motion` (Task 4).
- Produces: `submitSourcingInquiry(input: SourcingInput): Promise<{ success: boolean; errors?: string[] }>`, `SourcingForm`, `Footer`.

- [ ] **Step 1: Write `actions/sourcing.ts`**

```ts
'use server'

import { prisma } from '@/lib/prisma'
import { validateSourcingInput, type SourcingInput } from './validation'

export interface SourcingActionResult {
  success: boolean
  errors?: string[]
}

export async function submitSourcingInquiry(input: SourcingInput): Promise<SourcingActionResult> {
  const errors = validateSourcingInput(input)
  if (errors.length > 0) return { success: false, errors }

  await prisma.sourcingInquiry.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim(),
      buyerType: input.buyerType,
      companyName: input.buyerType === 'trade' ? input.companyName?.trim() || null : null,
      interest: input.interest,
      details: input.details.trim(),
    },
  })

  return { success: true }
}
```

- [ ] **Step 2: Write `components/SourcingForm.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'
import { submitSourcingInquiry } from '@/actions/sourcing'

type BuyerType = 'private' | 'trade'
type Interest = 'natural' | 'lab-grown' | 'both'

export function SourcingForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [buyerType, setBuyerType] = useState<BuyerType>('private')
  const [companyName, setCompanyName] = useState('')
  const [interest, setInterest] = useState<Interest>('natural')
  const [details, setDetails] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const reduced = useReducedMotion()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await submitSourcingInquiry({
        name,
        email,
        buyerType,
        companyName: buyerType === 'trade' ? companyName : undefined,
        interest,
        details,
      })
      if (!result.success) {
        setErrors(result.errors ?? [])
        return
      }
      setErrors([])
      setSuccess(true)
    })
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.4 : 0.6, ease: EASE }}
        className="rounded border border-gold/40 bg-charcoal px-8 py-12 text-center text-white"
      >
        <h3 className="font-display text-2xl">Thank you, {name.split(' ')[0] || 'there'}.</h3>
        <p className="mt-2 text-white/70">Our sourcing team will follow up shortly.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="sourcing-form">
      <div role="radiogroup" aria-label="Buyer type" className="flex gap-4">
        {(['private', 'trade'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setBuyerType(type)}
            aria-pressed={buyerType === type}
            className={`border px-4 py-2 text-sm uppercase tracking-wide ${
              buyerType === type ? 'border-gold text-gold' : 'border-white/30 text-white/70'
            }`}
          >
            {type === 'private' ? 'Private Client' : 'Trade / Professional'}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="sourcing-name" className="block text-sm text-white/70">
          Name
        </label>
        <input
          id="sourcing-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
          required
        />
      </div>

      <div>
        <label htmlFor="sourcing-email" className="block text-sm text-white/70">
          Email
        </label>
        <input
          id="sourcing-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
          required
        />
      </div>

      <AnimatePresence>
        {buyerType === 'trade' && (
          <motion.div
            key="company-name"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0.4 : 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <label htmlFor="sourcing-company" className="block text-sm text-white/70">
              Company name
            </label>
            <input
              id="sourcing-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
              required
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="sourcing-interest" className="block text-sm text-white/70">
          Diamond interest
        </label>
        <select
          id="sourcing-interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value as Interest)}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
        >
          <option value="natural" className="text-ink">
            Natural
          </option>
          <option value="lab-grown" className="text-ink">
            Lab-grown
          </option>
          <option value="both" className="text-ink">
            Both
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="sourcing-details" className="block text-sm text-white/70">
          Details
        </label>
        <textarea
          id="sourcing-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
          required
        />
      </div>

      {errors.length > 0 && (
        <ul className="text-sm text-red-400">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-gold px-8 py-3 text-sm uppercase tracking-widest text-charcoal hover:bg-white disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit Inquiry'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Write `components/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="bg-charcoal px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="h-px w-full bg-gold/40" />
        <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs uppercase tracking-widest text-white/50">
          <p>Natch Diamonds</p>
          <p>&copy; {new Date().getFullYear()} Natch Diamonds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Assemble the final `app/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma'
import { Hero } from '@/components/Hero'
import { CollectionGrid } from '@/components/CollectionGrid'
import { ScrollStory } from '@/components/ScrollStory'
import { BespokeForm } from '@/components/BespokeForm'
import { SourcingForm } from '@/components/SourcingForm'
import { Footer } from '@/components/Footer'

export default async function HomePage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <main>
      <Hero />
      <CollectionGrid products={products} />
      <ScrollStory />
      <section className="mx-auto max-w-2xl px-6 py-24">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">Bespoke</h2>
        <p className="mt-4 text-ink/70">
          Tell us what you have in mind, and share a photo if you have one.
        </p>
        <div className="mt-12">
          <BespokeForm />
        </div>
      </section>
      <section className="bg-charcoal px-6 py-24 text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl">Diamond Sourcing</h2>
          <p className="mt-4 text-white/70">
            For private clients and trade buyers sourcing natural or lab-grown stones.
          </p>
          <div className="mt-12">
            <SourcingForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 5: Verify end-to-end against the local database**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` and wait for `Ready in`.

Use the Playwright MCP browser tools to:
1. Navigate to `http://localhost:3000` and scroll to the Diamond Sourcing section.
2. Confirm "Private Client" is selected by default and no company-name field is visible.
3. Click "Trade / Professional" and confirm the company-name field animates in (height/opacity transition, not an instant pop).
4. Click "Private Client" again and confirm the field animates back out.
5. Click "Trade / Professional", fill Name = "Trade Buyer", Email = "trade-test@example.com", Company = "Test Wholesale Co", leave interest at "Natural", Details = "Sourcing 50 carats of melee, GIA certified.". Submit and confirm the success message appears with no page reload.
6. Scroll through the whole page once more end-to-end (Hero → Grid → Story → Bespoke → Sourcing → Footer) and confirm the Footer renders with the gold hairline divider and copyright text.
7. Resize to 375×812 and re-check the full page scroll for horizontal overflow.

Then verify the row landed in Postgres:
Run: `psql natch_diamonds_dev -c "SELECT name, email, \"buyerType\", \"companyName\", interest FROM \"SourcingInquiry\" WHERE email = 'trade-test@example.com';"`
Expected: one row with `buyerType = trade`, `companyName = Test Wholesale Co`.

Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 6: Commit**

```bash
git add actions/sourcing.ts components/SourcingForm.tsx components/Footer.tsx app/page.tsx
git commit -m "Add Sourcing inquiry form, Footer, and final page assembly"
```

---

### Task 13: Admin auth + admin view

**Files:**
- Create: `actions/admin-auth.ts`
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `checkPassword`, `createSessionToken`, `verifySessionToken`, `SESSION_COOKIE_NAME` from `@/lib/session` (Task 6), `prisma` from `@/lib/prisma` (Task 2).
- Produces: `login(formData: FormData)` server action; `/admin/login` and `/admin` routes; `middleware.ts` guarding `/admin/:path*`.

- [ ] **Step 1: Write `actions/admin-auth.ts`**

```ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { checkPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/session'

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '')

  if (!checkPassword(password)) {
    redirect('/admin/login?error=1')
  }

  cookies().set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  redirect('/admin')
}
```

- [ ] **Step 2: Write `middleware.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (verifySessionToken(token)) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 3: Write `app/admin/login/page.tsx`**

```tsx
import { login } from '@/actions/admin-auth'

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-2xl">Admin Login</h1>
      <form action={login} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm text-ink/70">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          />
        </div>
        {searchParams.error && <p className="text-sm text-red-700">Incorrect password.</p>}
        <button
          type="submit"
          className="bg-charcoal px-6 py-2 text-sm uppercase tracking-widest text-white"
        >
          Sign In
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 4: Write `app/admin/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma'

export default async function AdminPage() {
  const [bespokeInquiries, sourcingInquiries] = await Promise.all([
    prisma.bespokeInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.sourcingInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl">Admin</h1>

      <h2 className="mt-10 text-xl font-semibold">Bespoke Inquiries</h2>
      <table className="mt-4 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4">Photo</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {bespokeInquiries.map((inquiry) => (
            <tr key={inquiry.id} className="border-b">
              <td className="py-2 pr-4">
                {inquiry.inspirationImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={inquiry.inspirationImageUrl}
                    alt=""
                    className="h-12 w-12 object-cover"
                  />
                ) : (
                  '—'
                )}
              </td>
              <td className="py-2 pr-4">{inquiry.name}</td>
              <td className="py-2 pr-4">{inquiry.email}</td>
              <td className="py-2 pr-4">{inquiry.description}</td>
              <td className="py-2 pr-4">{inquiry.createdAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-12 text-xl font-semibold">Sourcing Inquiries</h2>
      <table className="mt-4 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Buyer Type</th>
            <th className="py-2 pr-4">Company</th>
            <th className="py-2 pr-4">Interest</th>
            <th className="py-2 pr-4">Details</th>
            <th className="py-2 pr-4">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {sourcingInquiries.map((inquiry) => (
            <tr key={inquiry.id} className="border-b">
              <td className="py-2 pr-4">{inquiry.name}</td>
              <td className="py-2 pr-4">{inquiry.email}</td>
              <td className="py-2 pr-4">{inquiry.buyerType}</td>
              <td className="py-2 pr-4">{inquiry.companyName ?? '—'}</td>
              <td className="py-2 pr-4">{inquiry.interest}</td>
              <td className="py-2 pr-4">{inquiry.details}</td>
              <td className="py-2 pr-4">{inquiry.createdAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
```

- [ ] **Step 5: Verify the auth gate and data loop end-to-end**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` and wait for `Ready in`.

Use the Playwright MCP browser tools to:
1. Navigate directly to `http://localhost:3000/admin` and confirm it redirects to `/admin/login` (unauthenticated access is blocked).
2. On `/admin/login`, submit an incorrect password (anything other than the value of `ADMIN_PASSWORD` in `.env`, i.e. not `natch-admin-dev`) and confirm it redirects back to `/admin/login?error=1` with "Incorrect password." shown.
3. Submit the correct password (`natch-admin-dev`) and confirm it redirects to `/admin`.
4. On `/admin`, confirm the Bespoke row from Task 11 (`playwright-test@example.com`) and the Sourcing row from Task 12 (`trade-test@example.com`, buyer type `trade`, company `Test Wholesale Co`) both appear, newest submissions first.

Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 6: Commit**

```bash
git add actions/admin-auth.ts middleware.ts app/admin
git commit -m "Add password-gated admin view listing Bespoke and Sourcing inquiries"
```

---

### Task 14: README, env example finalization, full smoke test

**Files:**
- Create: `README.md`
- Modify: `.env.example` (verify all four vars documented — already written in Task 2, confirm no drift)

**Interfaces:**
- Consumes: nothing new — this task documents and smoke-tests the whole app built in Tasks 1–13.

- [ ] **Step 1: Write `README.md`**

```md
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
```

- [ ] **Step 2: Run the full automated test suite**

Run: `npm test`
Expected: all test files pass (`lib/motion.test.ts`, `lib/scroll-story.test.ts`, `lib/session.test.ts`, `actions/validation.test.ts`).

- [ ] **Step 3: Run lint and production build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build completes successfully.

- [ ] **Step 4: Full Playwright smoke test, desktop and mobile**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev &` and wait for `Ready in`.

Use the Playwright MCP browser tools to:
1. Navigate to `http://localhost:3000` at 1440×900, check `browser_console_messages` and confirm there are no errors logged.
2. Scroll the full page top to bottom once, confirming every section from Task 8–12's verification steps still renders correctly together (Hero, 6 products, story panels crossfading, Bespoke form, Sourcing form, Footer).
3. Resize to 375×812, reload, and scroll the full page top to bottom again, confirming no horizontal scrollbar appears at any point and the mobile ScrollStory fallback (stacked panels) is what renders, not the desktop sticky version.
4. Navigate to `/admin`, confirm redirect to `/admin/login`, log in with `natch-admin-dev`, and confirm both inquiry tables still show the rows created during Tasks 11–12's verification.

Stop the dev server: `lsof -ti:3000 | xargs kill -9`.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Add README with setup, account creation, and deployment instructions"
```

---

## Post-plan follow-up (not part of this plan's execution)

Once all 14 tasks are complete and reviewed:
1. Create the real Neon project and Cloudinary account together with the user (requires their login).
2. Swap `.env`'s `DATABASE_URL` to the Neon connection string, re-run `npx prisma migrate deploy` and `npm run seed` against it.
3. Swap the Cloudinary env vars to the real cloud name/unsigned preset and confirm a real upload works end-to-end.
4. Replace the six Unsplash placeholder `imageUrl`s with real Natch Diamonds product photos once available.
5. Only then, with explicit user go-ahead, run `vercel` / `vercel --prod` to get a live URL.
