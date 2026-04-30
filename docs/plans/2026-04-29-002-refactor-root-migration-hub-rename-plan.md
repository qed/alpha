---
title: "refactor: Migrate to unified Next.js app with /hub routing"
type: refactor
status: active
date: 2026-04-29
origin: docs/brainstorms/2026-04-29-root-migration-requirements.md
---

# Migrate to Unified Next.js App with /hub Routing

## Overview

Restructure the Alpha School repo into a single Next.js 16 app deployed from the root directory to Vercel. Three content areas share one app: the marketing letter at `/`, parent stories at `/v1`, and the enrollment hub at `/hub/...`. The enrollment app moves from its current root-level routes to live under `/hub`, the concept is renamed from "CRM" to "Hub", and the old `crm/` subdirectory and GitHub Pages deployment are removed.

## Problem Frame

The repo has a static marketing site (HTML/CSS/JS), an interactive parent stories page (CDN React), and a Next.js enrollment app nested in a `crm/` subdirectory. This structure creates deployment friction, path confusion, and prevents the site from being a single deployable unit. The enrollment app was previously accessible at `/crm` and needs to move to `/hub` to match its product name ("Alpha Hub"). (see origin: `docs/brainstorms/2026-04-29-root-migration-requirements.md`)

## Requirements Trace

**Page Conversion**
- R1. Landing page converted to Next.js page at `/`
- R2. Parent stories page converted to Next.js page at `/v1` with all interactive behavior
- R3. Assets migrated to work within the Next.js project

**Hub URL Migration**
- R4. Enrollment app served under `/hub/...` path prefix
- R5. "CRM" references renamed to "Hub"

**Repo Restructuring**
- R6. Project files at repo root, not `crm/` subdirectory
- R7. Old `crm/` directory removed
- R8. Old static site files removed after conversion

**Deployment**
- R9. Deploy to Vercel as single project
- R10. GitHub Pages workflow removed

## Scope Boundaries

- No new features or functional changes to any page
- No domain/DNS configuration
- No `/crm` → `/hub` redirect for old bookmarks (not publicly launched)
- Public intake routes (`/[geography]`, `/privacy`) stay at root level — they are public-facing
- API webhook route (`/api/webhooks/clerk`) stays at root level — avoids Clerk dashboard reconfiguration

## Context & Research

### Relevant Code and Patterns

- **Route groups**: `(auth)`, `(public)`, `(dashboard)/(admin)`, `(dashboard)/(champion)` — all currently at root level
- **Auth pattern**: No middleware, no ClerkProvider. Auth enforced via `requireAuth()`/`requireAdmin()`/`requireChampion()` server-side guards in `src/lib/auth.ts`
- **Server actions**: All mutations via `"use server"` functions in `src/lib/actions/`
- **Supabase clients**: Three patterns — server, admin (service role), browser — in `src/lib/supabase/`
- **Tailwind v4**: Uses `@theme inline` in `globals.css` with design tokens that already align with the static site's CSS custom properties
- **AGENTS.md**: Next.js 16 has breaking changes — `params` is `Promise<>`, `headers()`/`cookies()` are async. Read `node_modules/next/dist/docs/` before writing code
- **25 hardcoded route paths** across 13 source files need `/hub` prefix (complete inventory in flow analysis)
- **Font loading**: Three Google Fonts loaded via `next/font/google` in root layout as CSS custom properties — shared by both marketing and enrollment pages

### Institutional Learnings

- `basePath` caused Vercel routing 404s — do not use. Use filesystem routing instead
- Clerk middleware was removed due to Edge Runtime incompatibility (5 consecutive fix commits). Auth is enforced per-page via server-side guards — this is the intentional pattern
- The v1 stories page uses React 18 UMD + Babel standalone — conversion is a rewrite, not an adaptation

## Key Technical Decisions

- **Filesystem routing for `/hub`**: Move dashboard and auth routes into `src/app/hub/` directory. No `basePath`, no rewrites. Prior `basePath` attempts failed on Vercel (see origin doc)
- **API and public routes stay at root**: `src/app/api/` and `src/app/(public)/` remain at root level to avoid breaking the Clerk webhook registration and to keep intake form URLs stable
- **CSS import for marketing pages**: Import the existing `colors-and-type.css`, `kit.css`, `landing.css`, and `page.css` as CSS files alongside Tailwind rather than porting to Tailwind. The design tokens already align. This eliminates visual drift risk
- **Stories data as static TypeScript**: Convert `stories.js` to a typed `.ts` file. 12 static stories, no CRUD needs
- **Minimal root layout**: Root layout provides only HTML shell and shared fonts. Route-group-specific layouts handle metadata and styling for marketing vs. hub
- **No ClerkProvider needed**: Clerk v7 works without a wrapping provider in Next.js App Router. Auth guards remain server-side only
- **`/hub` index page as role router**: Create a `/hub/page.tsx` that reads the session, checks role, and redirects to the appropriate dashboard. Unauthenticated users redirect to `/hub/sign-in`
- **Old-path redirects in next.config.ts**: Add permanent redirects: `/dashboard` → `/hub/dashboard`, `/sign-in` → `/hub/sign-in`, `/leaderboard` → `/hub/leaderboard`, `/prospects/:path*` → `/hub/prospects/:path*`, `/champions` → `/hub/champions`, `/geography/:path*` → `/hub/geography/:path*`. Low cost, prevents broken bookmarks and email links during transition

## Open Questions

### Resolved During Planning

- **Where does Clerk redirect after sign-in?** → Set `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/hub` so Clerk redirects to the `/hub` index page, which then routes by role
- **Should API routes move under `/hub`?** → No. Keep at root to avoid Clerk webhook reconfiguration
- **Should public intake routes move under `/hub`?** → No. They are public-facing and geography-specific URLs may already be shared
- **Privacy page "Back" link behavior change** → Accept it. `/` becoming the marketing page is a reasonable "Back" destination for a public privacy page
- **CSS approach for marketing pages** → Import existing CSS files. Design tokens already align with Tailwind theme. No porting needed
- **Stories data location** → Static TypeScript file. No runtime data source

### Deferred to Implementation

- **Exact component decomposition for stories page**: The 530-line `components.jsx` needs to be split into multiple files. Exact file boundaries depend on seeing the code in context
- **next/image optimization**: Which static-site images benefit from `next/image` vs. staying as `<img>` tags. Depends on image sizes and formats encountered during conversion
- **Geography slug validation**: Whether to add a `RESERVED_SLUGS` constant (for `v1`, `hub`, `api`, `privacy`, `sign-in`) — low risk since these static routes take precedence via Next.js routing, but prevents confusing edge cases

## Implementation Units

- [ ] **Unit 1: Restructure route tree for `/hub`**

**Goal:** Move all enrollment app routes (dashboard, auth) into the `src/app/hub/` directory so they are served under the `/hub` URL prefix. Create the `/hub` index page as a role-based router.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Create: `src/app/hub/page.tsx` (role router — reads session, redirects to dashboard or leaderboard)
- Create: `src/app/hub/(auth)/sign-in/[[...sign-in]]/page.tsx` (move from `src/app/(auth)/`)
- Create: `src/app/hub/(dashboard)/layout.tsx` (move from `src/app/(dashboard)/`)
- Create: `src/app/hub/(dashboard)/(champion)/dashboard/page.tsx` (move)
- Create: `src/app/hub/(dashboard)/(champion)/prospects/page.tsx` (move)
- Create: `src/app/hub/(dashboard)/(champion)/prospects/[id]/page.tsx` (move)
- Create: `src/app/hub/(dashboard)/(champion)/prospects/new/page.tsx` (move)
- Create: `src/app/hub/(dashboard)/(admin)/leaderboard/page.tsx` (move)
- Create: `src/app/hub/(dashboard)/(admin)/champions/page.tsx` (move)
- Create: `src/app/hub/(dashboard)/(admin)/geography/[geography]/page.tsx` (move)
- Delete: `src/app/(auth)/` (moved to hub)
- Delete: `src/app/(dashboard)/` (moved to hub)

**Approach:**
- Move files, preserving route group structure. The URL changes from `/dashboard` to `/hub/dashboard`, `/sign-in` to `/hub/sign-in`, etc.
- The `(public)` route group stays at root — intake forms and privacy page remain at `/{geography}` and `/privacy`
- The `api/` directory stays at root — webhook remains at `/api/webhooks/clerk`
- The `/hub/page.tsx` role router calls `auth()`, checks `sessionClaims?.role`, and redirects: admin → `/hub/leaderboard`, champion → `/hub/dashboard`, unauthenticated → `/hub/sign-in`

**Patterns to follow:**
- `src/lib/auth.ts` for role-checking pattern
- `src/app/(dashboard)/layout.tsx` for auth guard pattern

**Test scenarios:**
- Happy path: authenticated champion visiting `/hub` is redirected to `/hub/dashboard`
- Happy path: authenticated admin visiting `/hub` is redirected to `/hub/leaderboard`
- Edge case: unauthenticated user visiting `/hub` is redirected to `/hub/sign-in`
- Edge case: unauthenticated user visiting `/hub/dashboard` is redirected to `/hub/sign-in`
- Happy path: `/hub/sign-in` renders the Clerk SignIn widget
- Test: `src/__tests__/hub-routing.test.ts`

**Verification:**
- All enrollment app pages respond at their `/hub/...` URLs
- Old root-level paths (`/dashboard`, `/sign-in`) return 404 (redirects added in Unit 5)

---

- [ ] **Unit 2: Update all internal navigation paths**

**Goal:** Update every hardcoded route path in the codebase to include the `/hub` prefix where needed. Update Clerk environment variables.

**Requirements:** R4

**Dependencies:** Unit 1

**Files:**
- Modify: `src/lib/auth.ts` (4 redirect calls: `/sign-in` → `/hub/sign-in`, `/dashboard` → `/hub/dashboard`)
- Modify: `src/app/hub/(dashboard)/layout.tsx` (redirect and nav hrefs)
- Modify: `src/app/hub/(dashboard)/(champion)/prospects/page.tsx` (Add Prospect href)
- Modify: `src/app/hub/(dashboard)/(champion)/prospects/[id]/page.tsx` (Back to prospects hrefs)
- Modify: `src/app/hub/(dashboard)/(champion)/prospects/new/page.tsx` (router.push paths)
- Modify: `src/app/hub/(dashboard)/(admin)/geography/[geography]/page.tsx` (leaderboard hrefs)
- Modify: `src/components/admin/leaderboard-grid.tsx` (geography card href)
- Modify: `src/components/dashboard/prospect-table.tsx` (prospect row href)
- Modify: `src/lib/actions/notifications.ts` (email URL: `${baseUrl}/prospects` → `${baseUrl}/hub/prospects`)
- Modify: `.env.local.example` (`NEXT_PUBLIC_CLERK_SIGN_IN_URL=/hub/sign-in`, add `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/hub`, add `NEXT_PUBLIC_APP_URL`)
- Test: `src/__tests__/middleware.test.ts` (update route pattern expectations)

**Approach:**
- Systematic find-and-replace guided by the 25-path inventory from flow analysis
- Paths in `(public)` routes stay unchanged — intake forms, privacy page, confirmation page all remain at root level
- `src/components/dashboard/copy-link-button.tsx` needs NO change — it uses `window.location.origin` + geography slug, which remains correct
- `src/components/intake/intake-form.tsx` and `city-selector.tsx` need NO change — intake routes stay at root
- `src/app/(public)/privacy/page.tsx` needs NO change — `href="/"` now points to marketing page, which is acceptable

**Patterns to follow:**
- Existing path usage patterns in `src/lib/auth.ts`

**Test scenarios:**
- Happy path: champion navigates from dashboard → prospects list → prospect detail → back, all under `/hub/...`
- Happy path: admin navigates leaderboard → geography drill-down → back to leaderboard, all under `/hub/...`
- Happy path: auth guard redirects unauthenticated user to `/hub/sign-in`
- Happy path: notification email contains `${baseUrl}/hub/prospects` URL
- Edge case: `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is set to `/hub/sign-in` in environment
- Integration: after Clerk sign-in, user is redirected to `/hub` (role router) → appropriate dashboard
- Test: `src/__tests__/middleware.test.ts` (updated patterns)
- Test: `src/__tests__/actions/notifications.test.ts` (URL assertion)

**Verification:**
- Grep for bare `/sign-in`, `/dashboard`, `/leaderboard`, `/prospects`, `/champions`, `/geography/` paths — none should remain in source files (excluding paths in `(public)` routes and test expectations)

---

- [ ] **Unit 3: Refactor root layout for unified app**

**Goal:** Make the root layout minimal so it serves both marketing pages and the enrollment hub. Move enrollment-specific metadata into the hub layout.

**Requirements:** R1, R2, R4

**Dependencies:** Unit 1

**Files:**
- Modify: `src/app/layout.tsx` (strip enrollment metadata, keep fonts and HTML shell)
- Modify: `src/app/hub/(dashboard)/layout.tsx` (add enrollment-specific metadata via `export const metadata`)
- Modify: `src/app/globals.css` (keep Tailwind, ensure it doesn't break marketing page CSS)

**Approach:**
- Root layout keeps: `<html>`, `<body>`, font CSS custom properties (`--font-display`, `--font-body`, `--font-editorial`), minimal global styles
- Root layout removes: `title: "Alpha School Enrollment"`, enrollment-specific description
- Root `metadata` becomes: `title: "Alpha School"`, generic description
- Hub dashboard layout adds: `export const metadata = { title: "Alpha Hub", description: "..." }`
- Marketing pages and v1 page can set their own metadata via per-page `export const metadata`
- The three Google Fonts (Archivo, Inter, Instrument Serif) stay in the root layout because they are used by both the marketing pages and the enrollment app

**Patterns to follow:**
- Next.js App Router metadata merging — per-page/per-layout metadata overrides parent metadata

**Test scenarios:**
- Happy path: `/` page has title "Alpha Toronto Parents Hub" (or equivalent)
- Happy path: `/hub/dashboard` page has title containing "Alpha Hub"
- Happy path: `/v1` page has title "Alpha Toronto Parents Hub" (or equivalent)
- Test: `src/__tests__/layouts.test.ts`

**Verification:**
- Root layout contains no enrollment-specific metadata
- Each content area can set its own page title independently

---

- [ ] **Unit 4: Convert landing page to Next.js**

**Goal:** Convert the static marketing letter (`index.html`) to a Next.js page at `/`, preserving content and visual design.

**Requirements:** R1, R3

**Dependencies:** Unit 3

**Files:**
- Create: `src/app/page.tsx` (replaces placeholder "CRM coming soon")
- Create: `src/app/landing.css` (import existing landing.css, kit.css, colors-and-type.css styles)
- Modify: `public/` (ensure images like `artifacts/Alpha Toronto.jpg`, `hero-summer.jpg`, `alpha-report-card.pdf` are present)

**Approach:**
- The landing page is ~100 lines of static HTML — a nav, hero section, letter article, parent quote card, and CTA
- Convert to a Server Component (no interactivity needed)
- Import the existing CSS files (`css/colors-and-type.css`, `css/kit.css`, `css/landing.css`) to preserve exact styling. CSS custom properties in `colors-and-type.css` align with the Tailwind theme tokens
- Use standard `<img>` tags initially — `next/image` optimization can be added later
- Keep external links as-is (community.alpha.school, report card PDF)
- Export page-specific metadata: `title: "Alpha Toronto Parents Hub"`

**Patterns to follow:**
- Static page pattern — Server Component with no `"use client"` directive
- `src/app/(public)/privacy/page.tsx` as an example of a simple content page

**Test scenarios:**
- Happy path: visiting `/` renders the marketing letter with nav, hero, letter content, parent quote card, and CTA
- Happy path: all images and PDF links resolve correctly
- Happy path: page title is "Alpha Toronto Parents Hub"
- Edge case: responsive layout renders correctly (existing CSS has breakpoints at 640px)
- Test: `src/__tests__/pages/landing.test.tsx`

**Verification:**
- Visual comparison: page at `/` matches the content and layout of the original `index.html`
- All links (community, PDF, nav) work correctly

---

- [ ] **Unit 5: Add redirects, 404 page, and slug validation**

**Goal:** Add permanent redirects from old root-level paths to `/hub/...` equivalents. Add a custom 404 page. Add reserved slug validation.

**Requirements:** R4

**Dependencies:** Unit 1, Unit 2

**Files:**
- Modify: `next.config.ts` (add `redirects` for old paths)
- Create: `src/app/not-found.tsx` (custom 404 page with links to `/`, `/v1`, `/hub/sign-in`)
- Modify: `src/lib/constants/geographies.ts` (add `RESERVED_SLUGS` constant)

**Approach:**
- Redirects in `next.config.ts`: `/dashboard` → `/hub/dashboard`, `/sign-in` → `/hub/sign-in`, `/leaderboard` → `/hub/leaderboard`, `/prospects/:path*` → `/hub/prospects/:path*`, `/champions` → `/hub/champions`, `/geography/:path*` → `/hub/geography/:path*`. All permanent (308)
- Custom `not-found.tsx`: simple page with links to main sections. Uses the root layout
- Reserved slugs: `['v1', 'hub', 'api', 'privacy', 'sign-in']` — used for validation if geography creation adds server-side checks

**Patterns to follow:**
- Next.js `redirects` config pattern — see `node_modules/next/dist/docs/` for Next.js 16 syntax
- `src/app/(public)/privacy/page.tsx` as example for simple page structure

**Test scenarios:**
- Happy path: visiting `/dashboard` redirects to `/hub/dashboard` with 308 status
- Happy path: visiting `/sign-in` redirects to `/hub/sign-in`
- Happy path: visiting `/prospects/abc-123` redirects to `/hub/prospects/abc-123`
- Happy path: visiting `/nonexistent-page` shows custom 404 with navigation links
- Edge case: visiting `/toronto` (valid geography) does NOT redirect — it renders the intake form
- Edge case: `RESERVED_SLUGS` includes `v1`, `hub`, `api`, `privacy`, `sign-in`
- Test: `src/__tests__/redirects.test.ts`

**Verification:**
- Old paths redirect correctly to `/hub/...` equivalents
- Invalid routes show the custom 404 page
- Public intake routes are unaffected by redirects

---

- [ ] **Unit 6: Convert v1 stories page to Next.js**

**Goal:** Port the CDN React parent stories page to an idiomatic Next.js page at `/v1`, preserving all interactive behavior.

**Requirements:** R2, R3

**Dependencies:** Unit 3

**Files:**
- Create: `src/app/v1/page.tsx` (page wrapper, imports CSS, renders client component)
- Create: `src/components/stories/stories-app.tsx` (`"use client"` — main stories app component)
- Create: `src/components/stories/story-card.tsx` (card variants: short, QA, long)
- Create: `src/components/stories/story-modal.tsx` (full-screen story viewer)
- Create: `src/components/stories/story-feed.tsx` (filterable feed with layout options)
- Create: `src/components/stories/faq-section.tsx` (accordion FAQ)
- Create: `src/components/stories/icons.tsx` (SVG icon components)
- Create: `src/components/stories/ui-primitives.tsx` (StatusBadge, DepthMarker, ProgressPills)
- Create: `src/lib/constants/stories.ts` (typed story data, status metadata, FAQ items)
- Create: `src/app/v1/stories.css` (import existing page.css, kit.css, colors-and-type.css)
- Test: `src/__tests__/pages/stories.test.tsx`

**Approach:**
- This is the highest-effort unit. The source is 530 lines of JSX using React 18 UMD globals + Babel standalone transpilation + 1,094 lines of CSS
- Convert `const { useState, useEffect, useMemo, useRef } = React;` to standard React 19 module imports
- Split the monolithic `components.jsx` into separate component files organized under `src/components/stories/`
- Convert `STORIES`, `STATUS_META`, `DEPTH_META`, `FAQ_ITEMS` global variables into typed TypeScript exports in `src/lib/constants/stories.ts`
- The page wrapper (`src/app/v1/page.tsx`) is a Server Component that sets metadata and renders the client-side `StoriesApp` component
- `StoriesApp` is a `"use client"` component — all interactive behavior (filtering, modals, localStorage, keyboard events) requires client-side React
- Import the existing CSS files as-is to preserve exact visual appearance
- Replace `ReactDOM.createRoot()` rendering with standard Next.js page mounting
- Keep `localStorage` usage for story persistence (`ath_story` key)

**Patterns to follow:**
- `src/components/intake/intake-form.tsx` as example of a complex `"use client"` component
- `src/components/dashboard/prospect-table.tsx` for interactive data display patterns
- `src/lib/constants/geographies.ts` and `pipeline.ts` for data constant patterns

**Test scenarios:**
- Happy path: visiting `/v1` renders the stories page with nav, hero stats, featured story, and story feed
- Happy path: clicking a status filter chip filters stories by that status
- Happy path: selecting a grade from the dropdown filters stories by grade
- Happy path: clicking a story card opens the story modal with full content
- Happy path: pressing ESC or clicking backdrop closes the story modal
- Happy path: FAQ accordion items expand and collapse on click
- Edge case: filtering to a status with no matching stories shows appropriate empty state
- Edge case: combining status + grade filters works correctly
- Edge case: page renders correctly without localStorage (first visit)
- Integration: story modal prevents body scroll when open, restores when closed
- Test: `src/__tests__/pages/stories.test.tsx`
- Test: `src/__tests__/components/stories/story-feed.test.tsx`

**Verification:**
- Visual comparison: page at `/v1` matches the content, layout, and behavior of the original `v1/index.html`
- All 12 family stories render correctly
- Filtering, modal, and FAQ interactions work as expected
- No hydration errors in the browser console

---

- [ ] **Unit 7: Rename CRM → Hub**

**Goal:** Rename all "CRM" references to "Hub" across the codebase.

**Requirements:** R5

**Dependencies:** Unit 1, Unit 2

**Files:**
- Modify: `package.json` (`"name": "crm"` → `"name": "alpha-hub"`)
- Modify: `src/components/emails/new-prospect-email.tsx` (any "CRM" text)
- Modify: `src/app/page.tsx` (if placeholder text remains — already replaced by Unit 4)
- Modify: `README.md` (project name and description)

**Approach:**
- Grep for case-insensitive "crm" across all source files (excluding `node_modules`, `.next`, `crm/`)
- Update package name in `package.json` and `package-lock.json` (regenerate lock file)
- Update UI copy, email templates, and documentation
- Do NOT rename: Clerk application name, Supabase project slug, Vercel project name — those are external identifiers managed separately

**Patterns to follow:**
- Existing naming conventions in the codebase

**Test scenarios:**
- Happy path: `package.json` name is `"alpha-hub"`
- Happy path: no user-visible UI copy or email templates reference "CRM"
- Happy path: `README.md` describes the project as "Alpha Hub"
- Test expectation: none — this is a naming change with no behavioral impact

**Verification:**
- `grep -ri "crm" src/` returns no results (excluding false positives like "increment")

---

- [ ] **Unit 8: Clean up and configure deployment**

**Goal:** Remove the old `crm/` directory, remove old static site files, remove GitHub Pages workflow, and ensure Vercel deployment works.

**Requirements:** R6, R7, R8, R9, R10

**Dependencies:** All previous units

**Files:**
- Delete: `crm/` (entire directory — source files already at root, build artifacts and node_modules are disposable)
- Delete: `public/index.html`, `public/letter.html` (content converted to Next.js in Unit 4)
- Delete: `public/v1/` (content converted to Next.js in Unit 6)
- Delete: `public/css/`, `public/js/` (CSS imported into Next.js pages, JS converted to components)
- Delete: `.github/workflows/pages.yml`
- Modify: `next.config.ts` (verify no additional Vercel-specific config needed — framework auto-detection should handle it)
- Modify: `.gitignore` (verify `.env.local` is excluded, add `.vercel` if not present)

**Approach:**
- Verify `node_modules/` exists at root and `npm install` has been run (replaces `crm/node_modules/`)
- Verify `.env.local` at root contains all required env vars from `.env.local.example`
- Keep `public/assets/` (student photos, guide photos, commitment icons, hero image) and `public/artifacts/` (logo, school photos, report card PDF) — these are referenced by the converted Next.js pages
- Vercel auto-detects Next.js projects — no `vercel.json` or `vercel.ts` needed for basic deployment
- Environment variables must be configured in Vercel dashboard: all vars from `.env.local.example` (including `NEXT_PUBLIC_APP_URL`) plus `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/hub`

**Patterns to follow:**
- Standard Next.js Vercel deployment

**Test scenarios:**
- Happy path: `npm run build` succeeds from root directory
- Happy path: `npm run dev` starts the dev server and all three content areas respond
- Happy path: no files reference paths inside `crm/`
- Edge case: `.env.local` is excluded from git tracking
- Test expectation: none for the cleanup itself — verification is running the existing test suite

**Verification:**
- `npm run build` completes without errors
- `npm run dev` serves all pages correctly: `/`, `/v1`, `/hub`, `/hub/dashboard`, `/toronto`, `/api/webhooks/clerk`
- No `crm/` directory exists
- No old static HTML files remain in `public/`
- Existing test suite passes

## System-Wide Impact

- **Interaction graph:** Clerk webhook → `/api/webhooks/clerk` (unchanged). Clerk sign-in redirect → `/hub` (new). Email notifications → `${baseUrl}/hub/prospects` (updated). Public intake forms → `/{geography}` (unchanged). Old bookmarked paths → 308 redirect → `/hub/...`
- **Error propagation:** Auth failures in `requireAuth()`/`requireAdmin()`/`requireChampion()` now redirect to `/hub/sign-in` instead of `/sign-in`. The redirect chain is the same — just the target path changes
- **State lifecycle risks:** The marketing pages and v1 stories page have no server-side state — they are static content pages. The enrollment hub's state management (Supabase, Clerk sessions) is unchanged
- **API surface parity:** The Clerk webhook endpoint stays at `/api/webhooks/clerk` — no reconfiguration needed in Clerk dashboard. Public intake form URLs stay at `/{geography}` — any shared links remain valid
- **Integration coverage:** The Clerk after-sign-in redirect flow (`/hub/sign-in` → Clerk auth → `/hub` → role router → dashboard) is a new flow that must be tested end-to-end
- **Unchanged invariants:** All Supabase queries, RLS policies, server actions, and data models are unchanged. The Clerk webhook handler, Turnstile integration, Upstash rate limiting, and Resend email sending are unchanged. Only URL paths change — no business logic modifications

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Missed hardcoded path causes broken navigation | Complete 25-path inventory documented; grep verification in Unit 2 |
| V1 stories conversion introduces visual regression | Import existing CSS files as-is; visual comparison against original |
| React 18 → 19 behavioral differences in stories components | Stories use only basic hooks (useState, useEffect, useMemo, useRef) — these are backward-compatible |
| `[geography]` dynamic route shadows `/v1` | Next.js prioritizes static routes over dynamic segments; verified by test in Unit 5 |
| Vercel deployment fails | Recent commit history shows prior Vercel issues. Build verification in Unit 8 before deploying |
| Clerk redirect loop after sign-in | `/hub` role router handles the redirect target; `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` configured |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-29-root-migration-requirements.md](docs/brainstorms/2026-04-29-root-migration-requirements.md)
- Related code: `src/lib/auth.ts`, `src/app/(dashboard)/layout.tsx`, `src/app/(public)/[geography]/page.tsx`
- Related commits: `0040334` (basePath removal), `8073274` (middleware removal)
- Static site source: `public/v1/index.html`, `public/js/components.jsx`, `public/js/stories.js`, `public/css/page.css`
