---
title: Use catch-all route with not-found.tsx to preserve layout on 404s in Next.js App Router
date: 2026-05-01
category: best-practices
module: hub
problem_type: best_practice
component: hotwire_turbo
severity: medium
applies_when:
  - "A route segment has a layout (e.g., sidebar, shell) that should remain visible on 404"
  - "Unmatched URLs under a route prefix fall through to a bare root-level 404"
tags:
  - nextjs
  - app-router
  - not-found
  - catch-all
  - layout
  - sidebar
  - 404
---

# Use catch-all route with not-found.tsx to preserve layout on 404s in Next.js App Router

## Context

In Next.js App Router, a `not-found.tsx` placed inside a route segment (e.g., `src/app/hub/not-found.tsx`) only triggers from explicit `notFound()` calls within that segment. For truly unmatched URLs — routes with no matching `page.tsx` anywhere — the root `app/not-found.tsx` handles it, rendering outside the segment's layout. This means any layout-level UI (sidebar, shell, navigation) disappears on 404.

This was discovered when three sidebar links in the `/hub` route had no pages, producing 404s that lost the sidebar and stranded users.

## Guidance

Pair a **catch-all route** with a **segment-level `not-found.tsx`**:

**`src/app/hub/[...catchAll]/page.tsx`** — catches any unmatched `/hub/*` URL:
```tsx
import { notFound } from "next/navigation";

export default function HubCatchAll() {
  notFound();
}
```

**`src/app/hub/not-found.tsx`** — renders inside the hub layout:
```tsx
import Link from "next/link";

export default function HubNotFound() {
  return (
    <div className="max-w-[920px] mx-auto px-8 py-10 max-sm:px-5 max-sm:py-8">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link href="/hub">Back to Hub</Link>
    </div>
  );
}
```

## Why This Matters

Without this pattern, any unmatched URL under a layout-wrapped route segment renders a bare 404 page with no navigation. Users are stranded — they can't navigate back without the browser back button or typing a URL manually. The catch-all + not-found pair ensures the layout (and all its navigation) stays visible.

## When to Apply

- Any route segment with a persistent layout (sidebar, shell, header) that should remain visible on 404
- Route prefixes with many sub-routes where pages may be added or removed over time
- Sections with auth-gated and public routes coexisting under the same layout

## Examples

**Before:** Navigating to `/hub/nonexistent` renders the root 404 page — no sidebar, no hub navigation.

**After:** Navigating to `/hub/nonexistent` renders the hub not-found page inside `HubShell` — sidebar visible, navigation links work.

**Coexistence with route groups:** The catch-all has lowest priority in Next.js route resolution. Static segments (e.g., `sign-in`, `library`, `dashboard`) match before `[...catchAll]`. Clerk's optional catch-all routes (`sign-in/[[...sign-in]]`, `sign-up/[[...sign-up]]`) also resolve correctly because the `sign-in`/`sign-up` static segments take priority.

## Related

- [`docs/solutions/ui-bugs/missing-hub-placeholder-pages-cause-404-2026-05-01.md`](../ui-bugs/missing-hub-placeholder-pages-cause-404-2026-05-01.md) — the problem that motivated this pattern
- [`docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`](../best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md) — hub routing architecture context
- Next.js not-found docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`
