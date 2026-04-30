---
date: 2026-04-30
topic: hub-intro-page
---

# Hub Intro Page

## Problem Frame

The current `/hub` page is a single-column marketing page that redirects logged-in users straight to the dashboard. It doesn't show the Champions Hub shell or give visitors a sense of the tool they're about to use. Parents who are already sold on Alpha and want to champion it in their community need to land on a page that immediately shows what the Hub offers and lets them explore — including accessing the Library without an account.

## Requirements

**Layout and Navigation**

- R1. Replace the current `/hub` page with a two-panel layout: dark sidebar (left) matching the design handoff shell, and welcome content (right).
- R2. The sidebar must match the design: Alpha wordmark + "Champions Hub" branding at top, "Intro" link (active by default) above a "Workspace" section header, then Dashboard, Pipeline, Library, Events, My Page nav items, followed by a "My Geography" section.
- R3. On mobile, show a hamburger menu that slides out the sidebar. The welcome content fills the full screen by default.
- R4. The sidebar footer and the bottom of the welcome content both include an Alpha Toronto callout: "Built by Alpha Toronto. Know someone in Toronto? Send them to alphatoronto.org" with a link.

**Welcome Content (Right Panel)**

- R5. Hero section: single-line heading and single-line tagline at reduced font sizes so both fit on one line on desktop. Merge the current "Value Proposition" section into the hero so visitors immediately see why they're here and what they get.
- R6. The "What you'll get" tool preview cards (FAQ Library, Parent Testimonials, Talking Points) remain, placed inside or directly below the hero section so the hero tells the full story in one scroll-free view on desktop.
- R7. The final CTA sentence must be no more than 10 words. Example: "Ready? Start championing Alpha in your community."
- R8. Remove the "Leader Framing" section (current "Become a champion for your community") — its messaging is folded into the tighter hero.

**Auth Gating**

- R9. Clicking any sidebar nav item except Library and Intro redirects to sign-in/sign-up if the user is not logged in. Clicking Intro while logged out (re)loads `/hub` without triggering a sign-in redirect.
- R10. Library is accessible without logging in. The sidebar must visually indicate this (e.g., a subtle "Open" badge or no lock icon while others show one).
- R11. Logged-in users still see the intro page at `/hub` by default (remove the current auto-redirect to dashboard). They can navigate freely via the sidebar.

**Library Access Rationale**

- R12. The Library exists to make it easy for champions to grow their geography. Parents who only want reference materials for promoting Alpha School should not need an account. Login is required only for features that track people in a champion's network (Pipeline, Dashboard, etc.).

## Success Criteria

- A visitor landing on `/hub` sees the sidebar + welcome content and understands what the Hub offers within 5 seconds.
- The heading and tagline each fit on a single line on a 375px-wide mobile screen.
- A visitor can navigate to `/hub/library` and browse content without logging in.
- Clicking Dashboard, Pipeline, Events, or My Page while logged out redirects to sign-in.
- The Alpha Toronto callout is visible in both the sidebar footer and the welcome content.
- The page is fully usable on mobile (375px+) with hamburger nav.

## Scope Boundaries

- This does not build the Library page itself — only makes it accessible without auth. The Library page is a separate effort (Phase 3 of the design handoff).
- No changes to the dashboard, pipeline, or any other authenticated pages.
- No schema migrations or backend changes.
- The Co-pilot, heat scores, and other Phase 2+ features from the design handoff are not in scope.
- No changes to admin routes or admin experience.

## Key Decisions

- **Sidebar on left, content on right**: Matches the design handoff shell exactly. The sidebar is the persistent navigation frame for the entire Champions Hub.
- **Intro page replaces auto-redirect** (intentional reversal of 2026-04-29 decision): Logged-in users see the intro page at `/hub` and navigate via sidebar, rather than being immediately redirected. The Hub should feel like a product with a home, not just a redirect. All users — including returning champions — start here.
- **Library open to all**: Reduces friction for champions who just need reference materials. Auth gates only features that require tracking state (pipeline, dashboard).
- **10-word CTA**: Keeps the final call to action punchy and action-oriented.
- **Alpha Toronto callout in two places**: Sidebar footer for persistent visibility, welcome content for first-visit impact.

## Dependencies / Assumptions

- The design handoff prototype (`artifacts/design_handoff_champions_hub/prototype/shell.jsx` and `champion.css`) is the visual reference for the sidebar.
- The Library page (`/hub/library`) does not exist yet. The auth gate change means the route must live outside the `(dashboard)` route group (which redirects unauthenticated users to sign-in), but the page itself will be built separately.
- Clerk middleware (`src/middleware.ts`) runs on all routes but does not block unauthenticated access — it only attaches session data. Auth gating is enforced at the layout level: `src/app/hub/(dashboard)/layout.tsx` redirects to `/hub/sign-in` if no `userId`. The intro page and library route need to live outside the `(dashboard)` route group, or the layout needs conditional auth logic.

## Outstanding Questions

### Deferred to Planning
- [Affects R2][Technical] How should the sidebar nav items be structured in the Next.js route layout? Shared layout component vs. page-level inclusion.
- [Affects R9][Technical] What is the current Clerk middleware configuration for `/hub/*` routes, and what's the minimal change to allow unauthenticated access to `/hub` and `/hub/library`?
- [Affects R5][Needs research] What are the right font sizes for the heading and tagline to fit on one line at 375px? Needs testing with actual content.
- [Affects R10][Technical] Best approach for the "Library is open" visual indicator in the sidebar — icon badge, text label, or styling difference?

## Next Steps

-> `/ce:plan` for structured implementation planning
