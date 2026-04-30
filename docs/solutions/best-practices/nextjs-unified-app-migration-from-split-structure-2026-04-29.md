---
title: "Migrating a split-structure repo to a unified Next.js app with path-prefix routing"
date: 2026-04-29
category: best-practices
module: frontend
problem_type: best_practice
component: development_workflow
severity: medium
applies_when:
  - Merging a static marketing site with a Next.js dashboard into one repo
  - Moving authenticated routes behind a path prefix on a standalone Vercel domain
  - Converting static HTML/CSS/JS pages with global styles into Next.js components
  - Removing basePath after discovering it causes Vercel 404s on standalone domains
  - Removing Clerk middleware due to Edge Runtime constraints
tags:
  - nextjs
  - vercel
  - migration
  - css-scoping
  - filesystem-routing
  - basepath
  - tailwind
  - clerk
---

# Migrating a Split-Structure Repo to a Unified Next.js App

## Context

The Alpha School repo had a static HTML/CSS/JS marketing site deployed via GitHub Pages and a Next.js 16 enrollment app in a `crm/` subdirectory deployed to Vercel. This created deployment friction, duplicated assets, and routing confusion. Prior attempts to use `basePath: '/crm'` caused persistent Vercel 404 errors because incoming URLs on a standalone domain never include the basePath prefix.

The migration consolidated everything into a single Next.js app at the repo root: marketing pages at `/` and `/v1`, authenticated dashboard under `/hub/...`, public intake forms at `/[geography]`, and the API webhook at `/api/webhooks/clerk`.

## Guidance

### 1. Use filesystem routing for path prefixes — never basePath on standalone domains

Place authenticated routes in a subdirectory like `src/app/hub/` rather than using `basePath` in `next.config.ts`.

```
src/app/
  page.tsx              # Public landing at /
  not-found.tsx         # Custom 404
  layout.tsx            # Generic shell (fonts + Tailwind only)
  v1/
    page.tsx            # Public stories at /v1
  hub/
    page.tsx            # Role-based router → redirects by session claims
    (auth)/
      sign-in/          # /hub/sign-in
    (dashboard)/
      layout.tsx        # Hub-specific nav, auth guard, metadata
      (admin)/
        leaderboard/    # /hub/leaderboard
      (champion)/
        prospects/      # /hub/prospects
  (public)/
    [geography]/        # Public intake forms (stays at root)
    privacy/            # /privacy
  api/
    webhooks/clerk/     # API webhook (stays at root)
```

Create a role-based entry point at the prefix root:

```typescript
// src/app/hub/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HubPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/hub/sign-in");

  const role = sessionClaims?.role as string | undefined;
  if (role === "admin") redirect("/hub/leaderboard");
  if (role === "champion") redirect("/hub/dashboard");
  redirect("/hub/sign-in");
}
```

### 2. Add redirects from old paths to new prefix

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/hub/dashboard", permanent: true },
      { source: "/sign-in", destination: "/hub/sign-in", permanent: true },
      { source: "/prospects/:path*", destination: "/hub/prospects/:path*", permanent: true },
      { source: "/leaderboard", destination: "/hub/leaderboard", permanent: true },
      { source: "/champions", destination: "/hub/champions", permanent: true },
      { source: "/geography/:path*", destination: "/hub/geography/:path*", permanent: true },
    ];
  },
};
```

### 3. Scope CSS when converting static pages — never import global element selectors

Static CSS files often have bare element selectors (`html`, `body`, `h1`, `a`, `*`) that bleed into every page in a Next.js app.

**Strategy A — Tailwind conversion** (simpler pages): Convert to Tailwind utility classes. Works when the design tokens already align with the Tailwind theme.

```tsx
// Instead of importing colors-and-type.css with: body { font-family: Georgia; }
// Use Tailwind classes mapped to existing theme tokens:
<h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight">
```

**Strategy B — Scoped CSS file** (complex pages with many styles): Strip global element selectors, keep only class selectors, and add CSS variable aliases.

```css
/* v1.css — scoped: class selectors only, no element selectors */
:root {
  --alpha-blue: var(--color-alpha-blue);  /* alias short name → Tailwind theme var */
  --r-xl: var(--radius-xl);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}

/* Rename selectors that would clash: .nav → .v1-nav, .footer → .v1-footer */
.v1-nav { position: sticky; top: 0; z-index: 50; /* ... */ }
.story-card { /* class-only: safe to import globally */ }
```

### 4. Keep root layout generic — push specifics into route group layouts

```tsx
// src/app/layout.tsx — ONLY universal concerns
export const metadata = { title: "Alpha School" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}

// src/app/hub/(dashboard)/layout.tsx — domain-specific
export const metadata = { title: "Alpha Hub" };

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/hub/sign-in");
  return (
    <div className="min-h-screen flex flex-col">
      <header>/* Hub nav, UserButton */</header>
      <main>{children}</main>
    </div>
  );
}
```

### 5. Use server-side auth guards instead of middleware

When Clerk middleware causes Edge Runtime incompatibilities on Vercel:

```typescript
// src/lib/auth.ts — per-page guards
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) redirect("/hub/sign-in");
  return userId;
}

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/hub/sign-in");
  if (sessionClaims?.role !== "admin") redirect("/hub/dashboard");
  return userId;
}
```

### 6. Follow this migration order for incremental safety

Each step produces a deployable, testable state:

1. **Move routes** into new directory structure (`src/app/hub/`)
2. **Update internal paths** — all hardcoded route references get the new prefix
3. **Refactor root layout** — generic shell; push domain specifics to route group layouts
4. **Convert static pages** — landing page, stories page, using CSS scoping strategies
5. **Add redirects** — backward-compatible redirects + custom 404 + reserved slug validation
6. **Rename references** — package name, email templates, README
7. **Clean up** — remove old directories, workflows, duplicate files; verify build

## Why This Matters

- **basePath is a deployment trap on Vercel**: On a standalone domain, `basePath` causes universal 404s because incoming URLs never include the prefix. Five consecutive fix commits were needed to isolate this. Filesystem routing eliminates the issue entirely.

- **Global CSS bleeds silently**: A static site's `body { font-family: Georgia }` overrides every page once imported. These bugs only surface when navigating between sections, making them hard to catch in isolation.

- **Middleware-free auth is more portable**: Clerk middleware depends on Edge Runtime APIs unavailable in some deployment targets. Server-side guards work universally and make auth boundaries explicit.

- **Incremental ordering reduces blast radius**: Each step is independently testable. If page conversion reveals a CSS issue, route restructuring is already stable.

## When to Apply

- Merging a static marketing site with a Next.js dashboard into a single deployable unit
- Moving authenticated routes behind a path prefix on a standalone Vercel domain
- Converting static HTML/CSS/JS pages with global styles into Next.js components that coexist with other pages
- Replacing `basePath` with filesystem routing after encountering Vercel 404s
- Removing GitHub Pages in favor of a unified Vercel deployment

## Examples

### Before/After: Repository structure

```
BEFORE:
  /                     ← static site (GitHub Pages)
  /v1/                  ← CDN React stories (GitHub Pages)
  crm/                  ← Next.js app (Vercel, basePath: '/crm')
    src/app/
      (dashboard)/
      (auth)/
    next.config.ts      ← basePath: '/crm'

AFTER:
  src/app/
    page.tsx            ← landing page (Next.js, Tailwind)
    v1/page.tsx         ← stories page (Next.js, scoped CSS)
    hub/                ← enrollment dashboard
      (dashboard)/
      (auth)/
    (public)/           ← intake forms, privacy
    api/                ← webhooks
  next.config.ts        ← redirects only, no basePath
```

### Before/After: Build output

```
BEFORE: 2 deployments, 2 workflows
  GitHub Pages: static site at /
  Vercel: Next.js at /crm (broken by basePath)

AFTER: 1 deployment
  Vercel: unified Next.js app
    ○ /              (static)
    ○ /v1            (static)
    ○ /privacy       (static)
    ƒ /hub/...       (dynamic, auth-gated)
    ƒ /[geography]   (dynamic, public intake)
    ƒ /api/...       (dynamic, webhooks)
```

## Related

- [Clerk v7 Vercel Edge Middleware and basePath](../integration-issues/clerk-v7-vercel-edge-middleware-and-basepath-2026-04-29.md) — detailed incident report on the basePath/middleware failures that motivated filesystem routing
- [Migration plan](../../plans/2026-04-29-002-refactor-root-migration-hub-rename-plan.md) — the implementation plan for this migration
- [Requirements doc](../../brainstorms/2026-04-29-root-migration-requirements.md) — origin requirements
