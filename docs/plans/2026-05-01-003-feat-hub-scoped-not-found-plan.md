---
title: "feat: Hub-scoped not-found page preserving sidebar layout"
type: feat
status: complete
date: 2026-05-01
---

# feat: Hub-scoped not-found page preserving sidebar layout

## Overview

Add a `not-found.tsx` under `/hub` so that any unmatched route renders a 404 message inside the hub layout with the sidebar visible, instead of falling through to the bare root-level 404.

## Problem Frame

When a user navigates to a non-existent route under `/hub` (e.g., `/hub/typo` or a deleted page), Next.js shows the root `src/app/not-found.tsx` which renders outside the hub layout. The sidebar disappears and the user is stranded. This was identified as a prevention measure in `docs/solutions/ui-bugs/missing-hub-placeholder-pages-cause-404-2026-05-01.md`.

## Requirements Trace

- R1. Any unmatched URL under `/hub/*` renders inside the hub layout with the sidebar visible
- R2. The 404 content matches the hub page styling pattern
- R3. Navigation links point back to hub pages (not root-level links)

## Scope Boundaries

- Not changing the root `src/app/not-found.tsx` — it handles non-hub 404s
- Not adding auth-aware content to the 404 page — the sidebar already handles auth state
- Not adding analytics or error tracking for 404 hits

## Context & Research

### Relevant Code and Patterns

- `src/app/hub/layout.tsx` — wraps children in `HubShell` which provides the sidebar
- `src/app/hub/pipeline/page.tsx` — representative hub page styling pattern (`max-w-[920px]` wrapper, `text-ink` heading, `text-ink-3` body)
- `src/app/not-found.tsx` — root-level 404 page (does not use hub layout)

### Institutional Learnings

- `docs/solutions/ui-bugs/missing-hub-placeholder-pages-cause-404-2026-05-01.md` — documents the exact problem and recommends this fix
- `docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md` — the not-found page should sit at `src/app/hub/` level (outside `(dashboard)/` route group) so it renders with the sidebar but without requiring authentication

### Key Next.js Behavior

Per `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`: a nested `not-found.tsx` only triggers from explicit `notFound()` calls within that route segment. For truly unmatched URLs (no matching route segment at all), the root `app/not-found.tsx` handles it. To intercept unmatched `/hub/*` URLs, a catch-all route is needed that calls `notFound()`.

## Key Technical Decisions

- **Catch-all route required**: A `[...catchAll]/page.tsx` under `/hub` that calls `notFound()` is necessary to trigger the hub-level `not-found.tsx` for unmatched URLs. Without it, unmatched routes fall through to the root 404.
- **Place outside `(dashboard)/`**: The not-found page should be accessible regardless of auth state. It sits at `src/app/hub/not-found.tsx`, not inside any route group.
- **Safe coexistence with Clerk auth routes**: The `(auth)` route group contains optional catch-all routes (`sign-in/[[...sign-in]]`, `sign-up/[[...sign-up]]`) for Clerk's multi-step auth flows (SSO callbacks, MFA). Next.js resolves static segments (`sign-in`, `sign-up`) before dynamic catch-alls, so `/hub/sign-in/factor-one` routes to the Clerk page — not the catch-all. Verify these paths in testing.

## Implementation Units

- [x] **Unit 1: Catch-all route and not-found page**

  **Goal:** Create two files — a catch-all route that triggers `notFound()` and a hub-scoped not-found page that renders inside the hub layout.

  **Requirements:** R1, R2, R3

  **Dependencies:** None

  **Files:**
  - Create: `src/app/hub/[...catchAll]/page.tsx`
  - Create: `src/app/hub/not-found.tsx`

  **Approach:**
  - `[...catchAll]/page.tsx`: Import `notFound` from `next/navigation`, call it immediately. This ensures any unmatched `/hub/*` URL triggers the hub-level not-found page.
  - `not-found.tsx`: Server component using the same styling pattern as other hub pages. Show a "Page not found" heading, brief message, and a link back to `/hub` (Intro) or `/hub/library`. Do not use `"use client"` — no interactivity needed.

  **Patterns to follow:**
  - `src/app/hub/pipeline/page.tsx` — page styling pattern
  - `src/app/not-found.tsx` — 404 content structure (heading, message, nav links)

  **Test scenarios:**
  - Happy path: navigating to `/hub/nonexistent` shows the hub 404 page with sidebar visible
  - Happy path: navigating to `/hub/some/deep/nonexistent/path` also shows hub 404 with sidebar
  - Edge case: existing routes (`/hub/library`, `/hub/dashboard`, `/hub/pipeline`) still work normally — catch-all does not intercept them
  - Edge case: auth-gated routes (`/hub/dashboard` when not logged in) still redirect to sign-in, not 404
  - Edge case: Clerk multi-step auth flows (`/hub/sign-in/factor-one`, `/hub/sign-up/verify-email-address`) still render Clerk pages, not 404

  **Verification:** Navigate to any non-existent `/hub/*` URL in the browser — sidebar remains visible, 404 message appears in the content area, and nav links work.

## System-Wide Impact

- **Interaction graph:** The catch-all route only calls `notFound()` — no side effects. The not-found page is a static server component with no data fetching.
- **Unchanged invariants:** All existing hub routes continue to work. The catch-all has lowest priority in Next.js route matching, so it only fires when no other route matches.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Catch-all intercepts Clerk auth routes (`sign-in/[[...sign-in]]`, `sign-up/[[...sign-up]]`) | Next.js resolves static segments before dynamic catch-alls. `/hub/sign-in/*` matches the `sign-in` folder first. Verify Clerk multi-step flows (SSO, MFA) in testing. |

## Sources & References

- Related solution: `docs/solutions/ui-bugs/missing-hub-placeholder-pages-cause-404-2026-05-01.md`
- Next.js not-found docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`
