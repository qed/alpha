---
title: "feat: Add full Alpha website template to Library"
type: feat
status: active
date: 2026-05-01
origin: docs/brainstorms/2026-05-01-library-alpha-website-template-requirements.md
---

# feat: Add full Alpha website template to Library

## Overview

Add a 4th Library accordion item labeled "A full Alpha website" that links to a standalone page opening in a new browser tab. The standalone page renders a complete, genericized replica of the Alpha South Bay LA website (alphasouthbayla.org as of 2026-05-01) — with all geography references replaced, the form replaced by a static screenshot, events replaced by static text, videos embedded via YouTube, and the interest chart rendered via Recharts.

## Problem Frame

Champions need to show prospective families what a local Alpha school website looks like. The only current reference is the live South Bay LA site, which is geography-specific and externally hosted. A genericized template inside the Hub gives champions a self-contained, always-available example. (see origin: `docs/brainstorms/2026-05-01-library-alpha-website-template-requirements.md`)

## Requirements Trace

- R1. 4th Library accordion section labeled "A full Alpha website"
- R2. Accordion item links to standalone page, opens in new tab
- R3. Standalone page renders complete replica of reference site
- R4–R11. All geography-specific references genericized (R4 is operative rule; R5–R11 are examples)
- R12–R13. Express Your Interest form replaced by static screenshot (non-interactive)
- R14–R15. Events replaced with styled "View all in Community Portal" text (non-clickable)
- R16. All content sections included and visually match the reference site
- R17. All images downloaded and hosted locally
- R18. Interest by Grade chart rendered via charting library with genericized labels
- R19. See Alpha in Action videos embedded via YouTube iframe
- R20. Interactive elements (accordion schedule, progress indicators) functional

## Scope Boundaries

- Page is a static point-in-time snapshot — staleness is an accepted tradeoff (see origin)
- No backend connections — form is a screenshot, events are static text
- Not editable by champions — read-only reference template
- YouTube embeds are the only acceptable external dependency
- No HubShell wrapper — full-viewport standalone page

## Context & Research

### Relevant Code and Patterns

- **Library accordion**: `src/components/hub/library-accordion.tsx` — SECTIONS array + conditional rendering. New item needs `<a target="_blank">` instead of expandable `<button>`.
- **CSS isolation precedent**: `src/app/v1/page.tsx` + `src/app/v1/v1.css` — class-scoped selectors with prefix (e.g., `v1-`), no bare element selectors, CSS variable aliases referencing global Tailwind v4 theme tokens.
- **Video lightbox**: `src/components/hub/video-lightbox.tsx` — uses `youtube-nocookie.com`, 16:9 aspect ratio via padding technique. R19 wants inline embeds, not lightbox, but the iframe pattern is reusable.
- **YouTube thumbnails**: `src/__tests__/hub-library-page.test.tsx` and the testimonials section — fallback chain (maxresdefault → sddefault → hqdefault) with optional local thumbnail override.
- **Route structure**: Pages at `src/app/hub/library/` are public by default (outside `(dashboard)` route group). Auth enforcement is in `(dashboard)/layout.tsx`, not middleware.
- **HubShell opt-out**: Pages under `/hub/` can skip `HubShell` for full-viewport rendering. The `/v1` page demonstrates this pattern.
- **Static assets**: `public/assets/` for production images, `public/artifacts/` for supplementary files.
- **Root layout**: `src/app/layout.tsx` provides only ClerkProvider, fonts, and globals.css — no chrome.

### Institutional Learnings

- **CSS isolation** (`docs/solutions/best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md`): Never import CSS with bare element selectors. Use class-only selectors with prefixed names.
- **Auth pattern** (`docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`): Call `auth()` once per server component; use route groups for auth gating. This page is public — no `auth()` call needed.
- **YouTube thumbnails** (`docs/solutions/ui-bugs/youtube-thumbnail-placeholder-fallback-2026-05-01.md`): Some videos return grey placeholder for maxresdefault. Use local thumbnail override when needed.
- **Next.js 16 caution** (`AGENTS.md`): Read `node_modules/next/dist/docs/` before writing code. APIs may differ from training data.

## Key Technical Decisions

- **Route at `src/app/hub/library/website-preview/`**: Keeps URL under the Library namespace, is public by default (outside `(dashboard)` group), and follows existing route conventions. No auth required.
- **No HubShell**: The page renders full-viewport. The reference site is a standalone marketing page — wrapping it in the Hub sidebar would compromise the fidelity goal.
- **CSS isolation via class-scoped CSS file**: Follow the `/v1` pattern — create `website-preview.css` with all selectors prefixed (e.g., `wp-`). No bare element selectors. Import in the page component.
- **Recharts for the bar chart**: Lightweight, tree-shakeable, React-native. Since the page opens in a new tab, the bundle is isolated. The chart client component handles SSR guarding internally (renders after mount) since `next/dynamic` with `ssr: false` cannot be used in Server Components in Next.js 16.
- **Component structure**: One page file (`page.tsx`) that imports section components from a local `_components/` directory. Extract only sections with client-side interactivity (chart, videos) into separate client component files. Static sections can be server components or simple functions.
- **Accordion link pattern**: Add a new entry to the SECTIONS config with an `href` discriminator. Render it as `<a target="_blank" rel="noopener noreferrer">` styled to match accordion button appearance, with an external-link icon instead of a chevron.

## Open Questions

### Resolved During Planning

- **Route placement**: `src/app/hub/library/website-preview/page.tsx` — public, under Library namespace, no auth needed.
- **CSS isolation**: Class-scoped CSS file with `wp-` prefix, following the `/v1` precedent.
- **Charting library**: Recharts — tree-shakeable, React-native, dynamically imported.
- **Content inventory**: Reference site has ~15 sections, minimal imagery (emoji icons for feature cards, chart, video thumbnails). Moderate scope — not a heavy asset page.

### Deferred to Implementation

- **Exact Recharts configuration**: Bar chart props, colors, and responsive sizing — determine by matching the reference site's visual appearance during implementation.
- **Which Alpha YouTube videos to embed**: The reference site's "See Alpha in Action" section may use different videos than the existing testimonials. Inspect the live page during implementation.
- **Responsive breakpoints**: The template should be responsive like the reference site, but exact breakpoint behavior will be determined by inspecting and matching the reference site's CSS during implementation.

## Implementation Units

- [ ] **Unit 1: Scaffold standalone page with CSS isolation**

**Goal:** Create the route, CSS file, and basic page shell (navbar + footer + content wrapper) so subsequent units can drop sections into the page.

**Requirements:** R2, R3, R5, R10

**Dependencies:** None

**Files:**
- Create: `src/app/hub/library/website-preview/page.tsx`
- Create: `src/app/hub/library/website-preview/website-preview.css`
- Create: `src/app/hub/library/website-preview/_components/navbar.tsx`
- Create: `src/app/hub/library/website-preview/_components/footer.tsx`

**Approach:**
- Page is a server component, no `auth()` call needed, no HubShell wrapper
- Set page metadata (title: "Alpha Local City")
- The CSS file uses class-only selectors with `wp-` prefix. Define CSS variables scoped to the `.wp-root` wrapper class (not `:root`) — aliasing global Tailwind theme tokens where shared (fonts) and defining template-specific values locally (colors matching the reference site's palette)
- Navbar: "A" logo + "Alpha Local City" text on left, "Join the Discussion" link on right (pointing to community.alpha.school)
- Footer: Alpha symbol, "Alpha Local City", alphalocalcity.org, copyright line
- Content wrapper: single-column centered layout matching reference site's max-width and spacing

**Patterns to follow:**
- `src/app/v1/page.tsx` + `src/app/v1/v1.css` for CSS isolation pattern
- `src/app/hub/library/page.tsx` for public Hub page pattern (no auth needed)

**Test scenarios:**
- Happy path: Page renders at `/hub/library/website-preview` without auth, displays navbar with "Alpha Local City" brand and footer with correct copyright text
- Happy path: Page does not render HubShell sidebar
- Edge case: No geography-specific references ("South Bay", "Los Angeles") appear in navbar or footer

**Verification:**
- Navigating to `/hub/library/website-preview` renders a full-viewport page with navbar and footer
- CSS classes do not leak into other Hub pages

---

- [ ] **Unit 2: Add Library accordion link**

**Goal:** Add a 4th item to the Library accordion that opens the website template page in a new tab instead of expanding inline content.

**Requirements:** R1, R2

**Dependencies:** Unit 1 (page must exist at the target URL)

**Files:**
- Modify: `src/components/hub/library-accordion.tsx`
- Modify: `src/__tests__/hub-library-page.test.tsx`

**Approach:**
- Add a new entry to the SECTIONS array with an `href` field: `{ id: "website", label: "A full Alpha website", href: "/hub/library/website-preview" }`
- Update the `SectionId` type union to include `"website"`
- Ensure `VALID_IDS` only includes expandable section IDs — exclude entries with `href` so hash navigation does not attempt to expand the link item
- In the render loop, check for `href` — if present, render `<a target="_blank" rel="noopener noreferrer">` styled identically to the accordion buttons but with an external-link icon (arrow-up-right) instead of a chevron
- The link should not participate in the accordion toggle logic — clicking it navigates, not expands
- Keep the existing 3 sections' behavior unchanged

**Patterns to follow:**
- Existing accordion button styling in `library-accordion.tsx` (lines 286-294)
- External link icon SVG from the FaqSection's "Browse the FAQ" button (lines 78-89)

**Test scenarios:**
- Happy path: Library page renders 4 accordion items with correct labels including "A full Alpha website"
- Happy path: "A full Alpha website" item renders as a link with `target="_blank"` and `href="/hub/library/website-preview"`
- Happy path: Clicking the website link does not collapse other open accordion sections
- Integration: The 3 existing accordion sections still toggle open/closed as before
- Edge case: Existing tests use `getAllByRole('button')` to count accordion items — update assertions to account for the 4th item being an `<a>` (role `link`), not a `<button>`

**Verification:**
- Library page shows 4 items; first 3 are expandable, 4th is a link opening in a new tab
- All existing accordion tests still pass (after updating expected count and role queries)

---

- [ ] **Unit 3: Download reference site assets and prepare static images**

**Goal:** Capture all images from the reference site and the form screenshot, store them locally.

**Requirements:** R12, R17

**Dependencies:** None (can run in parallel with Unit 1)

**Files:**
- Create: `public/assets/website-preview/` (directory for all template images)
- Create: `public/assets/website-preview/form-screenshot.png` (captured from reference site)
- Create: Various image files downloaded from the reference site

**Approach:**
- Crawl alphasouthbayla.org and download all image assets (logo, any hero images, section backgrounds, icons)
- Capture a screenshot of the Express Your Interest form area and save as `form-screenshot.png`
- Name files descriptively: `alpha-logo.svg`, `form-screenshot.png`, etc.
- Validate all downloaded images render correctly at expected sizes

**Test expectation:** none — asset preparation, no behavioral change

**Verification:**
- All images from the reference site exist locally in `public/assets/website-preview/`
- Form screenshot is clear and correctly captures the form layout

---

- [ ] **Unit 4: Top content sections — Hero through Alpha Model**

**Goal:** Build the top half of the page: Hero, Events, Form Screenshot, Progress Tracker, and Alpha Model sections.

**Requirements:** R3, R4–R11, R12–R15, R16, R20

**Dependencies:** Unit 1 (page shell), Unit 3 (assets)

**Files:**
- Create: `src/app/hub/library/website-preview/_components/hero-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/events-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/form-screenshot-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/progress-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/alpha-model-section.tsx`
- Modify: `src/app/hub/library/website-preview/page.tsx`
- Modify: `src/app/hub/library/website-preview/website-preview.css`

**Approach:**
- **Hero**: Large headline "School that *actually prepares* kids for the future", subheading paragraph, 3 key metrics (2hrs, 2.6×, K–8). Center-aligned.
- **Events**: "Mark Your Calendar" / "Upcoming Events" heading. Under "This Week" — styled text "View all in Community Portal" (non-clickable, matches event card styling). No specific events shown.
- **Form Screenshot**: "Express Your Interest" heading + description text + static `<img>` of the form screenshot. Styled to match surrounding layout.
- **Progress Tracker**: "Where We Are" / "Our Progress" with 4 milestone items (Community Portal open, Accepting Commitments, 50 Commitments, Determining Location). First 3 milestones show blue round checkmarks (completed state); 4th shows an empty circle with a halo effect (current/in-progress state). Match the reference site's visual treatment exactly.
- **Alpha Model**: "The Alpha Model" heading + 4 feature cards (AI-Powered Learning, Entrepreneurship, Wellness, Community). Card grid layout with emoji icons.
- All text genericized per R4 — replace any South Bay/LA references with generic equivalents.

**Patterns to follow:**
- Reference site's section structure and spacing
- `wp-` CSS prefix convention from Unit 1

**Test scenarios:**
- Happy path: Hero section renders with headline, subheading, and 3 key metrics
- Happy path: Events section shows "View all in Community Portal" text, not individual event cards
- Happy path: Form area shows a static image, not an interactive form
- Happy path: Alpha Model renders 4 feature cards with correct headings
- Edge case: No geography-specific text ("South Bay", "Los Angeles", "Manhattan Beach", etc.) appears in any section

**Verification:**
- Top half of the page visually matches the reference site's structure and styling
- Events section shows only the portal text, no specific events
- Form area is a non-interactive image

---

- [ ] **Unit 5: Bottom content sections — Schedule through Service Areas**

**Goal:** Build the bottom half of the page: Daily Schedule, Enrollment Info, Coming Soon, SAT Scores, CTA, and Service Areas sections.

**Requirements:** R3, R4–R11, R16, R20

**Dependencies:** Unit 1 (page shell)

**Files:**
- Create: `src/app/hub/library/website-preview/_components/daily-schedule-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/enrollment-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/coming-soon-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/sat-scores-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/cta-section.tsx`
- Create: `src/app/hub/library/website-preview/_components/service-areas-section.tsx`
- Modify: `src/app/hub/library/website-preview/page.tsx`
- Modify: `src/app/hub/library/website-preview/website-preview.css`

**Approach:**
- **Daily Schedule**: Timeline layout with 4 time blocks (Limitless Launch, Guided Academic Time, Lunch & Wellness, Life Skills & Enrichment). All 4 blocks are static and always expanded — no collapse/expand interaction. This matches the reference site's layout.
- **Enrollment Info**: 4 info cards (Grades Served, School Hours, Tuition, Opening). Genericize tuition text to reference "local families" instead of "South Bay families".
- **Coming Soon**: "Alpha High School" (no "Los Angeles"). Opening Fall 2027. Genericize all LA references per R6.
- **SAT Scores**: Display score data (Overall 1410, by class). "94th Percentile Nationally" stat. Comparison to national avg.
- **CTA**: "Ready to be part of something different?" (no "South Bay" per R8). "Join the Discussion" button linking to community.alpha.school.
- **Service Areas**: "Serving Families in your local cities" heading per R9. Cities: Center City, City East, City West, City North, City South, City Suburbs.

**Patterns to follow:**
- Reference site's section styling and layout
- `wp-` CSS prefix convention

**Test scenarios:**
- Happy path: Daily Schedule renders 4 time blocks with correct times and descriptions
- Happy path: Enrollment Info shows 4 cards with K–8, 8:45 AM – 3:30 PM, tuition note, Fall 2026
- Happy path: Coming Soon reads "Alpha High School" with no "Los Angeles"
- Happy path: Service Areas lists exactly: Center City, City East, City West, City North, City South, City Suburbs
- Happy path: CTA heading contains no "South Bay" text
- Edge case: Enrollment tuition text references "local families", not "South Bay families"

**Verification:**
- Bottom half of page visually matches the reference site's structure
- All geography references are genericized

---

- [ ] **Unit 6: Video section with YouTube embeds**

**Goal:** Build the "See Alpha in Action" section with inline YouTube video embeds.

**Requirements:** R19

**Dependencies:** Unit 1 (page shell)

**Files:**
- Create: `src/app/hub/library/website-preview/_components/video-section.tsx` (client component)
- Modify: `src/app/hub/library/website-preview/page.tsx`
- Modify: `src/app/hub/library/website-preview/website-preview.css`

**Approach:**
- "See Alpha in Action" heading + "Watch what a day at Alpha really looks like" subheading
- Embed Alpha YouTube videos as iframes using `youtube-nocookie.com` for privacy
- Determine which videos the reference site uses by inspecting alphasouthbayla.org during implementation. If the same videos as the testimonials section, reuse the VIDEOS array. If different, create a local array.
- 16:9 aspect ratio via padding technique (matching `video-lightbox.tsx` pattern)
- Videos are inline (not lightbox) — they play in-place when clicked
- Lazy-load iframes to avoid performance impact on page load

**Patterns to follow:**
- `src/components/hub/video-lightbox.tsx` for YouTube iframe pattern (youtube-nocookie.com, aspect ratio)
- YouTube thumbnail fallback from `docs/solutions/ui-bugs/youtube-thumbnail-placeholder-fallback-2026-05-01.md`

**Test scenarios:**
- Happy path: Video section renders with heading and at least one video embed
- Happy path: Video iframes use `youtube-nocookie.com` domain
- Happy path: Videos have 16:9 aspect ratio
- Edge case: Videos load lazily (iframe has `loading="lazy"` attribute)

**Verification:**
- Videos play inline on the page when clicked
- No autoplay — videos start paused

---

- [ ] **Unit 7: Interest by Grade chart with Recharts**

**Goal:** Install Recharts and render the "Indicative Interest by Grade" bar chart with genericized labels.

**Requirements:** R7, R18

**Dependencies:** Unit 1 (page shell)

**Files:**
- Modify: `package.json` (add `recharts` dependency)
- Create: `src/app/hub/library/website-preview/_components/interest-chart.tsx` (client component)
- Modify: `src/app/hub/library/website-preview/page.tsx`
- Modify: `src/app/hub/library/website-preview/website-preview.css`

**Approach:**
- Install `recharts` as a project dependency
- Create a client component that renders a `BarChart` with grade-level data
- Chart title: "Alpha Example City" per R7
- Subtitle/small text: "from local families" per R7
- The chart component is a client component (`"use client"`) that handles SSR guarding internally — render a placeholder on initial mount and the Recharts chart after hydration via `useEffect` + state. Do not use `next/dynamic` with `ssr: false` in the server component page, as this is not supported in Next.js 16 Server Components.
- Match the reference site's bar chart visual style (colors, bar spacing, labels) as closely as practical
- Use representative data values that look realistic for the chart (this is a template, not live data)

**Patterns to follow:**
- Recharts `BarChart` + `Bar` + `XAxis` + `YAxis` component composition
- `useEffect` + state pattern for client-only rendering in a `"use client"` component

**Test scenarios:**
- Happy path: Chart renders with title "Alpha Example City" and subtitle containing "from local families"
- Happy path: Chart displays bars for each grade level (K through 8)
- Edge case: Chart title contains no geography-specific references
- Edge case: Chart renders responsively within its container

**Verification:**
- Chart is visible and visually matches the reference site's chart style
- Labels read "Alpha Example City" and "from local families"

---

- [ ] **Unit 8: Geography audit, integration test, and final polish**

**Goal:** Final sweep for geography references, add an integration test for the standalone page, and verify all success criteria.

**Requirements:** R4 (operative rule), R1–R20 (final verification)

**Dependencies:** Units 1–7

**Files:**
- Create: `src/__tests__/website-preview-page.test.tsx`
- Modify: `src/app/hub/library/website-preview/page.tsx` (if audit finds remaining references)
- Modify: Any section component files with remaining geography references

**Approach:**
- Text search the entire `src/app/hub/library/website-preview/` directory for: "South Bay", "Los Angeles", "LA", "Manhattan Beach", "Hermosa Beach", "Redondo Beach", "Torrance", "El Segundo", "Hawthorne", "Lawndale", "Gardena", "Carson", "Palos Verdes", "Rolling Hills", "Lomita", and any other geography-specific terms from the reference site
- Fix any remaining references found
- Write an integration test for the standalone page following the hub-page test pattern

**Patterns to follow:**
- `src/__tests__/hub-page.test.tsx` for page-level test structure
- `src/__tests__/hub-library-page.test.tsx` for component test patterns

**Test scenarios:**
- Happy path: Page renders without errors at the expected route
- Happy path: Navbar shows "Alpha Local City" brand
- Happy path: Footer shows "Alpha Local City", alphalocalcity.org, correct copyright
- Happy path: Service Areas lists the 6 generic city names
- Integration: Library accordion's 4th item links to `/hub/library/website-preview` with `target="_blank"`
- Edge case: Full-text search of rendered page content for "South Bay" returns zero matches
- Edge case: Full-text search of rendered page content for "Los Angeles" returns zero matches

**Verification:**
- All tests pass
- Manual review confirms no geography-specific references remain
- Page looks professional and representative of a local Alpha website
- All success criteria from the origin document are met

## System-Wide Impact

- **Interaction graph:** The Library accordion gains a new link item that navigates instead of toggling. No callbacks, middleware, or observers affected. The standalone page has no API calls or server actions.
- **Error propagation:** N/A — the page is entirely static with no backend connections. YouTube embed failures degrade gracefully (iframe shows YouTube's own error state).
- **State lifecycle risks:** None — no persistent state, no forms, no data writes.
- **API surface parity:** N/A — no APIs involved.
- **Integration coverage:** The accordion-to-page link is the only cross-component integration point. Test that the link href matches the page route.
- **Unchanged invariants:** The existing 3 Library accordion sections (FAQ, Testimonials, Talking Points) are unchanged in behavior. The Hub sidebar, auth flow, and dashboard pages are not affected. The Library page's public access status is preserved.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Recharts adds to project bundle size | Page opens in new tab — bundle is isolated. Chart component handles SSR guarding internally. |
| Reference site changes after snapshot date | Accepted tradeoff per origin doc. Template can be updated manually if changes are material. |
| CSS from template leaks into Hub pages | Class-scoped CSS with `wp-` prefix, following established `/v1` pattern. No bare element selectors. |
| YouTube videos become unavailable | Graceful degradation — YouTube's own error UI shows in iframe. No app-level handling needed. |
| Next.js 16 API differences from training data | Consult `node_modules/next/dist/docs/` before writing any code per AGENTS.md. |
| Large component surface (15 sections) | Split into focused section components under `_components/`. Each section is a simple, isolated component. |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-01-library-alpha-website-template-requirements.md](docs/brainstorms/2026-05-01-library-alpha-website-template-requirements.md)
- CSS isolation precedent: `src/app/v1/page.tsx` + `src/app/v1/v1.css`
- Library accordion: `src/components/hub/library-accordion.tsx`
- Video embed pattern: `src/components/hub/video-lightbox.tsx`
- Auth/routing patterns: `docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`
- YouTube thumbnail fix: `docs/solutions/ui-bugs/youtube-thumbnail-placeholder-fallback-2026-05-01.md`
- CSS isolation learning: `docs/solutions/best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md`
- Reference site: alphasouthbayla.org (snapshot date: 2026-05-01)
