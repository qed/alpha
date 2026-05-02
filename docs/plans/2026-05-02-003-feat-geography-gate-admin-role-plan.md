---
title: "feat: Add geography gate to dashboard layout and set admin role"
type: feat
status: completed
date: 2026-05-02
---

# feat: Add geography gate to dashboard layout and set admin role

## Overview

Move the geography check from individual champion pages up to the shared dashboard layout so that any authenticated user — admin or champion — without a geography sees the GeographyPicker and cannot access any dashboard page. Also make pkuperman@gmail.com an admin.

## Problem Frame

Currently the geography check only exists in two champion pages (dashboard, pipeline). An admin with no geography lands on admin pages with no issue, and a champion could theoretically navigate to other routes without hitting the check. The gate should be universal and at the layout level.

## Requirements Trace

- R1. Any authenticated user without a geography_id is blocked from all dashboard routes and shown the GeographyPicker
- R2. The gate must render the picker inline (not redirect) to avoid the redirect loop documented in `docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md`
- R3. Admins can select/create geographies using the same rules as champions (only unclaimed geographies shown)
- R4. pkuperman@gmail.com has role `admin` in both Supabase profiles and Clerk private metadata

## Scope Boundaries

- No new DB migration for the unique index — the existing champion constraint plus application-level filtering is sufficient for now
- No session-passing optimization to avoid double `requireAuth()` calls — acceptable trade-off for correctness
- No changes to RLS policies or the audit log

## Context & Research

### Relevant Code and Patterns

- `src/app/hub/(dashboard)/layout.tsx` — current layout uses `auth()` from Clerk for role/nav, redirects to `/hub` if no userId
- `src/app/hub/(dashboard)/(champion)/dashboard/page.tsx` — checks `session.geographyId`, shows GeographyPicker if null
- `src/app/hub/(dashboard)/(champion)/pipeline/page.tsx` — same per-page geography check
- `src/lib/auth.ts` — `requireAuth()` returns `SessionInfo` with geographyId from DB (source of truth per project convention)
- `src/lib/actions/geography-selection.ts` — `selectGeography` and `createGeography` both guard with `role !== "champion"`
- `src/lib/queries/geographies.ts` — `getAvailableGeographies` filters out geographies claimed by active champions only
- `src/components/dashboard/geography-picker.tsx` — existing picker component, no changes needed

### Institutional Learnings

- **Redirect loop** (`docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md`): A previous geography gate in `requireChampion()` caused infinite redirects. The fix was to render inline UI instead of redirecting. This plan follows that pattern — the layout renders GeographyPicker inline, no redirects.
- **Auth source of truth** (memory): Use Supabase as auth source of truth, not Clerk session claims. The layout currently reads role from `sessionClaims` — switching to `requireAuth()` improves correctness.

## Key Technical Decisions

- **Inline rendering over redirect**: The layout will render `<GeographyPicker>` instead of `{children}` when geographyId is null. This avoids the documented redirect loop.
- **Switch layout to `requireAuth()`**: The layout currently uses Clerk's `auth()` for userId and role. Switching to `requireAuth()` reads role from the DB (source of truth) and gives us geographyId in one call. This adds a DB query to the layout, but each page already makes its own `requireAuth()` call — the double query is an acceptable trade-off.
- **Application-level geography filtering**: `getAvailableGeographies` will filter out geographies claimed by ANY active user (not just champions). No DB constraint migration needed — the existing `idx_one_active_champion_per_geography` constraint covers the champion case, and the application-level filter prevents admin overlap.

## Implementation Units

- [x] **Unit 1: Allow all roles to select geography**

**Goal:** Remove the champion-only restriction from geography selection so admins can pick geographies too, and update available geography filtering to exclude all active users.

**Requirements:** R3

**Dependencies:** None

**Files:**
- Modify: `src/lib/actions/geography-selection.ts`
- Modify: `src/lib/queries/geographies.ts`

**Approach:**
- Remove the `if (session.role !== "champion")` guard from both `selectGeography` and `createGeography`
- In `getAvailableGeographies`, change the active-user query from filtering by `role: "champion"` to filtering all active profiles with a geography — remove `.eq("role", "champion")`

**Patterns to follow:**
- Existing action pattern in `geography-selection.ts`

**Test scenarios:**
- Happy path: admin calls selectGeography with a valid unclaimed geography — succeeds
- Happy path: admin calls createGeography — succeeds, geography created and assigned
- Edge case: geography already claimed by a champion — not shown in available list
- Edge case: geography already claimed by an admin — not shown in available list

**Verification:**
- Both selectGeography and createGeography work for admin and champion roles
- Available geographies list excludes those claimed by any active user

- [x] **Unit 2: Add geography gate to dashboard layout**

**Goal:** Gate all dashboard routes behind geography selection by checking geographyId in the layout and rendering GeographyPicker inline if null. Remove redundant per-page checks.

**Requirements:** R1, R2

**Dependencies:** Unit 1 (admins must be able to select geography before gating them)

**Files:**
- Modify: `src/app/hub/(dashboard)/layout.tsx`
- Modify: `src/app/hub/(dashboard)/(champion)/dashboard/page.tsx`
- Modify: `src/app/hub/(dashboard)/(champion)/pipeline/page.tsx`

**Approach:**
- In the layout, replace `auth()` + manual role extraction with `requireAuth()` from `src/lib/auth.ts`
- After the auth check, if `!session.geographyId`, call `getAvailableGeographies()` and render `<GeographyPicker>` wrapped in the layout shell (header visible, children replaced)
- Use `session.role === "admin"` for the `isAdmin` check (now from DB instead of session claims)
- In dashboard/page.tsx and pipeline/page.tsx, remove the `if (!session.geographyId)` blocks and the GeographyPicker imports

**Patterns to follow:**
- Existing geography check pattern in `dashboard/page.tsx` lines 17-20
- Layout auth pattern documented in `docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`

**Test scenarios:**
- Happy path: user with geography sees normal dashboard/pipeline content
- Happy path: user without geography sees GeographyPicker with header still visible
- Edge case: admin without geography is blocked and sees picker (not admin pages)
- Integration: after selecting a geography via the picker, the layout re-renders and shows dashboard content

**Verification:**
- No dashboard route is accessible without a geography
- GeographyPicker renders inline with the header visible (no redirect, no flash)
- Champion dashboard and pipeline pages no longer contain geography checks

- [x] **Unit 3: Set pkuperman@gmail.com as admin**

**Goal:** Update the role for pkuperman@gmail.com to `admin` in Supabase and Clerk.

**Requirements:** R4

**Dependencies:** None (can run in parallel with Units 1-2)

**Files:**
- Create: `scripts/set-admin.ts` (one-time script, can be deleted after use)

**Approach:**
- Write a short script that uses the Supabase admin client to update the `profiles` row where `email = 'pkuperman@gmail.com'` to `role = 'admin'`
- Use the Clerk SDK to update the user's private metadata with `role: "admin"`
- Alternatively, this can be done manually via the Supabase and Clerk dashboards — the script is a convenience

**Test expectation:** none — one-time data operation, verified by signing in

**Verification:**
- Sign in as pkuperman@gmail.com and confirm admin nav items appear
- Confirm geography picker appears if no geography is set

## System-Wide Impact

- **Interaction graph:** The layout now calls `requireAuth()` which queries Supabase on every dashboard page load. Individual pages still call `requireAuth()`/`requireAdmin()`, resulting in two DB queries per request. This is acceptable for now.
- **Unchanged invariants:** RLS policies, audit logging, the champion invitation flow, and public intake routes are not affected.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Double `requireAuth()` call per request | Acceptable perf trade-off; can optimize later with React.cache or context if needed |
| Admin claims geography, then champion can't be invited there | Intentional per requirements — same rules for everyone |

## Sources & References

- Redirect loop fix: `docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md`
- Auth layout patterns: `docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`
- Geography selection plan: `docs/plans/2026-05-01-002-feat-self-service-geography-selection-plan.md`
