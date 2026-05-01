---
title: "feat: Hub Library page with accordion, video lightbox, and talking points"
type: feat
status: active
date: 2026-04-30
origin: docs/brainstorms/2026-04-30-hub-library-page-requirements.md
---

# feat: Hub Library Page

## Problem Frame

Champions need reference materials to confidently talk about Alpha School with prospective parents. The Hub intro page promises three resource categories (FAQ Library, Parent Testimonials, "Why Alpha" Talking Points) that all link to `/hub/library`, which is currently a placeholder. The Library should consolidate these resources without duplicating content that already lives on alpha.school or YouTube. (see origin: `docs/brainstorms/2026-04-30-hub-library-page-requirements.md`)

## Requirements Trace

| Req | Description | Unit |
|-----|-------------|------|
| R1 | Accordion layout with 3 items: FAQ Library, Parent Testimonials, "Why Alpha" Talking Points | 1 |
| R2 | Single-open accordion behavior | 1 |
| R3 | All items collapsed on load unless URL fragment present | 1 |
| R4 | HubShell integration, `auth()` for sidebar state, no redirect for unauthenticated | 1 |
| R5 | FAQ description + CTA to `alpha.school/faq` in new tab | 2 |
| R6 | No FAQ content duplicated on this page | 2 |
| R7 | Responsive video thumbnail grid from provided video list | 4 |
| R8 | Video lightbox with YouTube embed, close via X / Escape / backdrop | 3 |
| R9 | Video list from `artifacts/YouTube-Links-Parent-Testimonials.txt` (23 URLs, titles resolved during implementation) | 4 |
| R10 | Visual reference: `artifacts/video-playback-screenshot.png` | 3, 4 |
| R11 | 10 talking point categories with heading, explanation, supporting detail | 5 |
| R12 | All content Alpha-generic (no campus/location references) | 5 |
| R13 | Fragment deep-linking (`#faq`, `#testimonials`, `#talking-points`) + intro page card updates | 1, 6 |

## Scope Boundaries

**In scope:** Accordion layout, video grid + lightbox, talking points content, fragment deep-linking, intro page card link updates, tests.

**Out of scope (from origin):**
- Duplicating alpha.school/faq content — link out only
- Video upload/management — videos hardcoded from provided list
- Search or filtering — content volume doesn't warrant it
- Auth gating — Library stays open like today
- CMS — content is static in the component
- Send-to-prospect workflow and engagement tracking (prototype features, deferred to future iteration)

## Decisions

### D1: YouTube Auto-Generated Thumbnails with Native `<img>` (resolves origin OQ affecting R7)

Use native `<img>` elements (not `next/image`) with `img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg` and `onError` fallback to `hqdefault.jpg`.

**Why:** No custom images to manage. Thumbnails auto-update if YouTube re-encodes. Native `<img>` is required because: (a) `next/image` does not support `onError` fallback to a different src, and (b) YouTube CDN is not in `next.config.ts` `images.remotePatterns` — adding it for thumbnails alone isn't worth the config change. The video list exists (`artifacts/YouTube-Links-Parent-Testimonials.txt`, 23 URLs).

### D2: Custom Video Lightbox Component (resolves origin OQ affecting R8)

Build a hand-rolled `VideoLightbox` client component. Reuse the focus-trap / Escape / focus-restore pattern from `src/components/hub/hub-sidebar.tsx` (lines 102-139).

**Why:** No component library exists in this codebase (no Radix, Headless UI, etc.). The sidebar already demonstrates the exact accessibility pattern. Consistent with the project's hand-rolled approach.

### D3: Structured Prose for Talking Points (resolves origin OQ affecting R11)

Each talking point renders as a prose block: bold heading (`font-display`), body explanation, supporting detail in `ink-3`. No cards, no icons.

**Why:** Content is text-heavy (10 categories x heading + explanation + detail). Prose with clear typographic hierarchy reads best. Cards would add visual noise. Icons would require design assets that don't exist.

### D4: Accordion State via `useState` + Fragment via `useEffect` + `hashchange` Listener

Track active section with `useState<string | null>(null)`. On mount, read `window.location.hash` and set the active section. Also register a `hashchange` event listener to handle client-side navigation (e.g., user clicks a Link from the intro page with a fragment). After setting the active section from a fragment, scroll the matching accordion item into view via `requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))`. Invalid fragments are silently ignored (all items remain collapsed).

**Why:** Mount-only `useEffect` would miss hash changes from client-side navigation (Next.js `<Link>` does not remount the target component). The `hashchange` listener covers both initial load and in-app navigation. `scrollIntoView` is needed because dynamically rendered accordion content won't be in the DOM when the browser tries native fragment scrolling.

### D5: Inline Content Constants

All content (FAQ description, video list, talking points) defined as TypeScript constants within the component files. Content updates require code changes.

**Why:** Small, static content. No CMS planned (see origin scope boundaries).

## Context & Research

### Relevant Code and Patterns

- `src/app/hub/page.tsx` — reference pattern for async server component + HubShell + `auth()`
- `src/app/hub/library/page.tsx` — current placeholder to replace (sync, no HubShell)
- `src/components/hub/hub-shell.tsx` — client component, `grid lg:grid-cols-[240px_1fr]`, accepts `{ isAuthenticated, children }`
- `src/components/hub/hub-sidebar.tsx` — focus trap + Escape + focus restore pattern (lines 102-139); Library already registered as `requiresAuth: false`
- `src/app/globals.css` — all design tokens (`@theme inline`): colors (`ink`, `paper`, `alpha-blue`, `line`), fonts (`--font-display`, `--font-body`), radii, shadows
- `src/__tests__/hub-page.test.tsx` — test pattern: mock Clerk, mock Next.js, `await Component()` then `render(result)`
- `artifacts/alpha_school_resource_library.md` — talking points source content
- `artifacts/video-playback-screenshot.png` — lightbox visual reference

### Institutional Learnings

- **Single `auth()` call** (`docs/solutions/performance-issues/double-auth-call-hub-page-routing-2026-04-30.md`): Call `auth()` once in the server page component. Do not use `requireAuth()` on open pages.
- **Auth-aware layout** (`docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`): Pass `isAuthenticated` boolean to HubShell. Library lives outside `(dashboard)` route group.
- **Clerk middleware** (`docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md`): Do not modify `src/middleware.ts`. `auth()` requires `clerkMiddleware()` to be present.
- **Sidebar accessibility pattern**: Focus trap, Escape-to-close, focus restoration — reuse for video lightbox.

### Technology Stack

Next.js 16.2.4, React 19, TypeScript 5, Tailwind CSS 4 (v4 `@theme inline`), Clerk v7, Vitest 4.1.5 + Testing Library. No component library — all UI hand-rolled.

### Net-New Patterns

No existing accordion, modal/dialog, or video embed components in the codebase. These are all first implementations.

## Implementation Units

### Unit 1: Page Shell + Accordion Component

- [ ] Replace placeholder with HubShell integration and accordion with fragment deep-linking

**Files:**
- `src/app/hub/library/page.tsx` (replace)
- `src/components/hub/library-accordion.tsx` (create)

**Approach:**
- `page.tsx`: Async server component. `const { userId } = await auth()`, pass `!!userId` as `isAuthenticated` to `<HubShell>`. Renders `<LibraryAccordion />` as child. Follow `src/app/hub/page.tsx` exactly.
- `library-accordion.tsx`: `"use client"`. `useState<string | null>(null)` for active section. Three accordion items with IDs matching fragments (`faq`, `testimonials`, `talking-points`). Each header is a `<button>` with `aria-expanded`. Clicking a closed item opens it and closes others. Clicking an open item closes it. `useEffect` reads `window.location.hash` on mount and registers a `hashchange` listener for client-side navigation. After expanding from a fragment, scroll the section into view via `requestAnimationFrame` + `scrollIntoView({ behavior: 'smooth' })`. Invalid fragments silently ignored.

**Patterns to follow:** `src/app/hub/page.tsx` (HubShell + auth). Design tokens from `src/app/globals.css`.

**Test scenarios:**
- Page renders inside HubShell with sidebar
- Unauthenticated user sees page without redirect
- All 3 accordion items render with correct labels
- All items start collapsed when no fragment
- Clicking an item expands it
- Clicking a second item closes the first (single-open)
- Clicking an open item collapses it
- Fragment `#faq` auto-expands FAQ on mount
- Fragment `#testimonials` auto-expands testimonials on mount
- Fragment `#talking-points` auto-expands talking points on mount
- Invalid fragment (e.g., `#invalid`) is silently ignored; all items remain collapsed
- Fragment-expanded section is scrolled into view
- Client-side navigation with fragment (e.g., Link from intro page) updates accordion

**Verification:** Accordion renders in HubShell, single-open behavior works, fragment deep-linking works on both initial load and client-side navigation.

---

### Unit 2: FAQ Library Section

- [ ] Add FAQ content to the first accordion item

**Files:**
- `src/components/hub/library-accordion.tsx` (modify)

**Approach:**
- Brief description paragraph about what the Alpha FAQ covers.
- Prominent CTA button/link opening `https://alpha.school/faq/` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).
- No FAQ content duplicated — the CTA is the primary interaction.

**Patterns to follow:** CTA button style from `src/app/hub/page.tsx` ("Enter the Hub" button).

**Test scenarios:**
- FAQ section displays a description paragraph
- CTA links to `https://alpha.school/faq/` with `target="_blank"`
- No FAQ content is embedded

**Verification:** FAQ section shows description + working CTA link.

---

### Unit 3: Video Lightbox Component

- [ ] Build video lightbox with YouTube embed and keyboard accessibility

**Files:**
- `src/components/hub/video-lightbox.tsx` (create)

**Approach:**
- Client component. Props: `videoId: string`, `title: string`, `isOpen: boolean`, `onClose: () => void`.
- Overlay: `fixed inset-0 bg-black/70 z-[60]` (above sidebar z-50), click closes. Centered content with max-width.
- YouTube iframe: `https://www.youtube-nocookie.com/embed/{videoId}?autoplay=1`, `allow="autoplay; encrypted-media"`. Iframe rendered only when `isOpen` is true (lazy load per origin dependency). Note: autoplay may not work on iOS Safari due to async gap between user gesture and iframe mount — acceptable degradation (user taps play in iframe).
- 16:9 aspect ratio container for iframe.
- Close: X button (top-right), Escape key, backdrop click.
- Body scroll lock: set `document.body.style.overflow = 'hidden'` on open, restore on close (in useEffect cleanup). The sidebar pattern does not do this but it's necessary for centered overlays to prevent background scroll.
- Accessibility: `role="dialog"`, `aria-modal="true"`, `aria-label` on close button. Focus trap reusing sidebar pattern (save `previousFocusRef`, restore on close, Tab wrapping).

**Patterns to follow:** `src/components/hub/hub-sidebar.tsx` lines 102-139 (focus trap, Escape, focus restore).

**Test scenarios:**
- Renders when `isOpen` is true, does not render when false
- Iframe uses `youtube-nocookie.com` domain
- Iframe not in DOM when closed
- Close button calls `onClose`
- Escape key calls `onClose`
- Backdrop click calls `onClose`
- Focus trapped within lightbox when open
- Focus returns to trigger element on close
- Has `role="dialog"` and `aria-modal="true"`

**Verification:** Lightbox opens/closes correctly, keyboard accessible, iframe loads only on open.

---

### Unit 4: Parent Testimonials Section

- [ ] Add video thumbnail grid to the second accordion item, integrated with VideoLightbox

**Files:**
- `src/components/hub/library-accordion.tsx` (modify)

**Approach:**
- Video list as a const array: `{ youtubeId: string; title: string }[]`. Source: `artifacts/YouTube-Links-Parent-Testimonials.txt` (23 URLs, extract video IDs from URLs). Titles must be resolved during implementation — use YouTube oEmbed endpoint (`https://www.youtube.com/oembed?url={URL}&format=json`, no API key required) or look up manually.
- Responsive grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`.
- Each card: native `<img>` (not `next/image` — see D1) with `img.youtube.com/vi/{youtubeId}/maxresdefault.jpg`, `onError` fallback to `hqdefault.jpg`, title below. Card is a `<button>` for accessibility.
- `useState` for selected video. Clicking a card opens `<VideoLightbox>` with that video's data.

**Patterns to follow:** Grid layout from hub intro page resources section (`src/app/hub/page.tsx`).

**Test scenarios:**
- Grid renders all video cards
- Each card shows thumbnail and title
- Clicking card opens lightbox with correct video
- Thumbnails use YouTube CDN URL pattern
- Grid is responsive (column count adapts)

**Verification:** Grid renders, cards clickable, lightbox opens with correct video.

---

### Unit 5: "Why Alpha" Talking Points Section

- [ ] Add 10 talking point categories to the third accordion item

**Files:**
- `src/components/hub/library-accordion.tsx` (modify)

**Approach:**
- Content as a const array of `{ heading: string; explanation: string; detail: string }`.
- 10 entries per R11: 2-Hour Learning Model, AI-Powered 1:1 Learning, Guides Not Teachers, Life Skills & Entrepreneurship, Physical & Mental Wellness, Community & Connection, Daily Schedule, Outcomes, Student Experience, Press & Validation.
- Each renders: heading in `font-[family-name:var(--font-display)] font-bold text-ink`, explanation in `text-ink-2`, detail in `text-ink-3 text-sm`.
- Content adapted from `artifacts/alpha_school_resource_library.md`, filtered for Alpha-generic messaging per R12.
- **Outcomes statistics**: Use general language ("students consistently rank in the top percentiles nationally") until verified against current system-wide data.

**Patterns to follow:** Typography from hub intro page content sections.

**Test scenarios:**
- All 10 talking point headings render
- Each has explanation and supporting detail text
- No campus-specific or location-specific content (no "South Bay", "Toronto", "Austin", campus names)
- Proper heading hierarchy within accordion

**Verification:** All 10 talking points render with Alpha-generic content.

---

### Unit 6: Intro Page Deep-Link Updates

- [ ] Update hub intro page resource cards to link with fragment URLs

**Files:**
- `src/app/hub/page.tsx` (modify)
- `src/__tests__/hub-page.test.tsx` (modify — add href assertions for fragment URLs; existing test checks card labels but not hrefs)

**Approach:**
- FAQ Library card: `href="/hub/library#faq"`
- Parent Testimonials card: `href="/hub/library#testimonials"`
- "Why Alpha" Talking Points card: `href="/hub/library#talking-points"`

**Patterns to follow:** Existing `Link` usage in `src/app/hub/page.tsx`.

**Test scenarios:**
- FAQ card links to `/hub/library#faq`
- Testimonials card links to `/hub/library#testimonials`
- Talking Points card links to `/hub/library#talking-points`

**Verification:** Each resource card links to the correct fragment URL. Hub-page test updated with href assertions for all 3 fragment URLs.

---

### Unit 7: Test Suite

- [ ] Comprehensive test file covering all library page behavior

**Files:**
- `src/__tests__/hub-library-page.test.tsx` (create)

**Approach:**
- Follow `src/__tests__/hub-page.test.tsx`: mock `@clerk/nextjs/server`, `next/navigation`, `next/image`, `next/link`.
- Server component tested via `await LibraryPage()` then `render(result)`.
- Groups: page shell, accordion behavior, FAQ section, testimonials section, talking points section, lightbox, deep-linking.
- VideoLightbox tested directly with `render(<VideoLightbox ... />)`.

**Patterns to follow:** `src/__tests__/hub-page.test.tsx`, `src/__tests__/setup.ts`.

**Test scenarios:**
- All scenarios from Units 1-6

**Verification:** `npx vitest run src/__tests__/hub-library-page.test.tsx` passes.

## Dependencies and Sequencing

```
Unit 1 (page shell + accordion)
  ├── Unit 2 (FAQ section) ─────────────── can parallel
  ├── Unit 3 (lightbox) → Unit 4 (testimonials)
  └── Unit 5 (talking points) ──────────── can parallel
Unit 6 (intro page updates) ── independent
Unit 7 (tests) ── after Units 1-6
```

- Unit 3 and Unit 6 are truly independent (separate files)
- Units 2, 4, and 5 all modify `library-accordion.tsx` — if single-implementer, run sequentially (2 → 4 → 5); if parallel agents, split each section into its own sub-component file first
- Unit 4 depends on Unit 3 (lightbox must exist before testimonials integrates it)
- Unit 7 runs last to write the consolidated test suite

## External Dependencies

- **Video list**: `artifacts/YouTube-Links-Parent-Testimonials.txt` contains 23 YouTube URLs (no titles). Video IDs must be extracted from URLs; titles resolved via YouTube oEmbed or manual lookup during implementation. (see origin: Dependencies)
- **Outcomes statistics**: Must be verified against current Alpha School system-wide data before using specific numbers. Use general language until confirmed. (see origin: Dependencies)
- **Talking points source content**: `artifacts/alpha_school_resource_library.md` — adapt and filter for Alpha-generic messaging.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Video titles unavailable (URLs exist, titles don't) | Medium | Low | Resolve via YouTube oEmbed endpoint or manual lookup during implementation |
| `maxresdefault.jpg` returns 404 for some videos | Low | Low | `onError` fallback to `hqdefault.jpg` (always available) |
| Outcomes statistics unverified | Medium | Low | Use general language until data confirmed |
| iOS Safari blocks autoplay in lightbox | Low | Low | Acceptable degradation — user taps play inside iframe. Muted autoplay always allowed as fallback |
