---
title: "feat: Champions Hub visual overhaul — dashboard, library, SendComposer"
type: feat
status: active
date: 2026-05-06
origin: docs/brainstorms/2026-05-06-champions-hub-visual-overhaul-requirements.md
---

# Champions Hub Visual Overhaul

## Overview

Replace the basic champion dashboard (pipeline counts + activity feed) with a data-dense layout matching the design prototype: KPI strip, deposit thermometer, Today's Briefing, and two-column footer. Migrate the library page from hardcoded static content to database-backed `library_items` with card-based presentation and Send buttons. Replace the existing `LibrarySendPanel` with a new `SendComposer` modal as the single send flow everywhere. Strip the redundant top nav header from the dashboard layout so it renders with the sidebar shell only (the library page already does).

## Problem Frame

Champions have a functional but under-designed dashboard. The backend infrastructure (heat scores, concerns, signals, library items/sends, audit log) is fully built. This work closes the gap between shipped data and the intended champion experience. (See origin: `docs/brainstorms/2026-05-06-champions-hub-visual-overhaul-requirements.md`)

## Requirements Trace

**Dashboard Layout & KPIs**
- R1. Replace dashboard with four-section stacked layout
- R2. KPI strip: Deposits (featured), Active Pipeline, Total Contacts, Streak; each with 14-day delta
- R3. Deposit thermometer: geography progress toward `enrollment_threshold`
- R4. Today's Briefing: follow-ups (ranked by heat*4 + days_since) + watch column (cooling/warming)
- R5. Two-column footer: PipelineSummary + "This week" stats
- R6. Remove copy-link button
- R7. Remove separate empty state; always render full layout with zeros

**Library & SendComposer**
- R8. Restyle library page with design prototype's card-based visual language
- R9. Type-specific library cards (editorial italic for testimonials)
- R10. "Send" button on library items opens SendComposer
- R11. SendComposer replaces LibrarySendPanel everywhere
- R12. SendComposer fields: To (typeahead), Channel toggle, Subject, Message body
- R13. On send: log to library_sends with channel, increment send_count, auto-log `faq` signal, copy to clipboard

## Scope Boundaries

- Events page, Page Builder, admin library queue — deferred (see origin)
- Faceted library layout — deferred; accordion structure with card-based styling only
- Briefing center column (library refresh suggestion + event reminder) — deferred; requires events infrastructure and a library-recommendation algorithm. Ship with 2 columns (follow-ups + watch)
- Actual email/SMS/WhatsApp delivery — v1 copies to clipboard and logs
- LLM copilot — remains rules-based
- Sidebar nav — already matches design for champions; admin links (Leaderboard, Champions) added conditionally in Unit 1
- Pipeline/CRM, contact drawer copilot — already shipped, not touched

## Context & Research

### Relevant Code and Patterns

**Layout chain (the reconciliation target):**
- `src/app/hub/layout.tsx` — wraps everything in `HubShell` (sidebar, 240px grid)
- `src/app/hub/(dashboard)/layout.tsx` — adds top nav header + geography gate (inline render, not redirect)
- `src/app/hub/(dashboard)/(champion)/dashboard/page.tsx` — current dashboard page

**Components to reuse:**
- `src/components/shared/progress-bar.tsx` — for thermometer
- `src/components/dashboard/pipeline-summary.tsx` — for dashboard footer
- `src/components/dashboard/heat-pips.tsx` — for briefing items
- `src/components/shared/status-badge.tsx` — for briefing items
- `src/components/ui/toast.tsx` — `useToast()` for send feedback

**Components to replace:**
- `src/components/dashboard/activity-feed.tsx` — replaced by briefing
- `src/components/dashboard/empty-state.tsx` — removed per R7
- `src/components/dashboard/copy-link-button.tsx` — removed per R6
- `src/components/dashboard/library-send-panel.tsx` — replaced by SendComposer

**Components to modify:**
- `src/components/hub/library-accordion.tsx` — migrate from hardcoded content to DB-backed items with card styling
- `src/components/hub/hub-sidebar.tsx` — add conditional admin navigation links
- `src/components/dashboard/drawer-header.tsx` — wire to SendComposer instead of LibrarySendPanel

**Server actions:**
- `src/lib/actions/pipeline.ts` — `recordLibrarySend()` currently hardcodes `channel: 'in-app'` — needs to accept channel from caller via schema
- `src/lib/validations/pipeline-schemas.ts` — `recordLibrarySendSchema` needs `channel` enum added so callers can specify the channel

**Data layer:**
- `src/lib/constants/pipeline.ts` — `ENROLLMENT_THRESHOLD`, `PIPELINE_STAGES`, `CONCERNS`, `ENGAGEMENT_SIGNALS`
- `src/lib/utils/dates.ts` — `daysSince()`
- `src/lib/pipeline/copilot-engine.ts` — `suggestHeat()`, `deriveNextMove()` for briefing logic

### Institutional Learnings

- Geography gate must render inline, never redirect — prevents auth loops (see `docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md`)
- Use `getSupabaseAdminClient()` for ALL DB ops; never anon client in Clerk code (see `docs/solutions/integration-issues/clerk-supabase-vercel-auth-cascade-failure-2026-05-01.md`)
- Use `session.profileId` (UUID) for FK columns, never `session.userId` (Clerk string)
- Call `auth()` once per server component; avoid double auth calls (see `docs/solutions/performance-issues/double-auth-call-hub-page-routing-2026-04-30.md`)
- Server action 6-step pattern: `"use server"` → `requireAuthenticated()` → geography guard → `Zod.safeParse()` → mutation → `audit_log.insert()` → return `ActionResult`
- Font application: always `font-[family-name:var(--font-display)]`, not class-based
- `next/dynamic` with `ssr: false` is broken in Next.js 16 Server Components — use `useEffect` + `useState` mount guard if needed
- Catch-all route + `not-found.tsx` must be preserved so 404s keep the sidebar

## Key Technical Decisions

- **Strip dashboard header, keep gate, add admin links to sidebar** — Remove the top nav header from `(dashboard)/layout.tsx` but preserve the geography gate (inline rendering). The library page already renders with sidebar only (it's outside the `(dashboard)` group); the dashboard is the only page with a redundant header. Admin links (Leaderboard, Champions) currently exist only in the header — add them to `hub-sidebar.tsx` conditionally when `session.role === 'admin'`, or the sidebar must accept an `isAdmin` prop. Both the no-geography branch and the with-geography branch of the layout have headers that must be stripped.
- **Library page migration to DB-backed items** — The current `LibraryAccordion` is entirely hardcoded (YouTube videos, static talking points, external FAQ link). R8-R10 require database-backed items with UUIDs for Send buttons. Migrate the library page to fetch from the `library_items` table. Seed the existing static content as `library_items` rows if not already present. This is a data-layer change, not just a visual refresh.
- **All KPI counts are children-based** — The existing dashboard queries the `children` table joined to prospects for stage counts. KPI "Deposits" means children in committed+enrolled stages. The deposit thermometer tracks children toward `enrollment_threshold`. This preserves the existing query and matches the enrollment semantics.
- **Briefing is two columns, not three** — The prototype has a center column (Refresh + Event Reminder), but events infrastructure doesn't exist and a library-recommendation algorithm is out of scope. Ship with follow-ups + watch only. The center column is deferred.
- **Watch column heuristic** — Cooling off: `days_since_touch > 14 AND heat_score <= 3 AND stage NOT IN ('committed', 'enrolled', 'lost')`, sorted by days_since DESC, top 2. Warming up: prospects with a `signal-toggle` (active=true) in audit_log within last 7 days AND stage IN ('interested', 'shadow-day'), top 2. Simple, deterministic, tunable.
- **"This week" stats via audit_log** — Map stats to existing audit actions: `signal-toggle` with `metadata.signal_id = '1-1'` for 1:1 conversations, `library-send` for library sends, `status-change` for stage changes, `prospect-create` for new contacts. Filter by `created_at >= start_of_week`. No new action types needed.
- **Streak via distinct dates** — Fetch `SELECT DISTINCT DATE(created_at) FROM audit_log WHERE geography_id = $id AND created_at >= now() - interval '90 days' ORDER BY date DESC`, count consecutive days backward from today in application code. The 90-day bound caps result set size while allowing streaks well beyond practical champion activity.
- **SendComposer is clipboard-only in v1** — All channels (email, SMS, WhatsApp, copy link) log the send and copy the composed message to clipboard. The channel value is stored in `library_sends.channel` for future delivery integration.
- **Prospect typeahead for SendComposer** — When opened without a pre-selected contact (from library page), show a typeahead search over the champion's prospects. Fetched from server; filtered client-side.

## Open Questions

### Resolved During Planning

- **Watch column heuristic**: Defined above — cooling off (>14d, low heat, active stage) and warming up (recent signal, early stage)
- **"This week" stats mapping**: All four metrics map to existing audit_log actions. No new action types needed.
- **Streak computation**: Distinct dates from audit_log, consecutive count in application code.
- **Layout reconciliation approach**: Strip header from dashboard layout, keep geography gate.
- **"1:1 conversations logged" data source**: Maps to `audit_log.action = 'signal-toggle'` where `metadata->>'signal_id' = '1-1'` and `metadata->>'active' = 'true'`.

### Deferred to Implementation

- Exact Tailwind class composition for KPI cards, thermometer, briefing — reference design prototype CSS (`artifacts/design_handoff_champions_hub/prototype/champion.css`) during implementation
- Whether PipelineSummary needs prop changes to fit the new dashboard footer layout
- Exact typeahead debounce timing and minimum character threshold for prospect search

## Implementation Units

- [ ] **Unit 1: Layout Reconciliation + Admin Sidebar Links**

**Goal:** Strip the redundant top nav header from the dashboard layout so it renders with sidebar only (the library page already does — it's outside the `(dashboard)` group and was never affected by this header). Add admin navigation links to the sidebar so admins don't lose access to Leaderboard and Champions routes.

**Requirements:** R1 (prerequisite — consistent layout for dashboard redesign)

**Dependencies:** None

**Files:**
- Modify: `src/app/hub/(dashboard)/layout.tsx` (strip both header branches — with-geography and no-geography)
- Modify: `src/components/hub/hub-sidebar.tsx` (add conditional admin links)
- Modify: `src/components/hub/hub-shell.tsx` (pass `isAdmin` prop to sidebar)
- Modify: `src/app/hub/layout.tsx` (compute `isAdmin` from session and pass to HubShell)
- Test: `src/__tests__/hub-layout-reconciliation.test.tsx`

**Approach:**
- Strip `<header>` elements from **both** branches of the dashboard layout: the with-geography branch (lines 42-79) and the no-geography branch (lines 22-38). Both have their own `<header>` with `<UserButton/>` and nav links.
- Preserve the `requireAuth()` call and geography gate (inline `GeographyPicker` rendering when no geography selected). The no-geography branch should render just the `GeographyPicker` inside the `<main>` wrapper, without the standalone `min-h-screen flex flex-col` layout (it's already inside HubShell).
- Remove the `max-w-7xl mx-auto` container constraint — the new dashboard uses full width per the design
- `<UserButton/>` is removed from both branches; users sign out via the sidebar's existing Sign Out button
- **Admin sidebar links**: The current header contains conditional admin links to `/hub/leaderboard` and `/hub/champions` (visible when `session.role === 'admin'`). Add these to `hub-sidebar.tsx` as a new "Admin" section below "Workspace", conditionally rendered when an `isAdmin` prop is true. Thread `isAdmin` from `hub/layout.tsx` → `HubShell` → `HubSidebar`.
- **Auth note**: `hub/layout.tsx` calls `auth()` for basic auth check; `(dashboard)/layout.tsx` calls `requireAuth()` for full session with geography. These serve different purposes (the hub layout also wraps unauthenticated pages like `/hub` intro). Not consolidating in this unit.

**Patterns to follow:**
- `src/app/hub/layout.tsx` — the hub-level layout that wraps in HubShell
- Geography gate pattern from `docs/solutions/best-practices/layout-level-data-gate-geography-picker-2026-05-02.md`
- Existing `WORKSPACE_ITEMS` pattern in `hub-sidebar.tsx` for adding admin items

**Test scenarios:**
- Happy path: Authenticated champion with geography sees dashboard page inside sidebar shell, no top nav header visible
- Happy path: Authenticated champion without geography sees inline GeographyPicker inside sidebar shell, no header
- Happy path: Admin user sees Leaderboard and Champions links in sidebar "Admin" section
- Happy path: Non-admin user does not see Admin section in sidebar
- Edge case: Admin user navigates to `/hub/leaderboard` and `/hub/champions` via sidebar links — routes render correctly
- Integration: Navigate between `/hub/dashboard`, `/hub/pipeline`, `/hub/library` — all render with sidebar only, no layout shift

**Verification:**
- All hub pages render with sidebar as sole navigation — no top header anywhere
- Geography gate still works for users without a selected geography
- Admin routes are navigable via sidebar for admin users
- Non-admin users see no admin links
- No 404s or layout loss when navigating between pages

---

- [ ] **Unit 2: Dashboard Data Layer + KPI Strip + Thermometer**

**Goal:** Rewrite the dashboard server component with all new data queries and render the top two sections: KPI strip and deposit thermometer.

**Requirements:** R1, R2, R3, R6, R7

**Dependencies:** Unit 1 (consistent layout)

**Files:**
- Modify: `src/app/hub/(dashboard)/(champion)/dashboard/page.tsx`
- Create: `src/components/dashboard/kpi-strip.tsx`
- Create: `src/components/dashboard/deposit-thermometer.tsx`
- Test: `src/__tests__/dashboard-kpi-strip.test.tsx`
- Test: `src/__tests__/dashboard-deposit-thermometer.test.tsx`

**Approach:**
- Rewrite the server component to fetch in parallel via `Promise.all`:
  - Child counts by stage (existing query)
  - Geography details including `enrollment_threshold` (extend existing query)
  - Status history for 14-day deposit delta: `WHERE changed_at >= now() - 14 days AND new_status IN ('committed', 'enrolled') AND old_status NOT IN ('committed', 'enrolled')` — excludes intra-deposit transitions (committed→enrolled) to count only net new deposits
  - Distinct audit_log dates for streak computation
- Remove imports of `ActivityFeed`, `EmptyState`, `CopyLinkButton`
- KPI strip is a client component receiving computed values as props (all counts are children-based, matching existing query):
  - Deposits: children in `committed + enrolled` stages, delta from status_history (net new deposits only)
  - Active Pipeline: children in `interested + shadow-day` stages
  - Total Contacts: children across all stages
  - Streak: consecutive days computed from distinct dates array
- Featured Deposits card: `bg-alpha-blue text-white`, `font-display font-extrabold text-4xl`
- Deposit thermometer: reuse `ProgressBar` component, add tick marks, geography eyebrow in `font-display tracking-widest uppercase text-xs text-ink-4`, "opening day" in `font-editorial italic`
- Always render full layout regardless of data — no empty state branching

**Patterns to follow:**
- `src/app/hub/(dashboard)/(champion)/pipeline/page.tsx` — parallel data fetching pattern with `Promise.all`
- `src/components/dashboard/copilot-card.tsx` — gradient card pattern (for featured KPI card)
- `src/components/shared/progress-bar.tsx` — progress bar component
- Design reference: `artifacts/design_handoff_champions_hub/prototype/dashboard.jsx` lines 6–66

**Test scenarios:**
- Happy path: Dashboard renders KPI strip with correct counts (3 committed + 2 enrolled = 5 deposits)
- Happy path: Thermometer shows correct progress percentage against geography's enrollment_threshold
- Happy path: Streak shows correct consecutive day count (e.g., 3 consecutive days of activity = "3d")
- Edge case: Zero prospects — all KPIs show 0, thermometer at 0%, streak at 0d
- Edge case: Geography with non-default enrollment_threshold (e.g., 50) — thermometer scales correctly
- Edge case: Deposit delta with no status changes in 14 days — shows "+0"
- Edge case: Streak broken by a gap day — resets to count from most recent consecutive run

**Verification:**
- Dashboard page loads with KPI strip and thermometer showing live data
- No empty state rendered, even with zero data
- Copy-link button is gone
- All numbers match what the database queries return

---

- [ ] **Unit 3: Today's Briefing + Two-Column Footer**

**Goal:** Add the briefing card (follow-ups + watch) and the two-column footer (pipeline summary + this-week stats) to complete the dashboard layout.

**Requirements:** R1, R4, R5

**Dependencies:** Unit 2 (page structure and data layer)

**Files:**
- Modify: `src/app/hub/(dashboard)/(champion)/dashboard/page.tsx` (add data fetching for briefing + stats)
- Create: `src/components/dashboard/todays-briefing.tsx`
- Create: `src/components/dashboard/this-week-stats.tsx`
- Test: `src/__tests__/dashboard-briefing.test.tsx`
- Test: `src/__tests__/dashboard-this-week-stats.test.tsx`

**Approach:**
- Extend the server component's `Promise.all` to also fetch:
  - Prospects with `heat_score`, `last_touch_at`, `status` for follow-up ranking and watch column
  - Audit_log aggregation for this-week stats (filtered by `created_at >= start_of_current_week`)
- **Follow-ups** (column 1): Filter prospects to `stage NOT IN ('committed', 'enrolled', 'lost')`, compute `heat_score * 4 + daysSince(last_touch_at ?? created_at)` for each (fall back to `created_at` when `last_touch_at` is null — use `COALESCE(last_touch_at, created_at)` in the query), sort descending, take top 3. Each item shows avatar initials, name, heat pips, days-since, stage badge. Clicking navigates to `/hub/pipeline?prospect={id}`.
- **Watch** (column 2): Two sub-sections:
  - Cooling off: `days_since_touch > 14 AND heat_score <= 3 AND stage NOT IN ('committed', 'enrolled', 'lost')`, top 2 by days_since DESC. Warning-styled avatar.
  - Warming up: Prospects with `signal-toggle` (active=true) in audit_log within 7 days AND stage IN ('interested', 'shadow-day'), top 2. Success-styled avatar.
- **Briefing header**: Date string + "Today's Briefing" label
- **Empty state per column**: "Nothing yet" when no items match
- **This-week stats**: Query audit_log for current week, count by action type:
  - `signal-toggle` where `metadata->>'signal_id' = '1-1'` AND `metadata->>'active' = 'true'` → "1:1 conversations"
  - `library-send` → "Library sends"
  - `status-change` → "Stage changes"
  - `prospect-create` → "New contacts"
- **Footer layout**: Two columns at `2fr 1fr` ratio (Pipeline Summary wider) — existing `PipelineSummary` on left, `ThisWeekStats` on right

**Patterns to follow:**
- `src/lib/pipeline/copilot-engine.ts` — scoring/ranking logic pattern
- `src/lib/utils/dates.ts` — `daysSince()` for touch computation
- `src/components/dashboard/pipeline-summary.tsx` — existing footer component
- Design reference: `artifacts/design_handoff_champions_hub/prototype/dashboard.jsx` lines 68–185

**Test scenarios:**
- Happy path: Briefing shows top 3 follow-ups correctly ranked by `heat*4 + days_since`
- Happy path: Watch column shows cooling-off and warming-up contacts with correct criteria
- Happy path: This-week stats show correct counts for each metric
- Edge case: No prospects match follow-up criteria — column shows "Nothing yet"
- Edge case: No cooling-off or warming-up contacts — watch column shows "Nothing yet"
- Edge case: No audit activity this week — all stats show 0
- Edge case: Prospect with null `last_touch_at` — falls back to `created_at` for days-since computation
- Integration: Clicking a follow-up item navigates to pipeline page with prospect selected

**Verification:**
- Full four-section dashboard layout matches the design prototype
- Briefing follow-ups are ranked correctly and link to prospect detail
- This-week stats reflect actual audit_log entries for the current week

---

- [ ] **Unit 4: SendComposer Modal + Server Action Update**

**Goal:** Build the SendComposer modal and update `recordLibrarySend` to accept a channel parameter. This becomes the single send flow for both the library page and the contact drawer.

**Requirements:** R11, R12, R13

**Dependencies:** None (can be built in parallel with Units 2-3)

**Files:**
- Create: `src/components/dashboard/send-composer.tsx` (includes inline prospect typeahead)
- Modify: `src/lib/actions/pipeline.ts` (`recordLibrarySend` — accept channel from caller)
- Modify: `src/lib/validations/pipeline-schemas.ts` (`recordLibrarySendSchema` — add channel enum)
- Modify: `src/__tests__/actions/pipeline-actions.test.ts` (update existing `recordLibrarySend` tests to pass channel field)
- Test: `src/__tests__/send-composer.test.tsx`

**Approach:**
- **Server action update**: Add `channel: z.enum(["email", "sms", "whatsapp", "link"])` to `recordLibrarySendSchema`. Update `recordLibrarySend` to pass the channel value to the `library_sends` insert instead of hardcoding `'in-app'`. Add optional `auto_log_signal: z.boolean().default(true)` — when true, also toggle the `faq` engagement signal on the prospect. The `faq` signal (signal_id `'faq'` in `ENGAGEMENT_SIGNALS`) is used for all library sends regardless of item type — the semantic is "sent library content," not "sent an FAQ specifically." The `library_sends` table captures the granular item type. **Implementation approach:** Inline the signal array update and audit_log insert within `recordLibrarySend` (extract shared logic from `toggleSignal` into a helper if needed). Do NOT call `toggleSignal` as a nested action — it has its own `requireAuthenticated()` call which would violate the "single auth per action" pattern. When `auto_log_signal` is false, the `library_sends` row is still inserted — only the signal toggle is skipped.
- **Modal component** (`send-composer.tsx`): Client component. Props: `libraryItem: LibraryItem`, `prospect?: ProspectSummary`, `prospects: ProspectSummary[]` (for typeahead), `onClose: () => void`.
  - Backdrop overlay (same pattern as contact drawer backdrop)
  - "To" field: if prospect provided, show pre-filled and read-only. If not, render `ProspectTypeahead` component that filters the prospects array client-side.
  - Channel toggle: four buttons (Email, SMS, WhatsApp, Copy link). Default selection: Email (matching prototype). Active state styling per design tokens. Re-clicking active channel does not deselect — one channel must always be selected.
  - Subject: auto-generated as `"For you, {firstName}: {item.title}"`, editable input. Visible for Email only; hidden for SMS/WhatsApp/Copy link.
  - Message body: templated textarea with item content, editable
  - Auto-log checkbox: "Auto-log as 'Sent FAQ' on {contact}", defaulting to checked
  - "Send & log" button: calls updated `recordLibrarySend`, copies message to clipboard via `navigator.clipboard.writeText()`, shows toast ("Copied to clipboard & logged"), calls `onClose()` + `router.refresh()`
- **Prospect typeahead** (inline in SendComposer): Simple input + filtered dropdown from the prospects array. Filter by name, show name + email. No server-side search — the prospect list is pre-fetched and passed as props. No separate component file — inline as a sub-component within `send-composer.tsx`.

**Patterns to follow:**
- `src/components/dashboard/library-send-panel.tsx` — existing send UI pattern (optimistic state, toast on success)
- `src/components/dashboard/contact-drawer.tsx` — backdrop overlay pattern
- `src/lib/actions/pipeline.ts` — 6-step server action pattern
- Design reference: `artifacts/design_handoff_champions_hub/prototype/other-screens.jsx` `SendComposer` component

**Test scenarios:**
- Happy path: Open composer with pre-filled contact, select channel, send — library_sends row created with correct channel, send_count incremented, faq signal toggled
- Happy path: Open composer without contact, search and select via typeahead — same send flow works
- Happy path: Message copied to clipboard on successful send, toast shown
- Edge case: Auto-log checkbox unchecked — library_sends created but faq signal NOT toggled
- Edge case: Prospect already has `faq` in engagement_signals — toggling is idempotent, no duplicate
- Error path: Server action fails (e.g., prospect deleted between open and send) — error toast shown, modal stays open
- Edge case: "Copy link" channel selected — same flow (log + clipboard), no difference in v1
- Edge case: Empty prospect list in typeahead (new geography with no prospects) — typeahead shows "No prospects yet"

**Verification:**
- SendComposer modal opens, composes, and sends from both library and contact drawer contexts
- `library_sends` rows have correct channel values instead of `'in-app'`
- Engagement signal auto-logged when checkbox is checked
- Clipboard contains the composed message after send
- Toast confirms the action

---

- [ ] **Unit 5: Library Migration + Visual Refresh + Contact Drawer Integration**

**Goal:** Migrate the library page from hardcoded static content to database-backed `library_items`. Restyle with card-based design matching the prototype. Wire "Send" buttons to the SendComposer. Replace LibrarySendPanel in the contact drawer with SendComposer.

**Requirements:** R8, R9, R10, R11

**Dependencies:** Unit 4 (SendComposer must exist)

**Files:**
- Modify: `src/app/hub/library/page.tsx` (convert to server component, fetch library_items + prospects)
- Modify: `src/components/hub/library-accordion.tsx` (accept DB-backed items as props, restyle with cards)
- Modify: `src/components/dashboard/drawer-header.tsx` (replace LibrarySendPanel trigger with SendComposer)
- Delete: `src/components/dashboard/library-send-panel.tsx` (replaced by SendComposer)
- Delete: `src/__tests__/components/dashboard/library-send-panel.test.tsx` (tests for removed component)
- Test: `src/__tests__/hub-library-page.test.tsx` (update existing tests)
- Test: `src/__tests__/library-send-integration.test.tsx`

**Approach:**
- **Library page data migration**: The current `LibraryAccordion` is a `"use client"` component with entirely hardcoded content: 23 YouTube video objects, 10 static talking points, and an external FAQ link. None have `library_item_id` UUIDs, so R10 (Send buttons) is impossible without database backing. Convert `library/page.tsx` to a server component that fetches `library_items` from the database (grouped by `type`) plus the champion's prospects for the typeahead. Pass both as props to a refactored `LibraryAccordion`.
- **Prerequisite: library items must exist in DB.** The `library_items` table already exists and is used by the contact drawer's send flow. Verify that sufficient items are seeded (admin-managed or migration-seeded). If the existing static content (videos, talking points) should appear on the library page, they need corresponding `library_items` rows. This seeding is a prerequisite — if items don't exist, the page will be empty. **Decision: seeding strategy is an implementation-time concern** — check what's already in the table and seed if needed.
- **Library accordion restyle**: Refactor `LibraryAccordion` to accept `items: LibraryItem[]` as a prop (instead of hardcoded arrays). Keep the accordion expand/collapse structure, grouping items by `type`. Within each section, render items as cards with type-specific styling:
  - `quote` type: Lead with body text in `font-editorial italic`, author attribution below
  - `faq`/`talking`/`data` types: Lead with title in `font-display font-bold`, body excerpt below
  - Each card gets a "Send →" button in the footer
  - Card chrome: `bg-paper rounded-xl border border-line p-5` with type-colored accent
- **Send button wiring**: Clicking "Send" on a library card opens SendComposer in modal overlay with the item pre-loaded and the prospect list available for typeahead.
- **Contact drawer integration**: In `drawer-header.tsx`, replace the "Answers to concerns" button (which opens LibrarySendPanel) with a "Send from library" button that opens SendComposer with the current prospect pre-filled. The library items list is already available in the drawer context.
- **Remove LibrarySendPanel**: After wiring SendComposer everywhere, delete `library-send-panel.tsx` and its test file. Verify zero remaining imports.

**Patterns to follow:**
- `src/app/hub/(dashboard)/(champion)/pipeline/page.tsx` — server component data fetching pattern
- `src/components/dashboard/copilot-card.tsx` — card styling with gradient accents
- `artifacts/design_handoff_champions_hub/prototype/library.jsx` `GridCard` — card layout reference (applies to card internals, not surrounding layout)
- `src/components/dashboard/drawer-header.tsx` — current button wiring pattern

**Test scenarios:**
- Happy path: Library page renders DB-backed items as card-styled cards, testimonial cards use editorial italic
- Happy path: Clicking "Send" on a library card opens SendComposer modal with item pre-loaded
- Happy path: From contact drawer, "Send from library" opens SendComposer with prospect pre-filled
- Edge case: Library page with no library items in the database — accordion sections render empty gracefully with "No items yet" state
- Edge case: Library items exist but champion has no prospects — Send button opens SendComposer with empty typeahead showing "No prospects yet"
- Integration: Complete flow — browse library → click Send → select prospect via typeahead → compose → send → logged in library_sends
- Integration: Contact drawer → Send from library → compose → send → drawer still shows updated signal

**Verification:**
- Library page renders items from the database, not hardcoded content
- Library page visually matches the design prototype's card language
- Send flow works from both the library page and the contact drawer
- LibrarySendPanel is no longer used in any active code path

## System-Wide Impact

- **Interaction graph:** SendComposer replaces LibrarySendPanel in two entry points (library page, contact drawer). The `recordLibrarySend` server action gains a channel parameter — all existing callers must be updated (only LibrarySendPanel, which is being replaced).
- **Error propagation:** Server action errors surface via toast (existing pattern). Clipboard API failures should be caught and shown as a degraded toast ("Logged, but clipboard copy failed").
- **State lifecycle risks:** The dashboard is fully server-rendered with no client state. SendComposer has transient modal state only — no persistence risk. The typeahead prospect list is a snapshot from page load; stale data risk is minimal for this use case.
- **API surface parity:** No external API changes. All mutations remain server actions.
- **Integration coverage:** SendComposer → `recordLibrarySend` → `library_sends` insert + `send_count` increment + optional signal toggle must be tested as an integrated flow.
- **Unchanged invariants:** Pipeline stages, allowed transitions, copilot engine, heat scoring, concern tracking, notes — all untouched. The contact drawer's copilot card, activity timeline, and signal grid remain as-is.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Layout reconciliation breaks admin routes | Admin links added to sidebar in Unit 1. Test admin navigation via sidebar. |
| Library page empty after migration (no DB items) | Verify library_items table is seeded before deploying. Graceful empty state for zero items. |
| Dashboard data fetching becomes slow with multiple parallel queries | Use `Promise.all` for parallelism; queries use indexed columns. Monitor query count. Note: `status_history` lacks a `(geography_id, changed_at)` index — acceptable at current scale but monitor. |
| Streak computation with large audit_log | Query bounded to 90 days and uses existing `(geography_id, created_at DESC)` index. |
| LibrarySendPanel removal breaks contact drawer | Unit 5 explicitly wires the replacement before removing. Test both entry points. |
| Clipboard API unavailable (non-HTTPS, Firefox restrictions) | Wrap `navigator.clipboard.writeText()` in try/catch; show degraded toast on failure. |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-06-champions-hub-visual-overhaul-requirements.md](docs/brainstorms/2026-05-06-champions-hub-visual-overhaul-requirements.md)
- **Design handoff:** `artifacts/design_handoff_champions_hub/README.md` and `prototype/` directory
- **Pipeline CRM patterns:** `docs/solutions/best-practices/pipeline-crm-feature-patterns-2026-05-02.md`
- **Auth layout patterns:** `docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md`
- **Geography gate pattern:** `docs/solutions/best-practices/layout-level-data-gate-geography-picker-2026-05-02.md`
- **Auth cascade failures:** `docs/solutions/integration-issues/clerk-supabase-vercel-auth-cascade-failure-2026-05-01.md`
