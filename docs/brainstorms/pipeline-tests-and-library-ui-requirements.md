---
date: 2026-05-02
topic: pipeline-tests-and-library-ui
---

# Pipeline CRM: Test Coverage + Library Send UI

## Problem Frame

The Pipeline CRM feature shipped with test coverage for the co-pilot engine and Zod schemas (42 tests) but no tests for the 5 server actions or key UI components. These are the highest-risk code paths — auth guards, geography checks, database mutations, and audit logging. A code review flagged this as the primary coverage gap.

Separately, the co-pilot card recommends "Send a library item addressing [concern]" but champions can't act on that recommendation. The `library_items` and `library_sends` tables are seeded and ready, a "Send from library" button exists in the drawer header (hidden behind `LIBRARY_UI_ENABLED = false`), and `sentConcerns` is always an empty Set — so rule 3 fires for every prospect with concerns. Wiring the library send UI completes the co-pilot feedback loop.

## Requirements

**Server Action Tests**

- R1. Test all 5 server actions in `src/lib/actions/pipeline.ts`: `createPipelineProspect`, `toggleSignal`, `updateConcerns`, `overrideHeat`, `addPipelineNote`.
- R2. Each action test covers: (a) success path with valid input, (b) rejection when geography is null, (c) rejection when Zod validation fails, (d) rejection when prospect belongs to a different geography ("Access denied").
- R3. `createPipelineProspect` test verifies the prospect is created with `status: "interested"`, `heat_score: 3`, and `consent_given: true`.
- R4. `toggleSignal` test verifies signals are added/removed correctly and `last_touch_at` is updated.

**Component Tests**

- R5. Test `pipeline-table.tsx`: renders prospect rows, shows correct stage badges, displays heat pips, and renders the "Next Action" column from the co-pilot engine.
- R6. Test `pipeline-filters.tsx`: stage and neighborhood filter pills correctly filter the displayed data, and clearing filters restores the full list.
- R7. Test `copilot-card.tsx`: renders the briefing summary and next-move recommendation for a given prospect. Shows the empty state when prospect has no concerns or signals.
- R8. Test `contact-drawer.tsx`: renders the drawer when a prospect is selected, displays the header with prospect name and stage, and closes when Escape is pressed.

**Library Send UI**

- R9. Flip `LIBRARY_UI_ENABLED` to `true`. The "Send from library" button appears in the drawer header.
- R10. Clicking the button opens a panel showing library items relevant to the prospect's active concerns. Items are grouped by concern with the concern label as a section header.
- R11. Each library item shows its title, type badge (FAQ, Talking Point, Data Point, Quote), and body content so the champion can read it in-app.
- R12. Each item has a "Mark as sent" button. Clicking it inserts a row into `library_sends` with the prospect ID, library item ID, champion ID, geography ID, channel "in-app", and current timestamp. The button then shows "Sent" (disabled) for that item.
- R13. After marking an item as sent, the co-pilot's `sentConcerns` Set includes that concern on the next page refresh. Rule 3 ("Send a library item addressing [concern]") no longer fires for concerns that have at least one sent item.
- R14. If a prospect has no active concerns, the library panel shows a message like "No concerns recorded — add concerns to see relevant library items."
- R15. The library panel is dismissible (close button or click outside).

## Success Criteria

- All 5 server actions have passing tests covering the 4 scenarios in R2.
- Key components render correctly in tests with mocked data.
- A champion can open the library panel from the drawer, read an item, mark it as sent, and see the co-pilot recommendation change on refresh.
- `sentConcerns` is populated from `library_sends` data, completing the co-pilot feedback loop.

## Scope Boundaries

- No email or SMS delivery — "sending" means the champion reads the content in-app and shares it via their own communication channel, then logs it.
- No library item CRUD for champions — seed data is the starting set; admin editing is a future feature.
- No helpfulness scoring UI — `helpfulness_score` and `send_count` fields exist but are not surfaced yet.
- No drag-and-drop or reordering of library items.
- Tests mock Supabase and auth — no integration tests hitting a real database.

## Key Decisions

- **Log-only send model**: Champion reads the item, shares externally, taps "Mark as sent." No message leaves the app. Matches how champions already communicate with families and avoids complexity around email templates, delivery tracking, and optional `parent_email`.
- **Channel field set to "in-app"**: The `library_sends.channel` column supports future channels (email, sms) but v1 always records "in-app".
- **sentConcerns derived from library_sends**: A concern is "addressed" if at least one library item with that concern has been sent to that prospect. This is the simplest meaningful definition.

## Dependencies / Assumptions

- `library_items` table is seeded with ~14 items covering all 8 concerns (done in migration 007).
- `library_sends` table exists with the required schema (done in migration 007).
- The pipeline page server component already fetches `library_sends` for the selected prospect (done).
- Existing vitest + @testing-library/react setup supports component testing (verified — 29 test files already pass).

## Outstanding Questions

### Deferred to Planning
- [Affects R10][Technical] Where should the library panel render — a sub-panel within the drawer, a modal overlay, or a popover from the button? The drawer is already 920px; a sub-panel might feel cramped. Planning should evaluate the options.
- [Affects R12][Technical] Should the "Mark as sent" action use a new server action or extend an existing one? Planning should decide based on the established pipeline action pattern.

## Next Steps

-> `/ce:plan` for structured implementation planning
