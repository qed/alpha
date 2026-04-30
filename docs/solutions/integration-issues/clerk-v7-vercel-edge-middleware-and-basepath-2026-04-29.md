---
title: Clerk v7 Vercel Edge Runtime Middleware Failure and basePath 404s
date: 2026-04-29
category: integration-issues
module: crm
problem_type: integration_issue
component: authentication
severity: high
symptoms:
  - "Vercel deployment fails with Edge Runtime errors from Clerk v7 middleware using Node.js APIs"
  - "proxy.ts convention not recognized by Vercel, causing auth middleware to be silently ignored"
  - "All routes return 404 on Vercel due to basePath: '/crm' when app is deployed on its own domain"
root_cause: config_error
resolution_type: config_change
tags:
  - vercel
  - clerk
  - edge-runtime
  - middleware
  - basepath
  - nextjs-16
  - deployment
  - 404
---

# Clerk v7 Vercel Edge Runtime Middleware Failure and basePath 404s

## Problem

After deploying a Next.js 16 CRM to Vercel, the app failed with two independent issues that masked each other: Clerk v7's middleware required Node.js APIs unavailable in Vercel's Edge Runtime, and `basePath: "/crm"` caused universal 404 errors because the app was deployed to its own domain rather than under a `/crm` subpath. Five consecutive fix commits were required to isolate and resolve both.

## Symptoms

- Vercel build/runtime failures because `clerkMiddleware` from `@clerk/nextjs/server` uses Node.js-only APIs (crypto, async hooks) unavailable in Vercel's Edge Runtime
- After resolving the middleware issue, every route returned 404 — Vercel expected pages under `/crm/...` due to `basePath`, but incoming requests hit `/dashboard`, `/api/...` without the prefix

## What Didn't Work

1. **Adding `export const runtime = "nodejs"` to middleware.ts**: Vercel ignores the `runtime` export in `middleware.ts` — middleware always runs in the Edge Runtime on Vercel. This is a platform-level constraint.

2. **Renaming middleware.ts to proxy.ts**: Next.js 16 introduced a `proxy.ts` convention that runs on Node.js by default, but Vercel's deployment infrastructure does not support this convention. The file was silently ignored.

3. **Reverting proxy.ts back to middleware.ts with runtime export**: Same Edge Runtime limitation as attempt 1.

4. **Deleting middleware.ts only**: Correctly eliminated the Edge Runtime error (middleware was redundant), but the 404 problem persisted because its root cause was `basePath`, not middleware.

## Solution

Two independent config changes were required:

**1. Remove redundant middleware (commit 8073274)**

Delete `middleware.ts` entirely. Auth was already enforced at:
- Dashboard layout calling `auth.protect()` and redirecting unauthenticated users
- Individual pages calling `requireAdmin()` or `requireChampion()` for role-based access

The role-based redirects middleware performed (blocking champions from `/leaderboard`, `/geography/*`, `/champions`) are replicated in those pages' server components.

**2. Remove basePath (commit 0040334)**

`basePath: "/crm"` was a leftover from a monorepo-style setup where the CRM lived at a subpath. On its own Vercel domain, incoming URLs never include `/crm` — so every request 404'd.

```typescript
// Before (broken) — next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/crm",
};

export default nextConfig;

// After (working) — next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

## Prevention

- **Do not use middleware for auth if the auth library requires Node.js APIs.** Check whether your auth provider (Clerk, Auth.js, etc.) is Edge-compatible before placing it in `middleware.ts`. Prefer layout-level and page-level auth checks, which always run on Node.js in server components.

- **Only set `basePath` when the app is actually served under a subpath.** If the app has its own domain or is the root of a Vercel project, `basePath` must be omitted.

- **Deploy to a Vercel preview environment before merging.** A single preview deployment would have caught both issues before they compounded in production.

- **Enforce auth in one canonical layer (layout or middleware), not both.** Redundancy obscures which layer is actually enforcing security.

- **Check that your hosting platform supports new framework conventions (e.g., `proxy.ts`) before adopting them.** Framework docs and platform docs can be out of sync.

## Related Issues

- Commits: 2803e9b, 7a81d53, 4bb31d2, 8073274, 0040334 (the 5 fix sequence)
- `docs/plans/2026-04-29-001-feat-enrollment-crm-plan.md` — original CRM plan still prescribes Clerk middleware pattern; stale on this point
- `docs/plans/2026-04-29-002-refactor-root-migration-hub-rename-plan.md` — already incorporates these learnings in its Institutional Learnings section
