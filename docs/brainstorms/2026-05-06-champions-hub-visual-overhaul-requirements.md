---
date: 2026-05-06
topic: champions-hub-visual-overhaul
---

# Champions Hub Visual Overhaul

## Problem Frame

Champions (parent volunteers recruiting families for Alpha campuses) have a functional but basic dashboard — it shows pipeline counts and an activity feed. The design handoff in `artifacts/design_handoff_champions_hub/` defines a significantly richer experience: a data-dense dashboard, a refreshed content library, and a send-to-prospect composer. The underlying data infrastructure (heat scores, concerns, engagement signals, library items/sends, audit log) is already built. This work closes the gap between the shipped backend and the intended champion experience.

The sidebar navigation, pipeline CRM (table + kanban), contact drawer with copilot, and all schema/data work are already shipped and not changing.

## Requirements

**Dashboard Redesign**

- R1. Replace the current dashboard page (`/hub/dashboard`) with the design's four-section stacked layout: KPI strip, deposit thermometer, Today's Briefing, and two-column footer.
- R2. KPI strip: 4 cards in a row — Deposits (featured, blue), Active Pipeline, Total Contacts, Streak (consecutive days with at least one logged action). Deposits card is visually prominent with `alpha-blue` background and large display type. Each card includes a delta sub-label (e.g. "+2 in the last 14 days" for Deposits, computed from status_history over a rolling 14-day window).
- R3. Deposit thermometer: full-width card showing the geography's progress toward its enrollment threshold (from the geography's `enrollment_threshold` column, default 25). Includes geography name as eyebrow, "Toward opening day" headline with editorial italic accent, deposit count, and a progress bar with tick marks.
- R4. Today's Briefing: two-column card. Column 1: top 3 follow-ups from prospects not in committed, enrolled, or lost stages, ranked by `(heat * 4 + days_since_touch)`. Column 2: "Watch" — contacts cooling off (high days-since, declining heat) and warming up (recent positive signals). Each item links to its detail view. Empty columns render gracefully with a "Nothing yet" state.
- R5. Two-column footer: existing Pipeline Summary component on the left, "This week" stats on the right (1:1 conversations logged, library sends, stage changes, new contacts added).
- R6. Remove the "Copy intake link" button from the dashboard. It does not appear in the design.
- R7. Remove the separate empty state. The dashboard always renders the full layout with zeros when there are no leads.

**Library Page Visual Refresh**

- R8. Restyle the existing `/hub/library` page (currently a `LibraryAccordion` with 4 items: FAQs, testimonials, talking points, data) to match the design prototype's visual language — card-based presentation with type-specific styling, while keeping the current content and accordion structure.
- R9. Library cards are type-specific: testimonial cards lead with the quote body in editorial italic (`font-editorial`); other types lead with the title + body excerpt. Use the design's color and typography tokens.
- R10. Each library item gains a "Send" button that opens the SendComposer modal (see R13–R15).

**SendComposer Modal**

- R11. New modal component replacing the existing `LibrarySendPanel` as the single send flow everywhere. Triggered from library page items (R10) and from the contact drawer's send button (replacing the current "Answers to concerns" panel).
- R12. Fields: To (pre-filled if opened from a contact; typeahead search over the champion's prospects if opened from the library page), Channel toggle (Email / SMS / WhatsApp / Copy link), Subject (auto-generated from item + contact name), Message body (templated, editable).
- R13. On send: insert a `library_sends` row with the selected channel, increment the library item's `send_count`, and optionally auto-log the `faq` engagement signal on the prospect regardless of library item type. Checkbox to control auto-logging, defaulting to checked. V1 logs the send and copies content to clipboard — actual email/SMS/WhatsApp delivery is deferred.

## Success Criteria

- A champion logging into `/hub/dashboard` sees KPIs, thermometer progress, and a prioritized daily briefing — not a flat list of counts.
- A champion can browse library content and send items to prospects with channel choice, with the send logged automatically.
- The library page feels visually refreshed and consistent with the design prototype's card-based styling.
- The SendComposer is the single send flow from both the library page and the contact drawer.
- All pages use the existing sidebar nav and feel visually consistent with the design prototype.
- Dashboard renders cleanly with zero data (new geography, no leads yet).

## Scope Boundaries

- **Events page** — deferred. Requires an `events` table and RSVP-to-prospect ingestion system that don't exist yet. The `/hub/events` placeholder remains as-is.
- **Page Builder** — deferred to a follow-up. The `/hub/my-page` route and champion landing pages are not part of this work.
- **Admin library queue** — the design mentions champions submitting items for admin approval. Deferred; library content is assumed to be pre-populated or admin-managed for now.
- **Faceted library layout** — the design shows a filter sidebar + 2-column grid, but we don't have enough content to justify it. Keeping the current accordion structure with a visual refresh instead.
- **LLM-powered copilot** — copilot remains rules-based. No LLM integration.
- **Sidebar nav changes** — the sidebar already matches the design. No changes needed.
- **Pipeline/CRM, copilot card** — already shipped. Not touched by this work.
- **Actual email/SMS/WhatsApp delivery** — SendComposer v1 logs the send and copies content to clipboard. Real delivery is a follow-up.

## Key Decisions

- **No empty state**: The dashboard renders the full layout with zeros rather than showing a separate onboarding card. Rationale: the thermometer and briefing still communicate the goal and next steps even at zero.
- **Remove copy-link button**: Not in the design; the dashboard focuses on pipeline intelligence, not link distribution.
- **Library visual refresh, not rebuild**: Keep the existing accordion with 4 items; apply design prototype's card styling and typography. Not enough content to justify a full faceted layout.
- **Single send flow**: Replace the existing `LibrarySendPanel` (copy-and-mark) with the new `SendComposer` modal everywhere. One component, one UX.
- **All sends log as `faq` signal**: The signal effectively means "sent library content." Renaming or adding per-type signals is deferred — `library_sends` captures the granular item type.
- **Events deferred**: No events table exists; building one plus the RSVP ingestion system is too much scope for this round.
- **Page Builder deferred**: Lowest priority per the design handoff, wireframe-fidelity only. Ship the core hub experience first.

## Dependencies / Assumptions

- Library items exist in the database (seeded or admin-created). This work builds the browse/send UI, not a content creation flow for champions.
- The "Streak" KPI (R2) requires computing consecutive days with logged actions from the audit log. This is a query concern, not a schema concern.
- The dashboard page currently lives in the `(dashboard)/(champion)/` layout group which renders a top nav header. The library page lives under the `hub` layout with the sidebar. Planning must reconcile these so all pages render within the sidebar shell consistently.

## Outstanding Questions

### Deferred to Planning

- [Affects R4][Needs research] What query strategy computes the briefing's "Watch" column (cooling-off and warming-up contacts)? Likely derived from heat score trends and days-since-touch, but the exact heuristic needs to be defined.
- [Affects R5][Technical] Does the "This week" stats panel need a new query, or can it be derived from the existing audit_log table? Note: "1:1 conversations logged" has no matching audit_log action type — planning must decide how to map or add one.
- [Affects R2][Technical] How is the Streak KPI (consecutive days with logged actions) computed from the audit_log? Needs a query strategy.
- [Affects R1][Technical] The dashboard route lives in `(dashboard)/(champion)/` with a top nav header layout. It needs to render within the sidebar `HubShell` like the library page does. Planning must decide whether to move the route or refactor the layout.

## Next Steps

-> `/ce:plan` for structured implementation planning
