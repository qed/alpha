---
date: 2026-04-29
topic: root-migration-hub-rename
---

# Root Migration and Hub Rename

## Problem Frame

The Alpha School repo currently hosts two things: a static marketing site (a landing page at `/` and parent stories at `/v1/`) and a Next.js enrollment app (internally called "CRM," deployed from the `crm/` subdirectory at `/crm`). Three things need to change:

1. The static marketing pages must be converted into Next.js pages so the entire site is one unified Next.js app, deployable from the repo root.
2. The enrollment app moves from `/crm` to `/hub`, matching its actual product name ("Alpha Hub").
3. The whole repo deploys to Vercel as a single Next.js project, replacing GitHub Pages.

## Requirements

**Page Conversion**

- R1. The landing page (currently `index.html` — "A letter to Toronto parents") is converted to a Next.js page served at `/`. Content, copy, and visual design are preserved.
- R2. The parent stories page (currently `v1/index.html` — interactive React app with 12 family stories, filtering, modals, and FAQ) is converted to a Next.js page served at `/v1`. All interactive behavior is preserved: story filtering by status/grade, card layouts, story modal, FAQ accordion.
- R3. Assets (images, fonts) used by the landing page and stories page are migrated to work within the Next.js project.

**Hub URL Migration**

- R4. The Next.js enrollment app is served under the `/hub` path prefix. All app routes (sign-in, dashboard, prospects, intake forms, API endpoints) live under `/hub/...`.
- R5. "CRM" references in code are renamed to "Hub" (package name, UI copy, placeholder text).

**Repo Restructuring**

- R6. Next.js project files (package.json, next.config.ts, tsconfig.json, src/, etc.) live at the repo root, not in a `crm/` subdirectory.
- R7. The old `crm/` directory is removed after migration. No duplicate source files remain.
- R8. Old static site files (raw HTML, standalone CSS/JS) are removed once their content has been converted to Next.js pages.

**Deployment**

- R9. The entire repo deploys to Vercel as a single Next.js project.
- R10. The GitHub Pages workflow (`.github/workflows/pages.yml`) is removed, since Vercel replaces it.

## Success Criteria

- Visiting `/` shows the landing page letter with the same content and visual design as the current `index.html`.
- Visiting `/v1` shows the parent stories page with working story cards, filtering, modals, and FAQ.
- Visiting `/hub` enters the Alpha Hub enrollment app.
- All existing app routes work under `/hub/...` (sign-in, dashboard, geography intake forms, API webhooks).
- The site deploys successfully on Vercel.

## Scope Boundaries

- **In scope**: Converting static pages to Next.js, repo restructuring from `crm/` to root, `/crm` → `/hub` URL migration, CRM → Hub naming, Vercel deployment, GitHub Pages removal.
- **Out of scope**: New features or functional changes to any of the three pages. Domain/DNS configuration. `/crm` → `/hub` redirect for old bookmarks (app hasn't launched publicly yet).

## Key Decisions

- **One Next.js app for everything**: The landing page, stories page, and enrollment hub are all routes in a single Next.js application. No static file serving, no multi-project setup.
- **No basePath**: The enrollment app routes are reorganized to live under `/hub` via the Next.js route tree (e.g., `src/app/hub/`), not via `basePath` config. Previous `basePath` attempts caused Vercel routing 404s.
- **Preserve content, not markup**: The converted pages should look and behave the same, but the underlying code will be idiomatic Next.js (React components, App Router, `next/image`, etc.) rather than raw HTML or CDN React.

## Dependencies / Assumptions

- The v1 stories page is already built as React components (`components.jsx`) with data in `stories.js`. These can be adapted to Next.js rather than rewritten from scratch.
- The landing page is ~100 lines of static HTML — straightforward conversion.
- Clerk, Supabase, and other service credentials will be configured as Vercel environment variables. The `.env.local.example` documents all required variables.

## Outstanding Questions

### Resolve Before Planning

_(None — all product decisions resolved.)_

### Deferred to Planning

- [Affects R4][Technical] Strategy for nesting enrollment app routes under `/hub`: reorganize `src/app/` to place all app routes in `src/app/hub/`, or use Next.js rewrites. The previous `basePath` approach caused 404s and should be avoided.
- [Affects R4][Technical] All internal navigation paths (redirects, Link hrefs, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`) must be updated to include the `/hub` prefix. Approximately 28 occurrences across 13 source files.
- [Affects R4][Technical] Determine whether API routes (especially `api/webhooks/clerk`) move under `/hub` or remain at the root level. If moved, the Clerk webhook endpoint URL must be reconfigured in the Clerk dashboard.
- [Affects R1, R2, R4][Technical] Root layout strategy: the current root layout carries enrollment-app-specific metadata (`title: "Alpha School Enrollment"`) and Clerk providers. The unified app needs a root layout that serves both marketing pages and the enrollment hub without loading unnecessary resources on marketing pages.
- [Affects R1, R2][Technical] CSS strategy for converted pages: port the existing design-system CSS (colors-and-type.css, kit.css, landing.css, page.css) to Tailwind (matching the enrollment app), or keep as CSS modules for faster conversion with less risk of visual drift.
- [Affects R2][Technical] The v1 stories page uses React 18 UMD via CDN with Babel standalone for in-browser transpilation, global React object destructuring, and ~1,600 lines of CSS/JSX. Conversion to idiomatic Next.js (module imports, `"use client"`, React 19) is closer to a rewrite than an adaptation. Scope and effort should be estimated accordingly.
- [Affects R2][Technical] Stories data location: keep as a static JS/TS file, or move to a data source. The 12 stories are static content with no CRUD needs.
- [Affects R1, R2][Technical] The dynamic `[geography]` route at `src/app/(public)/[geography]/page.tsx` catches any single-segment path. Verify that static routes like `/v1` take precedence and do not fall through to the geography lookup.
- [Affects R9][Technical] Vercel project configuration — framework detection, build settings, environment variables.

## Next Steps

-> `/ce:plan` for structured implementation planning
