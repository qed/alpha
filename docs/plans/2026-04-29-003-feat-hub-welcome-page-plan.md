---
title: "feat: Hub welcome page with auth-aware routing"
type: feat
status: active
date: 2026-04-29
origin: docs/brainstorms/2026-04-29-hub-welcome-page-requirements.md
---

# feat: Hub welcome page with auth-aware routing

## Overview

Add a public welcome page at `/hub` that explains what the Alpha Parents Hub is, previews the tools available to champions, and invites visitors to sign in. Authenticated users bypass the welcome page and are routed to their role-appropriate dashboard. The root page's navbar is extracted into a shared component for use on both pages.

## Problem Frame

The Alpha Hub (`/hub`) currently has no public-facing landing page — unauthenticated visitors are immediately redirected to a Clerk sign-in form with no context. The hub also uses a different navbar than the root page, creating a visual disconnect. (See origin: `docs/brainstorms/2026-04-29-hub-welcome-page-requirements.md`)

## Requirements Trace

- R1. `/hub` displays a public welcome page for unauthenticated visitors
- R2. Communicates the value proposition: love Alpha School, want tools to help more people commit
- R3. Previews planned tools — FAQ library, parent testimonials, "why Alpha" talking points — as cards
- R4. Frames joining as becoming a leader with access to tracking tools and resources
- R5. Single "Enter the Hub" CTA button → `/hub/sign-in`
- R6. Identical navbar to root page (Alpha Toronto logo, "Parents Hub" label, "The Academics" link, "Join the Community" button)
- R7. Logged-in users bypass welcome page → role-appropriate dashboard (admin→leaderboard, champion→dashboard, no-role→champion dashboard)
- R8. Post-sign-in redirect to `/hub` (env vars already fixed locally, verify Vercel dashboard)
- R9. Section flow: Hero → Value Proposition → Tools Preview (3 cards) → Leader Framing → CTA

## Scope Boundaries

- Welcome page is a server-rendered page with an auth check — no client-side data fetching or database queries beyond `auth()`
- No changes to the dashboard navbar or authenticated experience
- No sign-up flow changes — Clerk handles that
- The previewed tools (FAQs, testimonials, talking points) are described but not built
- R8 env var fix ships independently (already done locally)

## Context & Research

### Relevant Code and Patterns

- `src/app/page.tsx` lines 15–50 — root page navbar (inline JSX to extract)
- `src/app/hub/page.tsx` — current redirect-only page to rewrite
- `src/app/hub/(dashboard)/layout.tsx` — dashboard navbar and layout (not modified)
- `src/lib/auth.ts` — `requireAuth()` defaults role to `"champion"`, `requireChampion()` requires `geographyId`
- `src/components/shared/` — existing shared component directory (kebab-case, named exports)
- `src/app/globals.css` — Tailwind v4 theme tokens (`alpha-blue`, `paper`, `ink`, etc.)
- `src/app/layout.tsx` — font variables (`--font-display`, `--font-body`, `--font-editorial`)

### Institutional Learnings

- **Clerk v7 middleware is required** — `auth()` will crash without `clerkMiddleware()` in `src/middleware.ts`. The middleware establishes context, not route protection. (See `docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md`)
- **Never use basePath** — use filesystem routing under `src/app/hub/` instead. (See `docs/solutions/integration-issues/clerk-v7-vercel-edge-middleware-and-basepath-2026-04-29.md`)
- **Root layout stays minimal** — domain-specific UI belongs in route group layouts, not the root layout. (See `docs/solutions/best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md`)
- **AGENTS.md warning** — Next.js 16 has breaking changes. Check `node_modules/next/dist/docs/` before writing any code.

## Key Technical Decisions

- **Extract navbar into shared component**: The root page navbar is inline JSX. Rather than duplicating 35 lines, extract into `src/components/shared/public-navbar.tsx` and import from both pages. This prevents future drift. (See origin: R6, Key Decisions)
- **Server component with conditional rendering**: `/hub/page.tsx` calls `auth()` server-side. If authenticated, redirect. If not, render the welcome page. No client components needed. This matches the existing pattern and ensures authenticated users never see the welcome page HTML.
- **Use `requireAuth()` for hub page routing**: `/hub/page.tsx` should call `requireAuth()` from `src/lib/auth.ts` instead of raw `auth()`. `requireAuth()` already defaults missing roles to `"champion"` and validates against known roles, eliminating the need for manual fallback logic. This also prevents the redirect loop where no-role users bounce between `/hub` and `/hub/sign-in`. For unauthenticated detection, catch the redirect from `requireAuth()` by checking `auth()` first for `userId`, then calling `requireAuth()` only when authenticated.
- **Relax `requireChampion()` for no-geography users**: Currently `requireChampion()` redirects users without `geographyId` to `/hub/sign-in`, creating a redirect loop for newly signed-up champions who haven't been assigned a geography. Change this to return the session with `geographyId: null` and let the dashboard page show an empty state instead of bouncing.
- **Page must remain dynamic**: The `auth()` call makes this a dynamic server component. Do not add `export const dynamic = 'force-static'` or similar.

## Open Questions

### Resolved During Planning

- **Navbar extraction vs. duplication?** Extract — prevents drift, small scope increase (modifying root page import), consistent with DRY conventions.
- **Competing CTAs (navbar "Join the Community" vs. page "Enter the Hub")?** Keep both per R6 — they serve different purposes (external community vs. hub sign-in). The page body CTA is visually dominant.
- **Cross-link between `/` and `/hub`?** Not in scope. The hub is shared via direct links to invited champions. Adding discoverability from the root page is a separate decision.

### Deferred to Implementation

- **Exact welcome page copy**: R2-R4 describe themes, not final text. The implementer should write copy that matches the tone of the root page's letter.
- **Tool preview card visuals**: R3/R9 say "cards or icons" — the implementer should match the existing card pattern (`bg-paper-3 rounded-xl`) or the blue card pattern from the root page.
- **Next.js 16 API compatibility**: Check `node_modules/next/dist/docs/` for any breaking changes to `Image`, `Link`, or `redirect` before coding.

## Implementation Units

- [ ] **Unit 1: Extract public navbar into shared component**

  **Goal:** Move the root page's inline navbar into a reusable component so both `/` and `/hub` can share it.

  **Requirements:** R6

  **Dependencies:** None

  **Files:**
  - Create: `src/components/shared/public-navbar.tsx`
  - Modify: `src/app/page.tsx`
  - Test: `src/__tests__/components/public-navbar.test.tsx`

  **Approach:**
  - Create a named-export server component `PublicNavbar` (no props needed — content is static)
  - Move lines 15–50 from `src/app/page.tsx` (the `<nav>` through `</nav>`) into the new component
  - The component uses `next/image` for the logo and `next/link` for internal navigation
  - Import `PublicNavbar` back into `src/app/page.tsx` where the inline nav was
  - Verify root page renders identically

  **Patterns to follow:**
  - Named export pattern: `export function PublicNavbar()` (see `src/components/shared/progress-bar.tsx`)
  - Kebab-case filename (see `src/components/shared/status-badge.tsx`)
  - No barrel file — direct import via `@/components/shared/public-navbar`

  **Test scenarios:**
  - Happy path: Component renders the Alpha Toronto logo image
  - Happy path: Component renders "Parents Hub" label text
  - Happy path: Component renders "The Academics" link pointing to `/artifacts/alpha-report-card.pdf`
  - Happy path: Component renders "Join the Community" link pointing to `community.alpha.school`

  **Verification:**
  - Root page at `/` renders exactly as before — no visual changes
  - `PublicNavbar` is a standalone importable component

- [ ] **Unit 2: Build hub welcome page with auth-aware routing**

  **Goal:** Replace the redirect-only `/hub/page.tsx` with a welcome page for unauthenticated visitors and correct role-based routing for authenticated users.

  **Requirements:** R1, R2, R3, R4, R5, R7, R9

  **Dependencies:** Unit 1 (PublicNavbar component)

  **Files:**
  - Modify: `src/app/hub/page.tsx`
  - Test: `src/__tests__/hub-page.test.tsx`

  **Approach:**
  - Keep as an async server component
  - **Auth routing (top of component):**
    - Call `auth()` from `@clerk/nextjs/server` to check `userId`
    - If no `userId`: fall through to render the welcome page
    - If `userId` exists: call `requireAuth()` from `@/lib/auth` to get the validated session with role defaulted to `"champion"`. Then redirect by role — `admin` → `/hub/leaderboard`, `champion` → `/hub/dashboard`. No manual fallback needed since `requireAuth()` guarantees role is `"admin"` or `"champion"`.
  - **Welcome page rendering (R9 section flow):**
    - `<PublicNavbar />` at the top
    - **Hero section**: Heading ("Welcome to the Alpha Parents Hub"), tagline about leading Alpha in your community. Use the root page's hero pattern — blue gradient background, `font-display` heading, `font-editorial` italic accent
    - **Value Proposition section**: Short prose about loving Alpha School and wanting tools to help more families commit. Use `text-lg leading-[1.7] text-ink-2` body text pattern
    - **Tools Preview section**: 3 cards for FAQ Library, Parent Testimonials, "Why Alpha" Talking Points. Use `bg-paper-3 rounded-xl` card pattern
    - **Leader Framing section**: Prose about becoming a leader in your community with access to tracking tools and conversation resources
    - **CTA section**: Single "Enter the Hub" button using `<Link href="/hub/sign-in">` with the established CTA button styling (`bg-alpha-blue text-white rounded-full shadow-blue`)
  - Use the existing design tokens from `globals.css` — `alpha-blue`, `paper`, `ink`, `paper-3` for cards
  - Match the root page's responsive patterns (`max-w-[800px] mx-auto`, `max-sm:` breakpoints)

  **Patterns to follow:**
  - Root page layout and typography in `src/app/page.tsx`
  - Auth pattern: `auth()` for unauthenticated check, `requireAuth()` from `src/lib/auth.ts` for authenticated routing
  - CTA card pattern from root page's "What happens next" section (lines 194-212)
  - Card background pattern: `bg-paper-3 rounded-xl` (root page CTA section)

  **Test scenarios:**
  - Happy path: Unauthenticated user sees the welcome page with hero heading, value proposition, three tool preview cards, leader framing, and "Enter the Hub" CTA
  - Happy path: "Enter the Hub" CTA links to `/hub/sign-in`
  - Happy path: Welcome page renders the PublicNavbar component
  - Integration: Authenticated admin visiting `/hub` is redirected to `/hub/leaderboard`
  - Integration: Authenticated champion visiting `/hub` is redirected to `/hub/dashboard`
  - Edge case: Authenticated user with no role visiting `/hub` is redirected to `/hub/dashboard` (not `/hub/sign-in`)
  - Edge case: Authenticated user with unrecognized role visiting `/hub` is redirected to `/hub/dashboard`

  **Verification:**
  - Visiting `/hub` while logged out shows the welcome page with all sections
  - Visiting `/hub` while logged in as admin redirects to `/hub/leaderboard`
  - Visiting `/hub` while logged in as champion redirects to `/hub/dashboard`
  - No flash of welcome page content for authenticated users (server-side redirect)

- [ ] **Unit 3: Relax `requireChampion()` to handle missing geography gracefully**

  **Goal:** Prevent the redirect loop where newly signed-up champions without a `geography_id` bounce between `/hub/dashboard` and `/hub/sign-in`. Let them reach the dashboard and see an empty state instead.

  **Requirements:** R7 (no-role defaults to champion dashboard)

  **Dependencies:** None (can be done in parallel with Units 1-2, but the redirect loop manifests when Unit 2 ships)

  **Files:**
  - Modify: `src/lib/auth.ts`
  - Modify: `src/app/hub/(dashboard)/(champion)/page.tsx` (if it calls `requireChampion()`)
  - Test: `src/__tests__/auth.test.ts`

  **Approach:**
  - In `src/lib/auth.ts`, change `requireChampion()` to no longer redirect when `geographyId` is null. Instead, return the session with `geographyId: null`
  - Update the return type from `SessionInfo & { geographyId: string }` to `SessionInfo` (geography is no longer guaranteed)
  - In the champion dashboard page, handle the `geographyId: null` case by showing an empty/pending state (e.g., "Your geography hasn't been assigned yet. Contact your admin.")
  - This is a minimal change — the dashboard already handles empty data; it just never reaches that code path because `requireChampion()` bounces first

  **Patterns to follow:**
  - `requireAdmin()` pattern in `src/lib/auth.ts` — validates role without bouncing on missing data
  - Empty state patterns in existing dashboard components

  **Test scenarios:**
  - Happy path: Champion with `geographyId` set — `requireChampion()` returns session with geography
  - Edge case: Champion with no `geographyId` — `requireChampion()` returns session with `geographyId: null` (no redirect)
  - Edge case: Unauthenticated user — `requireChampion()` redirects to sign-in (via `requireAuth()`)
  - Integration: New champion signs in, has no geography, lands on dashboard with empty state instead of redirect loop

  **Verification:**
  - A newly signed-up champion with no `geography_id` can reach `/hub/dashboard` without a redirect loop
  - Champions with a `geography_id` see their normal dashboard (no regression)
  - Admin users are still redirected away from champion pages

## System-Wide Impact

- **Interaction graph:** `src/app/hub/page.tsx` changes from redirect-only to conditional render. Uses `auth()` for unauthenticated detection and `requireAuth()` for authenticated routing. `src/app/page.tsx` changes from inline navbar to imported component — no behavioral change. `src/lib/auth.ts` `requireChampion()` changes from hard redirect to graceful return on missing geography.
- **Error propagation:** If `auth()` throws (unlikely — middleware ensures context), the page will error. This matches existing behavior.
- **State lifecycle risks:** None — the welcome page is stateless. The `requireChampion()` change means champion dashboard pages must now handle `geographyId: null` — verify all callers.
- **Unchanged invariants:** Dashboard layout (`src/app/hub/(dashboard)/layout.tsx`), dashboard navbar, middleware configuration, and the Clerk webhook are not modified.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| No-geography champion redirect loop: if a user signs up but has no `geography_id` in session claims, `requireChampion()` in the dashboard page redirects to `/hub/sign-in`, which Clerk bounces back to `/hub`, creating a loop | Fixed in-scope by Unit 3: relax `requireChampion()` to return `geographyId: null` instead of redirecting, and show an empty dashboard state. Unit 2 also uses `requireAuth()` instead of raw `auth()` to guarantee role defaults to `"champion"`. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` not set — new users who register (not sign in) would be redirected to `/` instead of `/hub` | Add `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/hub` to `.env.local`, `.env.local.example`, and Vercel dashboard. This is a code-level change, not just a verification step. |
| Vercel dashboard env vars may not match local `.env.local` | Verify `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/hub/sign-in` and `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/hub` on Vercel dashboard before deploying. |
| Next.js 16 API breaking changes | Check `node_modules/next/dist/docs/` before coding, per AGENTS.md. Particularly verify `Image`, `Link`, and `redirect` APIs. |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-29-hub-welcome-page-requirements.md](docs/brainstorms/2026-04-29-hub-welcome-page-requirements.md)
- Related code: `src/app/page.tsx` (navbar source), `src/app/hub/page.tsx` (page to rewrite), `src/lib/auth.ts` (auth helpers)
- Institutional learning: `docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md`
- Institutional learning: `docs/solutions/best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md`
