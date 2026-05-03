---
title: "Cascading production auth failures: Clerk v7 + Supabase + Vercel"
date: 2026-05-01
last_updated: 2026-05-02
category: integration-issues
module: authentication
problem_type: integration_issue
component: authentication
severity: critical
symptoms:
  - "Post-sign-in redirects to / instead of /hub due to empty Vercel env vars"
  - "Middleware auth.protect() causes infinite redirect loop on protected routes"
  - "Session claims contain literal template strings like {{user.private_metadata.role}}"
  - "Supabase RLS blocks all dashboard queries — anon client has no auth session"
  - "user.reload() hangs indefinitely after successful geography selection"
root_cause: config_error
resolution_type: code_fix
tags:
  - clerk-v7
  - supabase-rls
  - vercel-env-vars
  - redirect-loop
  - session-claims
  - nextjs-16
  - middleware
  - production-auth
  - server-actions
  - profile-id
---

# Cascading production auth failures: Clerk v7 + Supabase + Vercel

## Problem

A Next.js 16.2.4 + Clerk v7 + Supabase app deployed on Vercel at www.alphatoronto.org had eight interlocking production auth failures. Each fix exposed the next issue, forming a dependency chain that made the problem appear to be one hard-to-diagnose bug when it was actually eight independent issues across environment configuration, middleware, session claims, Supabase RLS, Clerk client-side APIs, server action client selection, and FK identity resolution.

## Symptoms

- After signing in via Clerk, users redirected to `/` instead of `/hub`
- New users clicking "Sign up" from the `<SignIn>` component had no page to land on
- Redirect loop: `/hub/dashboard` -> `/hub/sign-in` -> `/hub` (visible in Vercel streaming logs)
- Clicking "Go to Dashboard" from `/hub` redirected back to `/hub` even after middleware fix
- Dashboard showed "Geography not found. Please contact an administrator." despite geography existing in DB
- Geography selection succeeded in DB but UI showed "Creating..." indefinitely

## What Didn't Work

- **Fixing Vercel env vars alone**: Clerk v7's `<SignIn>` component didn't reliably respect `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` env var
- **Adding more route matchers to `createRouteMatcher`**: `auth.protect()` still failed to recognize authenticated users
- **Defaulting unrecognized roles to "champion"**: Worked but left the fundamental fragility of depending on Clerk session claim template processing

## Solution

Six fixes applied in sequence, each unmasking the next:

### 1. Vercel env vars + forceRedirectUrl

`NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`, and `NEXT_PUBLIC_CLERK_SIGN_IN_URL` were all empty strings `""` in production Vercel. Removed and re-added with correct values. Added `forceRedirectUrl` prop as belt-and-suspenders:

```tsx
<SignIn forceRedirectUrl="/hub" />
<SignUp forceRedirectUrl="/hub" />
```

### 2. Created sign-up page

Created `src/app/hub/(auth)/sign-up/[[...sign-up]]/page.tsx` with `<SignUp forceRedirectUrl="/hub" />`.

### 3. Removed auth.protect() from middleware

`clerkMiddleware()` with `createRouteMatcher` and `auth.protect()` failed to recognize authenticated users on protected routes.

```typescript
// Before (broken)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
const isProtectedRoute = createRouteMatcher(["/hub/dashboard(.*)", ...]);
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

// After (working)
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware();
```

Per-page server components handle access control instead.

### 4. Read role/geography from Supabase instead of Clerk claims

Vercel logs revealed session claims contained literal template strings:

```json
{
  "role": "{{user.private_metadata.role}}",
  "geography_id": "{{user.private_metadata.geography_id}}"
}
```

`requireAuth()` treated this as an invalid role and redirected. Fixed by reading from Supabase directly:

```typescript
// Before: Clerk session claims (fragile)
const role = (sessionClaims?.role as string) || "champion";
const geographyId = (sessionClaims?.geography_id as string) || null;

// After: Supabase profiles table (authoritative)
const supabase = getSupabaseAdminClient();
const { data: profile } = await supabase
  .from("profiles")
  .select("role, geography_id")
  .eq("clerk_user_id", userId)
  .maybeSingle();
const role = profile?.role === "admin" ? "admin" : "champion";
const geographyId = profile?.geography_id ?? null;
```

### 5. Switched dashboard pages to Supabase admin client

All 6 dashboard pages used `getSupabaseServerClient()` (anon key + RLS). Since auth is via Clerk, there's no Supabase auth session, so RLS blocks all queries. Changed to `getSupabaseAdminClient()` — safe because pages are behind Clerk auth.

### 6. Added timeout to user.reload()

`user?.reload()` hung indefinitely. Added a 3-second timeout:

```typescript
async function handleRefresh() {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 3000)
    );
    await Promise.race([user?.reload(), timeout]);
  } catch {
    // Fall through to router refresh
  }
  router.refresh();
}
```

### 7. Switched server actions from anon client to admin client

Fix 5 above switched **dashboard pages** (reads) to the admin client. Server actions (writes) still used `getSupabaseServerClient()` (anon key), which is subject to the same RLS failure — every mutation silently failed or returned errors. The entire server action layer had never worked.

```typescript
// Before (broken) — in src/lib/actions/pipeline.ts, prospects.ts, champions.ts
import { getSupabaseServerClient } from "@/lib/supabase/server";
const supabase = await getSupabaseServerClient();

// After (working)
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
const supabase = getSupabaseAdminClient();
```

### 8. Resolved Supabase profile UUID for FK columns instead of Clerk user ID

Even after fix 7, FK constraint violations appeared. Server actions used `session.userId` (Clerk user ID string like `user_2abc...`) for FK columns referencing `profiles(id)` (UUID type). The types don't match.

Fixed by adding `profileId` to `SessionInfo` — resolved during auth by looking up `profiles.id` via `clerk_user_id`:

```typescript
// src/lib/auth.ts
export interface SessionInfo {
  userId: string;
  profileId: string;  // Supabase profiles.id UUID
  role: "admin" | "champion";
  geographyId: string | null;
}

export async function requireAuth(): Promise<SessionInfo> {
  const { userId } = await auth();
  if (!userId) redirect("/hub");
  const supabase = getSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, geography_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!profile) redirect("/hub");
  return {
    userId,
    profileId: profile.id,
    role: profile.role === "admin" ? "admin" : "champion",
    geographyId: profile.geography_id ?? null,
  };
}
```

Then in all server actions:

```typescript
// Before:
actor_id: session.userId,     // Clerk string "user_2abc..."
champion_id: session.userId,
author_id: session.userId,

// After:
actor_id: session.profileId,     // UUID from profiles table
champion_id: session.profileId,
author_id: session.profileId,
```

## Why This Works

The eight issues were independent root causes forming a dependency chain — each masked the next:

1. **forceRedirectUrl** takes precedence over env vars in Clerk v7, making redirects deterministic.
2. **Bare `clerkMiddleware()`** establishes auth context (required for `auth()`) without making access-control decisions. Per-page guards are more reliable and debuggable.
3. **Supabase is the authoritative source** for role and geography. Session claims are a cache optimization that can fail silently.
4. **Admin client bypasses RLS** — the correct choice when auth is handled by a different system (Clerk) and pages are already access-controlled.
5. **Timeouts on external API calls** prevent UI hangs when third-party services stall.
6. **Server actions need the same admin client as pages.** The anon-key client is subject to RLS regardless of whether the operation is a read (page) or write (action). Both contexts lack a Supabase auth session in Clerk-authed apps.
7. **Resolving profileId at auth time** converts the Clerk identity to the Supabase identity exactly once, at the system boundary. Every downstream action uses the correct UUID type for FK references without repeating the lookup.

## Prevention

- **Never rely solely on Clerk session claims for critical auth decisions.** Use your database as the authoritative source. Session claims are a cache optimization, not a source of truth.
- **Always add `forceRedirectUrl` prop to Clerk `<SignIn>` and `<SignUp>` components.** Don't rely on `NEXT_PUBLIC_CLERK_AFTER_*` env vars alone in Clerk v7.
- **Use Supabase admin client everywhere in Clerk-authed apps — pages AND server actions.** No Supabase auth session exists when auth is via Clerk, so RLS blocks everything with the anon client. This applies to both reads and writes.
- **Use `session.profileId` (not `session.userId`) for FK columns referencing `profiles(id)`.** Clerk user IDs are opaque strings, not UUIDs — they will cause FK constraint violations.
- **Resolve `profileId` in `requireAuth()` so it's available to all downstream actions.** The profile lookup is already happening for role/geography — adding `id` to the select costs nothing.
- **Add timeouts to all Clerk client-side API calls.** `user.reload()`, `session.touch()`, etc. can hang without warning.
- **After Vercel env var changes, always redeploy.** `NEXT_PUBLIC_*` vars are baked at build time.
- **Use bare `clerkMiddleware()` without `auth.protect()`.** Let per-page server components handle access control.
- **Grep for `getSupabaseServerClient` in `src/lib/actions/`.** Any occurrence is a bug in a Clerk-authenticated app.
- **Grep for `session.userId` in Supabase insert/update calls.** Any occurrence where a UUID FK column receives `session.userId` instead of `session.profileId` is a type mismatch bug.
- **Test the full auth chain in production after every auth-related deploy.** Sign-up -> sign-in -> redirect -> dashboard access -> data mutations (not just reads).
- **When debugging redirect loops, add `console.log` to auth checks and use Vercel streaming logs** (`vercel logs <deployment-url>`).

## Related Issues

- [clerk-v7-auth-requires-middleware-2026-04-29.md](../runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md) -- Why bare `clerkMiddleware()` must exist
- [clerk-v7-vercel-edge-middleware-and-basepath-2026-04-29.md](../integration-issues/clerk-v7-vercel-edge-middleware-and-basepath-2026-04-29.md) -- Earlier Clerk + Vercel middleware issues
- [clerk-auth-redirect-loop-null-geography-2026-04-30.md](../logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md) -- Earlier redirect loop for null geography
- [hub-auth-aware-layout-and-routing-patterns-2026-04-30.md](../best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md) -- Auth-aware layout patterns
