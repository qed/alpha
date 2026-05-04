---
title: "feat: Convert website template to live homepage with lead capture"
type: feat
status: active
date: 2026-05-03
origin: docs/brainstorms/2026-05-03-live-homepage-requirements.md
---

# feat: Convert website template to live homepage with lead capture

## Overview

Replace the current static "letter to Toronto Parents" homepage at `/` with a live landing page derived from the website-preview template. The new homepage features a working lead-capture form that creates prospects directly in the pipeline, Toronto-specific content (interest chart, service areas, progress tracker), and an updated navigation bar. The letter content moves to `/for-parents`.

## Problem Frame

The current homepage is a personal letter — compelling content but not an enrollment funnel. The website-preview template already demonstrates what a polished Alpha landing page looks like, but it's a non-functional preview hidden behind the Hub. Converting it to the live homepage creates an active lead-capture pipeline for Alpha Toronto while preserving the letter as accessible content.

(see origin: `docs/brainstorms/2026-05-03-live-homepage-requirements.md`)

## Requirements Trace

- R1. Nav brand: "Alpha Toronto Parents Hub"
- R2. Remove "The Hub" link from nav
- R3. Keep "Join the community" CTA (same external link)
- R4. Add "For Parents" link to nav → letter page
- R5. Letter content moves to its own route
- R6. Letter page uses the same public navbar
- R7. Hero form is live and functional
- R8. Form fields: first name, last name, email (required); phone (optional); postal code (required); child name + grade (required)
- R9. Multiple children via add-more button
- R10. Privacy/consent note below form
- R11. Form creates prospects in pipeline (same data model)
- R12. Pipeline drawer shows child name + grade per child
- R13–R15. Progress section: first two checkmarked, "50 commitments" and "Determining location" empty
- R16–R17. Interest chart: Toronto title, K-8 grades with values 4-12
- R18–R19. Service areas: GTA heading, 8 listed cities
- R20–R22. Footer: brand, alphatoronto.org, copyright "Alpha Toronto"

## Scope Boundaries

- The `/hub/library/website-preview` template remains unchanged
- No changes to the Hub dashboard beyond pipeline drawer child display (R12)
- Lead capture only — no payment, enrollment, or application flow
- Interest chart numbers are hardcoded, not real data
- No CMS — all content hardcoded

## Context & Research

### Relevant Code and Patterns

- `src/app/hub/library/website-preview/` — source template with all section components and `website-preview.css`
- `src/components/shared/public-navbar.tsx` — current nav with variant system
- `src/app/page.tsx` — current homepage (letter content to relocate)
- `src/lib/actions/intake.ts` — `submitIntakeForm` server action (anon Supabase client, Turnstile, rate limiting)
- `src/lib/validations/intake-schema.ts` — Zod schema for intake form
- `src/components/intake/intake-form.tsx` — existing intake form component (client)
- `src/components/intake/child-fields.tsx` — reusable child entry fields
- `src/components/intake/turnstile-widget.tsx` — Cloudflare Turnstile widget
- `supabase/migrations/004_intake_function.sql` — `submit_intake` RPC (SECURITY DEFINER)
- `src/components/dashboard/drawer-aside.tsx` — pipeline prospect about section (lines 108-122)
- `src/lib/constants/geographies.ts` — RESERVED_SLUGS array

### Institutional Learnings

- **Clerk + Supabase auth**: Use `getSupabaseAdminClient()` for authenticated operations; the public intake form uses anon client with SECURITY DEFINER RPC (see `docs/solutions/integration-issues/clerk-supabase-vercel-auth-cascade-failure-2026-05-01.md`)
- **CSS isolation**: Website-preview uses `wp-` prefixed classes scoped to `.wp-root` to avoid conflicts with global Tailwind theme (see `docs/solutions/best-practices/css-isolation-embedded-preview-2026-05-01.md`)
- **Server action pattern**: Zod validation → rate limit → Turnstile verify → RPC call → notify (see `docs/solutions/best-practices/pipeline-crm-feature-patterns-2026-05-02.md`)
- **Static-to-Next.js migration**: Strip element selectors, keep class-scoped CSS, push route-specific concerns to route layouts (see `docs/solutions/best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md`)

## Key Technical Decisions

- **Keep `wp-` CSS isolation for homepage**: The website-preview CSS is already built, tested, and scoped. Copy the stylesheet rather than converting to Tailwind — lower risk and faster delivery.
- **Hardcode geography slug "toronto"**: The homepage is Toronto-specific. Form submissions use `geography_slug: "toronto"` directly.
- **Auto-set source to "website"**: Homepage submissions automatically get `source: "website"` rather than showing a source dropdown.
- **Inline success state instead of redirect**: The homepage form shows a success message in-place after submission rather than redirecting to `/toronto/confirmation`. Better landing page UX — no jarring page transition.
- **Two-layer validation**: Add `postal_code` as optional to the server-side `intakeFormSchema` (backwards-compatible with existing intake form). Homepage form enforces postal_code + grade via its own client-side Zod schema before calling the same action.
- **Adapt existing server action**: Add an optional `p_postal_code` parameter to `submit_intake` RPC and extend `submitIntakeForm` to pass it through, rather than creating a parallel action.
- **Route `/for-parents` for letter**: Short, matches the nav link text, and avoids collision with geography slugs.

## Open Questions

### Resolved During Planning

- **What geography slug for homepage form?** → `"toronto"` — confirmed in `supabase/migrations/002_seed_geographies.sql` line 73 (slug: "toronto", name: "Toronto", region: "Ontario", country: "CA").
- **Reuse submitIntakeForm or new action?** → Reuse with minor adaptation. The RPC needs a new optional parameter for postal_code, and the action needs to accept the homepage schema alongside the existing one.
- **Where does postal_code go?** → New column on `prospects` table + new parameter on `submit_intake` RPC. Migration required.
- **Form success behavior?** → Inline success state in the hero card. No page redirect for homepage.
- **CSS approach for homepage?** → Copy `website-preview.css` as `homepage.css` with same `wp-` scoping. The homepage is visually the same template with different content.

### Deferred to Implementation

- Exact Sora/DM Sans font loading strategy for the homepage route (may need route-level font declaration or root layout addition)
- Whether the "Events" standalone section from the template should appear on the homepage or be omitted (low priority — can be decided during implementation)
- Resubmission UX — currently shows same success message for new and duplicate submissions; keep this behavior for simplicity (avoids revealing who exists in the system)
- Notification email currently passes geography_slug ("toronto" lowercase) as geographyName — consider capitalizing or looking up display name from RPC result during implementation

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
Homepage Form Submission Flow:
┌──────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ HomepageForm     │────▶│ submitIntakeForm()    │────▶│ submit_intake   │
│ (client)         │     │ (server action)       │     │ RPC (Supabase)  │
│                  │     │                       │     │                 │
│ Fields:          │     │ 1. Zod validate       │     │ INSERT prospect │
│ - name, email    │     │ 2. Rate limit         │     │ + postal_code   │
│ - phone, postal  │     │ 3. Turnstile verify   │     │ INSERT children │
│ - children[]     │     │ 4. Call RPC           │     │                 │
│ - consent        │     │ 5. Notify             │     │                 │
└──────────────────┘     └──────────────────────┘     └─────────────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────┐
                                                   │ Pipeline Drawer  │
                                                   │ shows child info │
                                                   └─────────────────┘
```

## Implementation Units

- [ ] **Unit 1: Database migration — add postal_code and update RPC**

**Goal:** Add `postal_code` column to prospects and extend `submit_intake` RPC to accept and store it.

**Requirements:** R8, R11

**Dependencies:** None

**Files:**
- Create: `supabase/migrations/009_add_postal_code.sql`

**Approach:**
- Add `postal_code text` column to prospects (nullable, no breaking change)
- `CREATE OR REPLACE` the `submit_intake` function with new optional parameter `p_postal_code text DEFAULT NULL`
- Insert postal_code into the prospect row
- No changes to RLS policies needed (function is SECURITY DEFINER)

**Patterns to follow:**
- `supabase/migrations/007_pipeline_enhancements.sql` for ALTER TABLE pattern
- `supabase/migrations/004_intake_function.sql` for RPC structure

**Test scenarios:**
- Happy path: submit_intake with p_postal_code populates the column
- Happy path: submit_intake without p_postal_code leaves column NULL (backwards compatible)
- Edge case: existing prospects resubmitting still return is_resubmission correctly

**Verification:**
- Migration applies cleanly
- Existing intake form at `/[geography]` still works (postal_code is optional in the RPC)

---

- [ ] **Unit 2: Reserved slugs and letter page route**

**Goal:** Add "for-parents" to RESERVED_SLUGS and create the letter page route with the current homepage content.

**Requirements:** R4, R5, R6

**Dependencies:** None

**Files:**
- Modify: `src/lib/constants/geographies.ts`
- Create: `src/app/(public)/for-parents/page.tsx`

**Approach:**
- Add `"for-parents"` to RESERVED_SLUGS array
- Move the current `src/app/page.tsx` content (hero letter, testimonial cards, CTA section) into `src/app/(public)/for-parents/page.tsx`
- The letter page uses `<PublicNavbar />` (which will be updated in Unit 3)
- Keep all existing styling, fonts, and structure intact

**Patterns to follow:**
- `src/app/(public)/[geography]/page.tsx` for public route group pattern
- Current `src/app/page.tsx` for the letter content structure

**Test scenarios:**
- Happy path: GET `/for-parents` renders the letter content with public navbar
- Edge case: GET `/for-parents` does not get caught by the `[geography]` dynamic route (verified via RESERVED_SLUGS)

**Verification:**
- Letter page renders at `/for-parents` with all content intact
- The `[geography]` route does not intercept `/for-parents`

---

- [ ] **Unit 3: Public navbar update**

**Goal:** Update the shared public navbar to match new requirements — brand text, remove "The Hub", add "For Parents" link.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Unit 2 (letter page route must exist)

**Files:**
- Modify: `src/components/shared/public-navbar.tsx`

**Approach:**
- Brand text in top-left remains "Parents Hub" subtitle (already reads "Alpha Toronto" from the image + "Parents Hub" text — this matches R1)
- Remove the "The Hub" link entirely from both variants
- Add "For Parents" text link to the left of the CTA button, linking to `/for-parents`
- Keep "Join the Community" external link button (default variant) and "Enter the Hub" button (hub variant) unchanged
- The hub variant also gets the "For Parents" link

**Patterns to follow:**
- Current `public-navbar.tsx` structure and styling

**Test scenarios:**
- Happy path: Navbar renders with brand, "For Parents" link, and "Join the Community" CTA
- Happy path: "For Parents" link navigates to `/for-parents`
- Edge case: Hub variant shows "For Parents" + "Enter the Hub" (no "The Hub" link)
- Integration: Navbar renders correctly on both `/` and `/for-parents`

**Verification:**
- "The Hub" link no longer appears in any variant
- "For Parents" link is visible and functional
- "Join the Community" external link unchanged

---

- [ ] **Unit 4: Homepage form component**

**Goal:** Create a live intake form for the homepage hero section with the specified fields and inline success state.

**Requirements:** R7, R8, R9, R10, R11

**Dependencies:** Unit 1 (postal_code migration)

**Files:**
- Create: `src/components/intake/homepage-form.tsx`
- Modify: `src/lib/validations/intake-schema.ts` (add optional postal_code)
- Modify: `src/lib/actions/intake.ts` (pass postal_code to RPC)

**Approach:**
- **Two-layer validation strategy:** The server action schema (`intakeFormSchema`) gets `postal_code: z.string().optional()` added — keeping it optional so the existing `/[geography]` intake form continues working without changes. A separate client-side Zod schema in the homepage form component enforces postal_code and grade as required before submission. This means the server never rejects a missing postal_code (it's optional at that layer), but the homepage UI won't allow submission without it.
- Homepage client schema enforces: `parent_first`, `parent_last`, `parent_email` (required); `parent_phone` (optional); `postal_code` (required); `children` array (name + grade, both required per child); `consent` (literal true); `turnstile_token`
- Grade is required in the homepage client schema (unlike existing intake schema where grade is optional) — validation must reject empty grade selections
- New client component styled to fit inside the `wp-events-card` container from the website-preview hero
- Uses existing `TurnstileWidget` for CAPTCHA
- Child fields: reuse pattern from `child-fields.tsx` but simplified (only name + grade, both required)
- On submit: the homepage form constructs a full payload compatible with `submitIntakeForm` — sets `geography_slug: "toronto"`, `source: "website"`, `spouse_name: ""`, and includes `postal_code`
- On success: show inline confirmation message in the form card (no redirect)
- Privacy/consent note below submit button
- Notification email does not need postal_code — champions see it in the pipeline drawer (Unit 6)

**Patterns to follow:**
- `src/components/intake/intake-form.tsx` for form state management, submission flow, and Turnstile integration
- `src/components/intake/child-fields.tsx` for add/remove child pattern

**Test scenarios:**
- Happy path: Fill all required fields + one child → submit → inline success message shown
- Happy path: Add second child via "add more" → both children submitted
- Edge case: Missing required field (postal code, child grade) → validation error shown
- Edge case: Invalid email → validation error
- Error path: Turnstile fails → "Bot verification failed" error
- Error path: Rate limit hit → "Too many submissions" error
- Integration: Successful submission creates prospect with postal_code and children in Supabase

**Verification:**
- Form renders in the hero card with all required fields
- Submission creates a prospect viewable in the pipeline
- Success state shows inline without page navigation

---

- [ ] **Unit 5: Homepage page and sections**

**Goal:** Create the new homepage at `/` using the website-preview template structure with Toronto-specific content.

**Requirements:** R13–R22

**Dependencies:** Unit 3 (updated navbar), Unit 4 (form component)

**Files:**
- Modify: `src/app/page.tsx` (complete rewrite)
- Create: `src/app/homepage.css` (copied from `website-preview.css`, potentially with minor adjustments)
- Create: `src/app/_components/homepage-hero.tsx`
- Create: `src/app/_components/homepage-progress.tsx`
- Create: `src/app/_components/homepage-interest-chart.tsx`
- Create: `src/app/_components/homepage-service-areas.tsx`
- Create: `src/app/_components/homepage-footer.tsx`

**Approach:**
- Replace `src/app/page.tsx` entirely with the website-preview template structure
- Load Sora + DM Sans fonts (same as website-preview) and apply `wp-root` wrapper
- Use `PublicNavbar` (updated in Unit 3) instead of the template's inline navbar
- Hero section: same layout as template but embed `<HomepageForm />` in place of the static form card
- Progress section: modify milestones — "Community Portal open" ✓, "Accepting Commitments" ✓, "50 Commitments" ○, "Determining Location" ○
- Interest chart: title "K-8 families Alpha Toronto (North, Central and West)", grades K–8 with hardcoded values between 4–12
- Service areas: heading "Serving Families in the Greater Toronto Area", cities: Oakville, Mississauga, The City of Toronto, Thornhill, Vaughan, Markham, Richmond Hill, Newmarket
- Footer: brand "Alpha Toronto Parents Hub", URL "alphatoronto.org", copyright "Alpha Toronto"
- Keep AlphaModelSection, VideoSection, DailyScheduleSection, EnrollmentSection, ComingSoonSection from template as-is (genericized content is fine for Toronto)
- Omit or include EventsStandaloneSection (implementation-time decision)
- Copy `website-preview.css` → `homepage.css` for the page's CSS isolation

**Patterns to follow:**
- `src/app/hub/library/website-preview/page.tsx` for overall page structure
- `src/app/hub/library/website-preview/_components/` for section component patterns

**Test scenarios:**
- Happy path: GET `/` renders the full landing page with all sections
- Happy path: Progress section shows 2 complete + 2 incomplete milestones
- Happy path: Interest chart displays K-8 grades with values in 4-12 range
- Happy path: Service areas lists all 8 GTA cities
- Happy path: Footer shows "Alpha Toronto Parents Hub", "alphatoronto.org", "© Alpha Toronto"
- Integration: Form in hero section is interactive and submits successfully

**Verification:**
- Homepage renders the full website template with Toronto content
- All sections match the requirements (progress, chart, cities, footer)
- Form is live and functional within the hero section
- No CSS leakage into other pages

---

- [ ] **Unit 6: Pipeline drawer — enhanced child and postal code display**

**Goal:** Show each child's name and grade on separate lines, and display postal code, in the pipeline prospect detail "about" section.

**Requirements:** R12

**Dependencies:** Unit 1 (postal_code column must exist)

**Files:**
- Modify: `src/components/dashboard/drawer-aside.tsx`
- Modify: `src/components/dashboard/contact-drawer.tsx` (extend `SelectedProspectDetail` type to include `postal_code`)
- Modify: `src/app/hub/(dashboard)/(champion)/pipeline/page.tsx` (add `postal_code` to the Supabase select query)

**Approach:**
- Replace the current single-line children rendering (lines 108-122) with a per-child layout
- Each child gets its own line: "{first_name} — Grade {grade}" (or just name if no grade)
- Keep the "Kids" label and `dt`/`dd` structure
- Multiple children stack vertically within the `dd` element
- Add a "Postal" row in the about section (same dt/dd pattern as email/phone/spouse/source) when postal_code is present
- Add `postal_code` to the SelectedProspectDetail interface and to the Supabase select query for prospect detail

**Patterns to follow:**
- Current `drawer-aside.tsx` dl/dt/dd pattern for other fields (email, phone, spouse, source)

**Test scenarios:**
- Happy path: Prospect with 2 children → each child shown on separate line with name and grade
- Happy path: Prospect with postal_code → "Postal" row displays the value
- Edge case: Child with no grade → shows name only
- Edge case: Prospect with no children → "Kids" row not displayed (existing behavior)
- Edge case: Prospect with no postal_code → "Postal" row not displayed

**Verification:**
- Pipeline drawer shows each child's name and grade clearly
- Postal code visible for homepage-submitted prospects
- Layout is scannable — each child visually distinct

---

- [ ] **Unit 7: Privacy page update**

**Goal:** Add postal code to the list of collected personal information on the privacy policy page.

**Requirements:** R10 (consent/privacy compliance)

**Dependencies:** None

**Files:**
- Modify: `src/app/(public)/privacy/page.tsx`

**Approach:**
- Add "postal code" to the list of collected information (alongside name, email, phone, child info)
- One-line change for PIPEDA/CASL compliance since the form targets Toronto (Canadian privacy law)

**Test expectation: none** — pure content change, no behavioral logic

**Verification:**
- Privacy page lists postal code as collected information

---

## System-Wide Impact

- **Interaction graph:** Homepage form → `submitIntakeForm` action → `submit_intake` RPC → prospects/children tables → pipeline drawer display. Email notification triggers on new prospects.
- **Error propagation:** Form validation errors surface inline. Server-side errors (rate limit, Turnstile, RPC failure) return to the form component which displays them.
- **State lifecycle risks:** None — form submission is idempotent (dedup by email within geography). Re-submissions return existing prospect ID.
- **API surface parity:** The existing `/[geography]` intake form continues to work. The homepage form is an additional entry point to the same pipeline.
- **Integration coverage:** End-to-end: form submit → prospect visible in pipeline with child info and postal code.
- **Unchanged invariants:** The `/hub/library/website-preview` template, all Hub dashboard pages (except drawer-aside), the `/[geography]` intake form, and all auth flows remain untouched.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| CSS from homepage leaks into other pages | Scoped via `.wp-root` wrapper + `wp-` prefixed classes (proven pattern from website-preview) |
| `submit_intake` RPC change breaks existing intake form | New parameter is DEFAULT NULL — fully backwards compatible |
| "for-parents" slug conflicts with geography route | Added to RESERVED_SLUGS which the `[geography]` route already checks |
| Font loading increases page weight | Sora + DM Sans already used elsewhere; Next.js font optimization handles subsetting |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-03-live-homepage-requirements.md](docs/brainstorms/2026-05-03-live-homepage-requirements.md)
- Related plan: [docs/plans/2026-05-01-001-feat-library-website-template-plan.md](docs/plans/2026-05-01-001-feat-library-website-template-plan.md)
- CSS isolation pattern: `docs/solutions/best-practices/css-isolation-embedded-preview-2026-05-01.md`
- Server action pattern: `docs/solutions/best-practices/pipeline-crm-feature-patterns-2026-05-02.md`
- Auth pattern: `docs/solutions/integration-issues/clerk-supabase-vercel-auth-cascade-failure-2026-05-01.md`
