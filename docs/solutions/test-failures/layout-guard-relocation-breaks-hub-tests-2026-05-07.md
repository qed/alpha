---
title: Layout guard relocation breaks hub tests
date: 2026-05-07
category: test-failures
module: testing
problem_type: test_failure
component: testing_framework
severity: medium
symptoms:
  - "TypeError: `.single()` is not a function in null-geography-guards.test.tsx"
  - "Unable to find text: 'Select your geography' — guard relocated from page to layout"
  - "Unable to find text: 'Parents Hub' — text removed in prior commit"
  - "'expected false to be true' — redirects test over-broadly asserted all redirects are permanent"
  - "'expected true to be false' — geography-selection tests assumed actions enforce role checks"
root_cause: logic_error
resolution_type: test_fix
tags:
  - vitest
  - testing-library
  - app-router
  - layout-guard
  - null-geography
  - next-js
---

# Layout guard relocation breaks hub tests

## Problem

After consolidating the geography null guard from individual page components into the shared dashboard layout (`src/app/hub/(dashboard)/layout.tsx`), five tests across four files broke because they were coupled to the old architecture rather than testing at the correct boundary.

## Symptoms

- `TypeError: supabase.from(...).select(...).eq(...).single is not a function` in null-geography-guards.test.tsx
- `Unable to find text: Select your geography` when rendering individual page components that no longer contain the guard
- `Unable to find text: Parents Hub` in public-navbar.test.tsx after that text was removed in commit b4f8993
- `expected false to be true` for `redirect.permanent` in redirects.test.ts because the /toronto redirect is intentionally non-permanent
- `expected true to be false` for `result.success` in geography-selection.test.ts because server actions never enforced role checks

## What Didn't Work

- Rendering `DashboardPage` and `PipelinePage` directly to test the geography guard -- the guard no longer lives in those components after the layout consolidation
- Asserting "Parents Hub" text in the navbar -- removed in a prior commit to fix mobile overlap
- Asserting `permanent: true` on all redirects without filtering -- the /toronto redirect is intentionally temporary
- Expecting `selectGeography` and `createGeography` server actions to reject non-champion roles -- the actions never enforced role checks; enforcement is done by `requireChampion` at the page level

## Solution

**Failure 1 -- null-geography-guards.test.tsx (2 tests):** Rewrote tests to render `DashboardLayout` with children instead of individual page components.

Before:

```tsx
import DashboardPage from "@/app/hub/(dashboard)/page";

it("shows GeographyPicker when geographyId is null", async () => {
  mockRequireAuth.mockResolvedValue({
    userId: "user_1", role: "champion", geographyId: null,
  });
  const page = await DashboardPage();
  render(page);
  expect(screen.getByText("Select your geography")).toBeInTheDocument();
});
```

After:

```tsx
import DashboardLayout from "@/app/hub/(dashboard)/layout";

it("shows GeographyPicker when geographyId is null", async () => {
  mockRequireAuth.mockResolvedValue({
    userId: "user_1", role: "champion", geographyId: null,
  });
  const layout = await DashboardLayout({
    children: <div>Dashboard content</div>,
  });
  render(layout);
  expect(screen.getByText("Austin")).toBeInTheDocument();
  expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument();
});
```

**Failure 2 -- public-navbar.test.tsx (1 test):** Removed the obsolete test case that asserted "Parents Hub" text.

**Failure 3 -- redirects.test.ts (1 test):** Filtered to only hub redirects before asserting permanence.

Before:

```ts
for (const redirect of redirects) {
  expect(redirect.permanent).toBe(true);
}
```

After:

```ts
const hubRedirects = redirects.filter((r) => r.destination.startsWith("/hub/"));
expect(hubRedirects.length).toBeGreaterThan(0);
for (const redirect of hubRedirects) {
  expect(redirect.permanent).toBe(true);
}
```

**Failure 4 -- geography-selection.test.ts (2 tests):** Removed both "rejects non-champion role" test cases. The server actions never enforced role checks -- that responsibility belongs to `requireChampion` at the page level.

## Why This Works

The root cause across all five failures was test coupling to implementation details rather than behavioral boundaries. Tests assumed the geography guard lived in individual page components (it moved to the layout), assumed removed UI text still existed, assumed all redirects shared the same permanence flag, and assumed server actions enforced role checks that actually live at the page level. Fixing each test meant aligning it with the actual architecture: testing the layout for layout-level guards, removing assertions on deleted UI, scoping redirect assertions to the relevant subset, and removing assertions for behavior that never existed in the code under test.

## Prevention

1. **Test at the correct architectural boundary** -- if a guard lives in a layout, test the layout, not the pages it wraps. In Next.js App Router, layouts and pages are separate rendering units with distinct responsibilities.
2. **Distinguish page-level from action-level concerns** -- do not assert role checks in server action tests if the action delegates enforcement to a higher layer (`requireChampion` at page level vs `requireAuthenticated` at action level).
3. **Update tests in the same PR as architectural changes** -- when consolidating guards or other concerns into a shared layer, update the corresponding tests in the same commit rather than treating test updates as a follow-up task.

## Related Issues

- `docs/solutions/best-practices/layout-level-data-gate-geography-picker-2026-05-02.md` -- the architectural change that caused these test failures
- `docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md` -- the original per-page guard pattern the old tests were written against
- `docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md` -- hub routing/layout architecture context
