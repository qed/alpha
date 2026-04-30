---
title: Double auth() call in hub page routing
date: 2026-04-30
category: performance-issues
module: auth
problem_type: performance_issue
component: authentication
symptoms:
  - Two Clerk auth() API calls per page load on /hub for authenticated users
  - Redundant network round-trip on every hub page visit
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - clerk
  - auth
  - performance
  - next-js
  - server-components
---

# Double auth() call in hub page routing

## Problem

The hub page (`src/app/hub/page.tsx`) called `auth()` from Clerk to check if a user was authenticated, then called `requireAuth()` which internally called `auth()` again -- two Clerk API calls on every page load for authenticated users.

## Symptoms

- Two `auth()` calls in the server component render path for `/hub`
- Redundant Clerk API round-trip adding latency to every authenticated visit
- No visible error, but unnecessary performance cost

## What Didn't Work

- This wasn't a failed investigation -- it was caught during code review (P1 finding from correctness and maintainability reviewers)

## Solution

Read `sessionClaims` directly from the single `auth()` call for routing decisions.

Before:
```typescript
const { userId } = await auth();
if (userId) {
  const session = await requireAuth(); // calls auth() again internally
  if (session.role === "admin") redirect("/hub/leaderboard");
  redirect("/hub/dashboard");
}
```

After:
```typescript
const { userId, sessionClaims } = await auth();
if (userId) {
  const role = (sessionClaims?.role as string) || "champion";
  if (role === "admin") redirect("/hub/leaderboard");
  redirect("/hub/dashboard");
}
```

## Why This Works

The hub page only needs to make a routing decision (which dashboard to redirect to) -- it doesn't need the full validated `SessionInfo` object that `requireAuth()` provides. Reading `sessionClaims` directly from the single `auth()` call is sufficient for determining admin vs champion routing. The heavier `requireAuth()` with its role validation and defaults is reserved for pages that actually render content requiring a validated session.

## Prevention

- When a page only branches on auth state (redirect vs render), use `auth()` directly instead of calling a wrapper that calls `auth()` again
- Reserve `requireAuth()`/`requireAuthenticated()` for pages that need the full validated `SessionInfo` object
- During code review, watch for wrapper functions that call `auth()` when the caller already has the auth result

## Related Issues

- [docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md](../logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md) -- Related auth routing fix in the same file
- [docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md](../runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md) -- Clerk v7 auth() requires middleware context
