---
title: Auth redirect loop for champions without geography assignment
date: 2026-04-30
category: logic-errors
module: auth
problem_type: logic_error
component: authentication
symptoms:
  - Infinite redirect loop on /hub for newly signed-up champions
  - Browser shows continuous loading between /hub, /hub/dashboard, and /hub/sign-in
  - Only affects users with valid Clerk sessions but no geography_id in session claims
root_cause: logic_error
resolution_type: code_fix
severity: critical
tags:
  - clerk
  - redirect-loop
  - auth
  - next-js
  - server-components
  - geography
  - requirechampion
---

# Auth redirect loop for champions without geography assignment

## Problem

Champions (parent volunteers) who signed up via Clerk but hadn't been assigned a geography got stuck in an infinite redirect loop, making the entire `/hub` section unusable for new users.

## Symptoms

- Browser showed infinite loading/redirecting on `/hub`
- Redirect chain: `/hub` -> redirect to `/hub/dashboard` -> dashboard layout auth check -> `requireChampion()` redirects to `/hub/sign-in` (null geography) -> Clerk auth succeeds -> `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` sends back to `/hub` -> repeat
- Only affected authenticated users with no `geography_id` in their Clerk session claims
- Users with geography assigned worked fine

## What Didn't Work

- The hub page was initially redirect-only (redirected all visitors to `/hub/sign-in`), which meant even unauthenticated users couldn't see a welcome page and authenticated users without geography were trapped in the loop
- Making `requireChampion()` redirect to a different URL didn't help because the fundamental issue was that there was no valid destination for a user without geography

## Solution

Three-part fix:

**1. Relaxed the auth guard** (`src/lib/auth.ts`):

Before:
```typescript
export async function requireChampion(): Promise<SessionInfo> {
  const session = await requireAuth();
  if (!session.geographyId) {
    redirect("/hub/sign-in"); // This caused the loop
  }
  return session;
}
```

After (also renamed to reflect its actual behavior):
```typescript
export async function requireAuthenticated(): Promise<SessionInfo> {
  return requireAuth();
}
```

**2. Added null-geography guards to all champion pages** with a styled pending state:

```typescript
const session = await requireAuthenticated();
if (!session.geographyId) {
  return (
    <div className="text-center py-16 text-ink-3">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
        Almost there!
      </h2>
      <p className="text-lg leading-relaxed max-w-md mx-auto">
        Your account is set up, but a geography hasn&rsquo;t been assigned yet.
        Please contact your administrator to get started.
      </p>
    </div>
  );
}
```

**3. Added null-geography guards to all server actions**:

```typescript
const session = await requireAuthenticated();
if (!session.geographyId) {
  return { success: false, error: "No geography assigned." };
}
```

## Why This Works

The redirect loop existed because there was no valid page a geography-less champion could land on. Every page either required geography (and redirected to sign-in) or required no auth (and redirected to dashboard). By allowing authenticated users without geography to reach the dashboard and see a helpful pending state, the loop breaks.

The auth guard now only validates what its name implies -- authentication. Geography is checked per-page and per-action with graceful UI fallbacks instead of hard redirects.

## Prevention

- Auth guard functions should only validate what their name implies -- don't overload `requireChampion()` with geography validation when its callers expect authentication
- When adding redirect-based auth guards, trace the full redirect chain (page -> layout -> middleware -> Clerk -> back) to check for loops
- Always test the "new user with no data" path -- users who just signed up often have incomplete profiles
- Add explicit test cases for null/missing session claim fields:

```typescript
it("shows pending state when geographyId is null", async () => {
  mockRequireAuthenticated.mockResolvedValue({
    userId: "user_1",
    role: "champion",
    geographyId: null,
  });
  const page = await DashboardPage();
  render(page);
  expect(screen.getByText("Almost there!")).toBeInTheDocument();
});
```

## Related Issues

- [docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md](../runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md) -- Clerk v7 middleware requirement (related auth context)
- [docs/plans/2026-04-29-003-feat-hub-welcome-page-plan.md](../../plans/2026-04-29-003-feat-hub-welcome-page-plan.md) -- Plan that identified and scoped this fix (Unit 3)
