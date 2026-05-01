---
title: Missing hub sidebar pages cause 404 and lose sidebar layout
date: 2026-05-01
category: ui-bugs
module: hub
problem_type: ui_bug
component: hotwire_turbo
severity: medium
symptoms:
  - "Clicking Pipeline, Events, or My Page in the hub sidebar returns a 404 page"
  - "404 page renders without the hub sidebar layout, stranding the user"
  - "Users cannot navigate back without browser back button or manually editing the URL"
root_cause: incomplete_setup
resolution_type: code_fix
tags:
  - nextjs
  - app-router
  - sidebar
  - navigation
  - placeholder-pages
  - hub
---

# Missing hub sidebar pages cause 404 and lose sidebar layout

## Problem

Three of five workspace links in the hub sidebar — Pipeline (`/hub/pipeline`), Events (`/hub/events`), and My Page (`/hub/my-page`) — had no corresponding `page.tsx` files. Clicking them produced a Next.js 404 that rendered outside the hub layout, removing the sidebar and stranding the user.

## Symptoms

- Clicking "Pipeline", "Events", or "My Page" in the hub sidebar shows a Next.js 404 page
- The 404 renders outside `/hub`'s layout, so the persistent sidebar disappears entirely
- No way to navigate back except browser back button or typing a URL manually

## What Didn't Work

No failed approaches — this was identified through a direct audit of the sidebar's `WORKSPACE_ITEMS` array in `src/components/hub/hub-sidebar.tsx` against the filesystem. The mismatch between declared routes and existing pages was the sole cause.

## Solution

Created placeholder pages for each missing route, following the existing Library page pattern (`src/app/hub/library/page.tsx`):

**`src/app/hub/pipeline/page.tsx`**
```tsx
export default function PipelinePage() {
  return (
    <div className="max-w-[920px] mx-auto px-8 py-10 max-sm:px-5 max-sm:py-8">
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[clamp(24px,5vw,36px)] leading-[1.1] tracking-[-0.03em] mb-2 text-ink">
        Pipeline
      </h1>
      <p className="text-[15px] leading-[1.6] text-ink-3 mb-8">
        Track and manage your prospect pipeline. Coming soon.
      </p>
    </div>
  );
}
```

Same pattern for `src/app/hub/events/page.tsx` and `src/app/hub/my-page/page.tsx` with appropriate titles and descriptions.

Pages are placed directly under `src/app/hub/` (not inside the `(dashboard)` route group) so they render with the sidebar but without the dashboard header. The sidebar already handles auth-gating client-side by redirecting unauthenticated clicks to `/hub/sign-in`.

## Why This Works

In Next.js App Router, navigating to a route with no `page.tsx` triggers the built-in 404 handler (or the nearest `not-found.tsx`). The 404 renders *outside* the route segment's layout because the segment itself doesn't exist — so `src/app/hub/layout.tsx` (which provides the `HubShell` sidebar via its `children`) is never applied.

Adding a `page.tsx` at each route makes it a valid segment under `/hub`. Next.js matches the route, renders the page inside the hub layout, and the sidebar stays visible.

## Prevention

- **Audit nav links against the filesystem** when adding links to shared navigation components like the sidebar. Every `href` in `WORKSPACE_ITEMS` should have a corresponding `page.tsx`.
- **Add a hub-scoped `not-found.tsx`** at `src/app/hub/not-found.tsx` so any future missing route under `/hub` still renders inside the hub layout with the sidebar, preventing navigation dead-ends.
- **Scaffold pages at link creation time** — create at least a placeholder `page.tsx` whenever a new navigation link is added. Code review checklist item: "Does every new nav link have a matching page?"

## Related Issues

- [`docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`](../best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md) — documents the hub's auth-aware routing structure; its route group diagram shows `pipeline/page.tsx` inside `(dashboard)/` but the actual placeholder was placed outside it
- [`docs/solutions/best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md`](../best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md) — established the canonical `/hub` directory structure
