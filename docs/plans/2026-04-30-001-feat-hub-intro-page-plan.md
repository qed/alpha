---
title: "feat: Hub Intro Page with Sidebar Navigation"
type: feat
status: completed
date: 2026-04-30
origin: docs/brainstorms/2026-04-30-hub-intro-page-requirements.md
---

# feat: Hub Intro Page with Sidebar Navigation

## Overview

Replace the current `/hub` marketing page with a two-panel Champions Hub shell: dark sidebar (left) with navigation matching the design handoff, and a welcome/intro content area (right). Remove the auto-redirect for logged-in users so everyone lands on the intro page. Make the Library route accessible without authentication. Add mobile-responsive hamburger navigation.

## Problem Frame

The current `/hub` page is a single-column marketing page that auto-redirects logged-in users to the dashboard. It doesn't give visitors a sense of the Champions Hub as a product. Parents who are already sold on Alpha need to land on a page that immediately shows what the Hub offers and lets them explore — including browsing the Library without an account. (see origin: `docs/brainstorms/2026-04-30-hub-intro-page-requirements.md`)

## Requirements Trace

- R1. Two-panel layout: dark sidebar (left) + welcome content (right)
- R2. Sidebar: Alpha wordmark + "Champions Hub" branding, "Intro" link above "Workspace" section, then Dashboard, Pipeline, Library, Events, My Page, followed by "My Geography" section
- R3. Mobile: hamburger menu with slide-out sidebar, full-screen welcome content by default
- R4. Alpha Toronto callout in sidebar footer and welcome content bottom
- R5. Hero: single-line heading + tagline at reduced font sizes, value proposition merged into hero
- R6. Tool preview cards inside/below hero for scroll-free desktop view
- R7. Final CTA sentence: max 10 words
- R8. Remove "Leader Framing" section
- R9. Sidebar nav items (except Library and Intro) redirect to sign-in if not logged in
- R10. Library accessible without login, visually indicated in sidebar
- R11. Logged-in users see intro page at `/hub` (intentional reversal of auto-redirect)
- R12. Library open for reference materials; login only for tracking features

## Scope Boundaries

- Does not build the Library page itself — only creates a placeholder route outside the auth-gated route group
- No changes to the dashboard layout, pipeline, or other authenticated page internals
- No schema migrations or backend changes
- Co-pilot, heat scores, and Phase 2+ design handoff features are not in scope
- The sidebar appears only on the `/hub` intro page for now — authenticated pages retain their existing horizontal header nav until a future effort adopts the sidebar across all hub routes

## Context & Research

### Relevant Code and Patterns

- `src/app/hub/page.tsx` — current hub landing page (to be rewritten)
- `src/app/hub/(dashboard)/layout.tsx` — auth-gated dashboard shell with horizontal header nav; redirects to `/hub/sign-in` if no `userId`
- `src/app/hub/(auth)/sign-in/[[...sign-in]]/page.tsx` — Clerk sign-in page
- `src/lib/auth.ts` — `requireAuth()`, `requireAuthenticated()`, `requireAdmin()` helpers
- `src/middleware.ts` — passthrough `clerkMiddleware()`, establishes auth context only, does NOT protect routes
- `src/app/globals.css` — all design tokens (`@theme inline`), font variables, color palette
- `src/app/layout.tsx` — root layout with `ClerkProvider` and font loading
- `artifacts/design_handoff_champions_hub/prototype/shell.jsx` — sidebar structure reference
- `artifacts/design_handoff_champions_hub/prototype/champion.css` — sidebar CSS to translate to Tailwind
- `public/assets/logo-white.svg` — Alpha white wordmark (already in public)

### Institutional Learnings

- **Auth redirect loops** (`docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md`): Auth guards should only validate what their name implies. Always trace the full redirect chain for every user state (unauthenticated, authenticated-no-geography, champion, admin) to prevent loops.
- **Double `auth()` calls** (`docs/solutions/performance-issues/double-auth-call-hub-page-routing-2026-04-30.md`): Call `auth()` once in the layout or page; don't call it again in children. Use `auth()` for branching, `requireAuthenticated()` only when the full `SessionInfo` is needed.
- **Clerk v7 requires middleware** (`docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md`): Do NOT remove or modify `src/middleware.ts`. Clerk v7 `auth()` depends on the middleware to attach session headers. All route protection stays in page/layout server components.
- **Auth enforcement in one canonical layer** (`docs/solutions/integration-issues/clerk-v7-vercel-edge-middleware-and-basepath-2026-04-29.md`): Enforce auth in page/layout guards, not middleware. The middleware's role is solely to establish auth context.

## Key Technical Decisions

- **Sidebar as a client component with server-passed auth props**: The sidebar needs client-side interactivity (mobile toggle, nav click handling). The page calls `auth()` once and passes `isAuthenticated` and `userRole` as props to the sidebar. This avoids double `auth()` calls and follows the documented pattern.
- **No `hub/layout.tsx`**: Creating a layout at the hub level would wrap the sign-in page in the sidebar shell, which is wrong. Instead, the sidebar + shell layout is composed directly in `hub/page.tsx`. The `(dashboard)` layout remains untouched.
- **"Intro" is a deliberate addition to the sidebar**: The design handoff sidebar has no "Intro" item — it was designed for the authenticated dashboard. Adding "Intro" above "Workspace" extends the sidebar for the public-facing intro page. This is acknowledged as a deviation from the design handoff.
- **Admin behavior**: Admins also see the intro page (per user decision: "everyone starts on the intro page"). The admin redirect to `/hub/leaderboard` is removed alongside the champion redirect. Admins navigate to their admin pages via the dashboard, which retains its admin-specific header nav.
- **`isAuthenticated` prop is a UI hint, not a security boundary**: The sidebar uses `isAuthenticated` to decide whether to show lock icons and handle click behavior. Actual auth enforcement happens server-side in `(dashboard)/layout.tsx`. This is correct and intentional — the prop controls visual affordances only.
- **Nav items for unbuilt pages**: Events and My Page link to their expected routes (`/hub/events`, `/hub/my-page`). For unauthenticated users, clicking these triggers sign-in. For authenticated users, these will 404 until the pages are built. This is acceptable for an intro page that previews the full product.
- **Library lock/open visual indicator**: Library nav item shows no lock icon. All other gated items (Dashboard, Pipeline, Events, My Page) show a small lock icon. This makes the distinction clear without adding a separate badge.
- **Post-sign-in redirect with hardcoded return paths**: Each gated sidebar item hardcodes its return path in the sign-in URL (e.g., `/hub/sign-in#/dashboard`). No `redirect_url` query param is passed — this eliminates open redirect risk. After sign-in, users land on the page they originally clicked. When no specific destination is set, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` defaults to `/hub`.
- **Mobile hamburger behavior**: Hamburger icon in top-left corner of the content area. Tapping opens a full-screen overlay drawer (dark backdrop + sidebar). Tapping backdrop or any nav item closes the drawer.
- **Heading copy**: The current heading "Welcome to the Alpha Parents Hub" is too long for single-line at 375px. Shorten to something like "Alpha Champions Hub" with a concise tagline. Exact copy finalized during implementation with viewport testing.

## Open Questions

### Resolved During Planning

- **Sidebar route structure**: No new layout file. Sidebar component composed in `hub/page.tsx` directly. `(dashboard)` layout untouched. (Addresses origin doc Q1)
- **Clerk middleware config**: No middleware changes needed. Auth gating is at the `(dashboard)/layout.tsx` level, not middleware. The intro page simply stops calling `redirect()` for logged-in users. (Addresses origin doc Q2)
- **Library route placement**: New placeholder page at `src/app/hub/library/page.tsx` — outside the `(dashboard)` route group, so the `(dashboard)/layout.tsx` auth redirect does not apply. (Addresses origin doc Q2)
- **Lock/open visual indicator**: Lock icon on gated items, no icon on Library. Simple, clear, no badge needed. (Addresses origin doc Q4)
- **Two competing nav systems**: The sidebar appears only on the intro page for now. Dashboard pages keep their horizontal header nav. This is a known gap — the sidebar will replace the dashboard header in a future effort when the full Champions Hub shell is built.

### Deferred to Implementation

- **Exact heading and tagline copy**: Needs viewport testing at 375px to confirm single-line fit. Start with short candidates and test.
- **Exact font sizes for mobile single-line**: Dependent on final copy length. Test with actual content.
- **Hamburger animation details**: Standard slide-in-from-left with backdrop. Fine-tune timing and easing during implementation.

## Implementation Units

- [x] **Unit 1: Hub Sidebar Component**

**Goal:** Create the Champions Hub sidebar component matching the design handoff shell, with auth-aware navigation and the Alpha Toronto callout.

**Requirements:** R2, R4, R9, R10

**Dependencies:** None

**Files:**
- Create: `src/components/hub/hub-sidebar.tsx`
- Test: `src/components/hub/__tests__/hub-sidebar.test.tsx`

**Approach:**
- Client component (`"use client"`) — needs onClick handlers for mobile toggle and auth-gated nav clicks
- Props: `isAuthenticated: boolean`, `userRole?: string`, `isOpen: boolean`, `onClose: () => void`
- Structure: wordmark/branding header → "Intro" link → "Workspace" section header → nav items (Dashboard, Pipeline, Library, Events, My Page) → "My Geography" section → Toronto callout footer → user profile section (if authenticated)
- Nav items use `<Link>` for Library and Intro (no auth gate). Gated items use an `onClick` handler that checks `isAuthenticated` and either navigates or redirects to `/hub/sign-in#/{destination}` (hardcoded return path per item, no query param — eliminates open redirect risk)
- All gated sidebar items include `aria-label` with sign-in context for screen readers (e.g., `aria-label="Dashboard (sign in required)"`) when `isAuthenticated=false`
- Lock icon (small, 12px, `opacity-50`) on gated items. No icon on Library
- Translate design handoff CSS to Tailwind utilities: `bg-ink` background, `w-60` (240px), sticky sidebar, font-display for section headers, `text-[13px]` for nav items, `border-l-2 border-alpha-blue bg-alpha-blue/[0.18]` for active state
- Alpha Toronto callout as a footer section with `margin-top: auto`, border-top divider, link to `alphatoronto.org`
- White logo from `public/assets/logo-white.svg`

**Patterns to follow:**
- Design handoff: `artifacts/design_handoff_champions_hub/prototype/shell.jsx` (structure), `champion.css` lines 19-117 (styles)
- Font usage: `font-[family-name:var(--font-display)]` pattern from existing components

**Test scenarios:**
- Happy path: Renders all nav items (Intro, Dashboard, Pipeline, Library, Events, My Page) with correct labels and icons
- Happy path: Renders Alpha wordmark + "Champions Hub" branding at top
- Happy path: Renders Alpha Toronto callout in footer with link to alphatoronto.org
- Happy path: "Intro" link has active styling when on intro page
- Edge case: When `isAuthenticated=false`, gated items show lock icon, Library shows no lock icon
- Edge case: When `isAuthenticated=true`, no lock icons shown on any item
- Integration: Clicking a gated item when `isAuthenticated=false` calls redirect with correct sign-in URL using hardcoded return path (no query param)
- Accessibility: Gated items have `aria-label` including "(sign in required)" when `isAuthenticated=false`
- Integration: Clicking Library when `isAuthenticated=false` navigates to `/hub/library` without sign-in redirect
- Integration: Clicking Intro navigates to `/hub` regardless of auth state

**Verification:**
- Sidebar renders in the browser matching the design handoff visually
- Nav items respond correctly to auth state

---

- [x] **Unit 2: Hub Intro Page Rewrite**

**Goal:** Replace the current `/hub` page with the two-panel shell (sidebar + welcome content). Remove auto-redirect for logged-in users. Build the welcome content: tighter hero with merged value prop, tool preview cards, and short CTA.

**Requirements:** R1, R5, R6, R7, R8, R11, R4

**Dependencies:** Unit 1

**Files:**
- Modify: `src/app/hub/page.tsx`
- Modify: `src/__tests__/hub-page.test.tsx`

**Approach:**
- Keep as async server component — call `auth()` once at the top for `userId` and `sessionClaims`
- Remove the `if (userId) { redirect(...) }` block entirely (addresses R11, intentional reversal)
- Remove the `<PublicNavbar>` import and usage — replaced by the sidebar. Do NOT delete the `PublicNavbar` component itself; it is still used by `src/app/page.tsx`
- Update `src/__tests__/hub-page.test.tsx`: replace the three authenticated-user redirect tests (admin→leaderboard, champion→dashboard, no-role→dashboard) with tests asserting the intro page renders for all auth states. Replace the PublicNavbar rendering test with a HubSidebar rendering assertion
- Layout: CSS Grid `grid-cols-[240px_1fr]` on desktop, `grid-cols-1` on mobile
- Left panel: `<HubSidebar>` with auth props passed from the server component
- Right panel: welcome content area with:
  - Hero section: reduced-size heading + tagline on single lines, value proposition merged in (R5, R8)
  - Tool preview cards inside the hero visual area (R6): FAQ Library, Parent Testimonials, Talking Points — same content as current cards but placed within/directly below the hero. All three cards are clickable and link to `/hub/library` (accessible without login)
  - CTA: max 10 words (R7). For unauthenticated users: links to `/hub/sign-in`. For authenticated users: button text changes to "Go to Dashboard" and links to `/hub/dashboard`
  - Alpha Toronto callout at the bottom of the welcome content (R4)
- Background: keep the current hero background image + gradient overlay, but reduce the section height to accommodate merged content
- Heading copy: start with something short like "Alpha Champions Hub" and test at 375px. Tagline: one concise line about empowering champions

**Patterns to follow:**
- Current `src/app/hub/page.tsx` — reuse the hero background image approach, font patterns, card structure
- Tailwind token usage from `src/app/globals.css`

**Test scenarios:**
- Happy path: Unauthenticated user sees two-panel layout with sidebar and welcome content
- Happy path: Logged-in champion user sees the same intro page (no redirect to dashboard)
- Happy path: Logged-in admin user sees the same intro page (no redirect to leaderboard)
- Happy path: Hero displays heading and tagline on single lines on desktop viewport
- Happy path: Tool preview cards (FAQ Library, Parent Testimonials, Talking Points) visible without scrolling on desktop
- Happy path: CTA sentence is 10 words or fewer
- Happy path: Tool preview cards are clickable and link to `/hub/library`
- Happy path: Unauthenticated CTA links to `/hub/sign-in` with "Enter the Hub" text
- Happy path: Authenticated CTA links to `/hub/dashboard` with "Go to Dashboard" text
- Happy path: Alpha Toronto callout visible at bottom of welcome content with link
- Edge case: User with no geography_id sees the intro page without errors or redirect loop
- Edge case: Hero heading and tagline fit on single lines at 375px width (verify during implementation)

**Verification:**
- Visiting `/hub` while logged out shows the intro page with sidebar and welcome content
- Visiting `/hub` while logged in as champion shows the same intro page (no redirect)
- Visiting `/hub` while logged in as admin shows the same intro page (no redirect)
- "Leader Framing" section is removed
- Value proposition content is merged into the hero section

---

- [x] **Unit 3: Mobile Responsive Sidebar**

**Goal:** Make the sidebar responsive with a hamburger menu on mobile. Sidebar hidden by default on mobile, slides out as an overlay drawer.

**Requirements:** R3

**Dependencies:** Unit 1, Unit 2

**Files:**
- Modify: `src/components/hub/hub-sidebar.tsx`
- Modify: `src/app/hub/page.tsx`

**Approach:**
- Breakpoint: sidebar visible at `lg` (1024px+), hidden below that
- Mobile: add a hamburger button (3-line icon) in the top-left of the content area, visible only below `lg`
- Clicking hamburger sets `isOpen=true` on the sidebar component
- Sidebar renders as a fixed overlay: `fixed inset-0 z-50` with a dark backdrop (`bg-black/50`) and the sidebar sliding in from the left
- Tapping the backdrop closes the sidebar
- Pressing Escape closes the sidebar
- Tapping any nav item closes the sidebar (call `onClose` in nav click handlers)
- Focus trap: when the drawer is open, keyboard focus is trapped inside the sidebar. Restore focus to the hamburger button on close
- Content area: `lg:ml-60` (offset for sidebar width) on desktop, full-width on mobile
- Use React `useState` for open/close state — managed in a client wrapper component (e.g., `HubShell`) that receives auth props from the server page and renders both the sidebar and content area. The server page (`hub/page.tsx`) remains a server component and does not use hooks
- Transition: `transition-transform duration-200` on the sidebar, `translate-x-0` when open, `-translate-x-full` when closed

**Patterns to follow:**
- Standard mobile drawer pattern: fixed overlay + backdrop + slide animation
- Tailwind responsive prefixes (`lg:block`, `lg:hidden`)

**Test scenarios:**
- Happy path: Sidebar visible as permanent fixture at 1024px+ viewport
- Happy path: Sidebar hidden at <1024px, hamburger button visible
- Happy path: Clicking hamburger opens sidebar as overlay with dark backdrop
- Happy path: Clicking backdrop closes sidebar
- Happy path: Clicking a nav item closes sidebar
- Edge case: Sidebar transition animates smoothly (no layout shift)
- Edge case: Content behind backdrop is not interactive while sidebar is open
- Accessibility: Pressing Escape closes the sidebar
- Accessibility: Focus is trapped inside the sidebar when open; restored to hamburger button on close

**Verification:**
- At desktop width: sidebar always visible, no hamburger
- At mobile width: hamburger visible, sidebar hidden, tapping hamburger opens overlay
- All nav items remain functional in both states

---

- [x] **Unit 4: Library Placeholder Page**

**Goal:** Create a minimal Library placeholder page outside the `(dashboard)` route group so it is accessible without authentication.

**Requirements:** R10, R12

**Dependencies:** Unit 1 (sidebar links to this route)

**Files:**
- Create: `src/app/hub/library/page.tsx`

**Approach:**
- Place at `src/app/hub/library/page.tsx` — outside the `(dashboard)` route group, so the auth redirect in `(dashboard)/layout.tsx` does not apply
- Server component — call `auth()` to check if user is signed in (for conditional UI) but do NOT redirect if unauthenticated
- Content: centered "Library — Coming Soon" placeholder with a brief message explaining that reference materials are being added, and a link back to `/hub`. Style to match the Hub visual language (design tokens, font-display headings)
- Use the same design tokens and styling patterns as other hub pages
- No sidebar shell on this page (sidebar is only on the intro page in this scope)

**Patterns to follow:**
- Existing page patterns in `src/app/hub/` — server component, Tailwind styling

**Test scenarios:**
- Happy path: Unauthenticated user can access `/hub/library` without being redirected to sign-in
- Happy path: Authenticated user can access `/hub/library` and sees the same placeholder
- Happy path: Page displays a "coming soon" message and a link back to `/hub`
- Integration: Clicking "Library" in the sidebar (from Unit 1) navigates to `/hub/library` without auth redirect

**Verification:**
- Opening `/hub/library` in an incognito browser shows the placeholder content, no sign-in redirect
- Opening `/hub/library` while logged in also shows the placeholder content

## System-Wide Impact

- **Interaction graph:** The intro page calls `auth()` from Clerk (same as the current page). No new server actions, database queries, or external API calls are introduced. The sidebar is a pure UI component with no backend interactions.
- **Error propagation:** If `auth()` fails (Clerk outage), the page should still render the unauthenticated state rather than crashing. The current `auth()` call in `hub/page.tsx` already handles this — it returns `{ userId: null }` when unauthenticated rather than throwing.
- **State lifecycle risks:** Mobile sidebar open/close state is ephemeral React state — no persistence concerns. No cache, database, or session state is modified.
- **API surface parity:** No new API routes or endpoints. Sidebar nav items link to existing routes.
- **Unchanged invariants:** The `(dashboard)/layout.tsx` auth gate remains untouched — all pages inside `(dashboard)` still require authentication. The `requireAuthenticated()` and `requireAdmin()` per-page checks remain. Middleware remains untouched. The sign-in flow is unchanged except that post-sign-in now lands on the intro page instead of auto-redirecting to dashboard.
- **Redirect chain verification (critical — per learnings):**
  - Unauthenticated → `/hub` → renders intro page ✓
  - Unauthenticated → `/hub/library` → renders library placeholder ✓
  - Unauthenticated → `/hub/dashboard` → `(dashboard)/layout.tsx` redirects to `/hub/sign-in` ✓
  - Authenticated champion → `/hub` → renders intro page (no redirect) ✓
  - Authenticated admin → `/hub` → renders intro page (no redirect) ✓
  - Authenticated no-geography → `/hub` → renders intro page ✓ (no geography check on intro page)
  - Authenticated no-geography → `/hub/dashboard` → handled by existing "Almost there!" pending state ✓
  - Post sign-in → Clerk redirects to `/hub` → renders intro page ✓
  - No loops detected ✓

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Heading/tagline too long for 375px single line | Start with short copy candidates; test during implementation; relax to "wraps gracefully" if needed |
| Post-sign-in UX: user signs in expecting dashboard, sees intro page | Hardcoded return paths in sidebar sign-in links route user to the page they clicked. CTA for authenticated users shows "Go to Dashboard" |
| Nav items to unbuilt pages (Events, My Page) 404 for authenticated users | Acceptable for intro page preview; these pages will be built in future phases |
| Two navigation paradigms (sidebar on intro, header on dashboard) | Known gap; sidebar will replace dashboard header in a future effort |
| Library placeholder is sparse | Intentional — Library content page is Phase 3 scope |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-30-hub-intro-page-requirements.md](docs/brainstorms/2026-04-30-hub-intro-page-requirements.md)
- Design handoff: `artifacts/design_handoff_champions_hub/README.md`, `prototype/shell.jsx`, `prototype/champion.css`
- Auth redirect loop fix: `docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md`
- Double auth() call optimization: `docs/solutions/performance-issues/double-auth-call-hub-page-routing-2026-04-30.md`
- Clerk v7 middleware requirement: `docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md`
