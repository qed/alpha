---
title: "feat: Pipeline server action tests, component tests, and library send UI"
type: feat
status: active
date: 2026-05-02
origin: docs/brainstorms/pipeline-tests-and-library-ui-requirements.md
---

# Pipeline Tests + Library Send UI

## Overview

Add test coverage for the 5 pipeline server actions and 4 key UI components that shipped without tests, then build the library send UI so champions can mark library items as sent to prospects — completing the co-pilot feedback loop where rule 3 stops firing for addressed concerns.

## Problem Frame

The Pipeline CRM shipped with 42 tests covering the co-pilot engine and Zod schemas but zero tests for the 5 server actions (`createPipelineProspect`, `toggleSignal`, `updateConcerns`, `overrideHeat`, `addPipelineNote`) or the 4 key components (pipeline-table, pipeline-filters, copilot-card, contact-drawer). These are the highest-risk code paths — auth guards, geography checks, database mutations, and audit logging.

Separately, the co-pilot card recommends "Send a library item addressing [concern]" but champions cannot act on it. `sentConcerns` is hardcoded as an empty Set (copilot-card.tsx:64, pipeline-table.tsx:210), so rule 3 fires for every prospect with concerns. The `library_items` and `library_sends` tables exist (migration 007), a "Send from library" button is hidden behind `LIBRARY_UI_ENABLED = false`, and the data plumbing (`librarySends` on `SelectedProspectDetail`) is in place. Wiring the UI completes the feedback loop.

(see origin: `docs/brainstorms/pipeline-tests-and-library-ui-requirements.md`)

## Requirements Trace

### Test Coverage (R1–R8)

- R1. Test all 5 server actions in `src/lib/actions/pipeline.ts`
- R2. Each action test covers: success path, null geography rejection, Zod validation failure, access denied (wrong geography)
- R3. `createPipelineProspect` verifies `status: "interested"`, `heat_score: 3`, `consent_given: true`
- R4. `toggleSignal` verifies signals added/removed and `last_touch_at` updated
- R5. Test pipeline-table: rows, stage badges, heat pips, "Next Action" column
- R6. Test pipeline-filters: stage/neighborhood pills filter data, clearing restores full list
- R7. Test copilot-card: briefing summary, next-move recommendation, empty state
- R8. Test contact-drawer: renders when selected, header with name/stage, Escape closes

### Library Send UI (R9–R15)

- R9. Flip `LIBRARY_UI_ENABLED` to `true`
- R10. Library panel shows items grouped by concern
- R11. Each item shows title, type badge, and body content
- R12. "Mark as sent" inserts into `library_sends`, button shows "Sent" (disabled)
- R13. `sentConcerns` populated from `library_sends`; rule 3 stops firing for addressed concerns
- R14. Empty state when prospect has no concerns
- R15. Library panel dismissible (close button or backdrop click)

## Scope Boundaries

- No email/SMS delivery — "sending" means log-only (see origin: Key Decisions)
- No library item CRUD — seed data is the starting set
- No helpfulness scoring UI
- No drag-and-drop reordering of items
- Tests mock Supabase and auth — no integration tests hitting a real database
- `audit_log_action_check` constraint (migration 007) includes `prospect-create`, `note-add`, `signal-toggle`, `concern-update`, and `heat-override`; a new `library-send` value requires altering the constraint in migration 008
- Duplicate library sends are acceptable — re-sending the same item is a valid use case (no UNIQUE constraint on library_item_id + prospect_id)

## Context & Research

### Relevant Code and Patterns

- `src/lib/actions/pipeline.ts` — the 5 actions following the 6-step pattern (Pattern 5 from feature patterns doc)
- `src/__tests__/actions/prospect-actions-auth.test.ts` — canonical server action test pattern: mock `requireAuthenticated` + mock Supabase client + test null geography / validation / access denied / happy path
- `src/__tests__/actions/champion-actions.test.ts` — complex Supabase mock with table-switching `from()`, mutable result variables reset in `beforeEach`
- `src/__tests__/components/dashboard/` — component test patterns with factory functions, `next/navigation` mocks
- `src/components/dashboard/drawer-header.tsx:189` — existing "Send from library" button behind `LIBRARY_UI_ENABLED` flag
- `src/components/dashboard/copilot-card.tsx:64` — `sentConcerns = new Set<string>()` placeholder
- `src/components/dashboard/pipeline-table.tsx:210` — `deriveNextMove(copilotData, new Set())` placeholder
- `src/components/dashboard/contact-drawer.tsx` — `SelectedProspectDetail` type with `librarySends: DrawerLibrarySend[]`
- `supabase/migrations/007_pipeline_enhancements.sql` — `library_items` and `library_sends` table schemas, 14 seed items

### Institutional Learnings

- Pipeline CRM Feature Patterns (`docs/solutions/best-practices/pipeline-crm-feature-patterns-2026-05-02.md`) — server action 6-step sequence, dual Supabase client pattern, URL-driven drawer pattern
- Auth redirect loop fix (`docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md`) — `requireAuthenticated()` returns `SessionInfo { userId, role, geographyId }`, null-geography guard pattern with explicit test example
- Clerk v7 auth requires middleware (`docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md`) — must mock `@clerk/nextjs/server` at module level in tests to bypass middleware detection

## Key Technical Decisions

- **Library panel as modal overlay**: The drawer is 920px with a two-column layout; adding a sub-panel inside would be cramped. A modal overlay at z-50 (above drawer's z-40) gives adequate space for browsing items grouped by concern with full body content visible. Dismiss via close button or clicking the backdrop.
- **New `recordLibrarySend` server action**: Follows the one-action-one-mutation convention. Gets its own Zod schema, audit action type (`library-send`), and test coverage. Consistent with the 5 existing pipeline actions.
- **sentConcerns derived from library_sends join**: The server component query for library_sends expands to join `library_items` to include the `concern` field. This keeps the derivation server-side and avoids passing the full library_items catalog to the client.
- **New migration for audit_log constraint**: The existing `audit_log_action_check` constraint (migration 007) does not include `library-send`. A small migration (008) drops and recreates the constraint with the new value.

## Open Questions

### Resolved During Planning

- **Library panel placement** (origin doc deferred Q1): Modal overlay at z-50, dismissed via close button or backdrop click. Rationale: drawer is already 920px, a sub-panel would cramp the content; a popover is too small for item bodies.
- **Server action pattern** (origin doc deferred Q2): New `recordLibrarySend` action following the 6-step pattern. Rationale: consistent with one-action-one-mutation convention used by all 5 existing actions.
- **How to populate sentConcerns**: Expand the `library_sends` select in `pipeline/page.tsx` to join `library_items(concern)`. Add `concern` field to `DrawerLibrarySend` type. Copilot card builds `sentConcerns` from `prospect.librarySends.map(s => s.concern).filter(Boolean)`.

### Deferred to Implementation

- **Exact Supabase relational query syntax** for the library_sends → library_items join: depends on whether Supabase client supports the nested select or needs a separate query.
- **Library item filtering query**: Whether to fetch all items for a geography and filter client-side, or query by concern array server-side. Depends on total item count (currently 14, so client-side is fine).

## Implementation Units

- [ ] **Unit 1: Pipeline server action tests**

  **Goal:** Test all 5 pipeline server actions with comprehensive coverage.

  **Requirements:** R1, R2, R3, R4

  **Dependencies:** None

  **Files:**
  - Create: `src/__tests__/actions/pipeline-actions.test.ts`
  - Reference: `src/lib/actions/pipeline.ts`
  - Reference: `src/lib/validations/pipeline-schemas.ts`

  **Approach:**
  - One `describe` block per action, following the `prospect-actions-auth.test.ts` and `champion-actions.test.ts` mocking patterns
  - Mock `requireAuthenticated` via `vi.fn()` at module level
  - Mock `getSupabaseServerClient` with table-switching `from()` that handles `prospects`, `notes`, and `audit_log` tables
  - Use mutable variables for query results, reset in `beforeEach`
  - Capture `audit_log.insert` calls via a spy to verify audit metadata

  **Patterns to follow:**
  - `src/__tests__/actions/prospect-actions-auth.test.ts` — mock structure
  - `src/__tests__/actions/champion-actions.test.ts` — complex Supabase mock with table switching

  **Test scenarios:**
  - Happy path: `createPipelineProspect` — valid input creates prospect with `status: "interested"`, `heat_score: 3`, `consent_given: true`, returns `{ success: true, prospectId }`, audit log written with `action: "prospect-create"`
  - Happy path: `toggleSignal` — adding signal `"faq"` to `[]` produces `["faq"]`, removing `"faq"` from `["faq", "1-1"]` produces `["1-1"]`, `last_touch_at` updated
  - Happy path: `updateConcerns` — sets concerns array on prospect, audit log written with `action: "concern-update"` and metadata containing the concerns
  - Happy path: `overrideHeat` — updates `heat_score`, audit log contains `{ old_heat, new_heat }`
  - Happy path: `addPipelineNote` — inserts into `notes` table with correct `author_id` and `body`, updates `prospects.last_touch_at`, audit log written with `body_preview`
  - Error path: each of the 5 actions returns `{ success: false, error: "No geography assigned." }` when `session.geographyId` is null
  - Error path: each of the 5 actions returns `{ success: false, error: "Invalid input." }` when Zod validation fails (e.g., missing required fields, invalid UUID)
  - Error path: `toggleSignal`, `updateConcerns`, `overrideHeat`, `addPipelineNote` return `{ success: false, error: "Access denied." }` when prospect's geography differs from session
  - Error path: `toggleSignal`, `updateConcerns`, `overrideHeat`, `addPipelineNote` return `{ success: false, error: "Prospect not found." }` when prospect doesn't exist
  - Error path: `createPipelineProspect` returns `{ success: false, error: "Failed to create prospect." }` when Supabase insert fails

  **Verification:**
  - All 5 actions have passing tests
  - Each action has at least 4 test cases (happy path, null geography, invalid input, access denied where applicable)
  - `npx vitest run src/__tests__/actions/pipeline-actions.test.ts` passes

---

- [ ] **Unit 2: Pipeline table and filters component tests**

  **Goal:** Test that the pipeline table renders prospect data correctly and filters work as expected.

  **Requirements:** R5, R6

  **Dependencies:** None

  **Files:**
  - Create: `src/__tests__/components/dashboard/pipeline-table.test.tsx`
  - Create: `src/__tests__/components/dashboard/pipeline-filters.test.tsx`
  - Reference: `src/components/dashboard/pipeline-table.tsx`
  - Reference: `src/components/dashboard/pipeline-filters.tsx`

  **Approach:**
  - Factory functions for `PipelineRow` test data with sensible defaults
  - Mock `next/navigation` for `useRouter` (table uses `router.push` for row clicks)
  - Pipeline filters is a controlled component with callbacks — test by rendering with props and verifying callback invocations
  - For the table "Next Action" column, `deriveNextMove` is a pure function import that will work without mocking; set `last_touch_at` to controlled timestamps relative to "now" (or use `vi.useFakeTimers()`) so `daysSince` produces deterministic results
  - Always provide `onClearFilters: vi.fn()` when rendering `PipelineTable` (required prop, used by empty state)

  **Patterns to follow:**
  - `src/__tests__/components/dashboard/` — existing component test patterns
  - Factory function pattern from existing tests (e.g., `makeProspect()`)

  **Test scenarios:**
  - Happy path: table renders one row per prospect with name, stage badge, heat pips, neighborhood, concerns, last touch, and next action columns
  - Happy path: stage badges display correct labels (e.g., "Interested", "Shadow Day")
  - Happy path: heat pips render the correct number of filled pips for each heat score
  - Happy path: "Next Action" column shows the copilot engine's recommendation text
  - Edge case: table with zero prospects renders `PipelineFilteredEmptyState`
  - Happy path: clicking a table row calls `router.push` with `?prospect={id}`
  - Happy path: filters — clicking a stage pill calls `onStageFilterChange` with that stage
  - Happy path: filters — clicking the "All" stage pill calls `onStageFilterChange(null)`
  - Happy path: filters — stage pill counts reflect cross-filtered data (filtered by neighborhood only)
  - Happy path: filters — neighborhood pill counts reflect cross-filtered data (filtered by stage only)
  - Happy path: filters — clicking an active stage pill toggles it off (calls with `null`)
  - Edge case: filters — neighborhoods section hidden when `neighborhoods` array is empty

  **Verification:**
  - Both test files pass
  - Table renders all expected columns and data
  - Filter callbacks fire correctly

---

- [ ] **Unit 3: Copilot card and contact drawer component tests**

  **Goal:** Test the copilot card renders briefing/recommendation correctly and the contact drawer opens/closes properly.

  **Requirements:** R7, R8

  **Dependencies:** None

  **Files:**
  - Create: `src/__tests__/components/dashboard/copilot-card.test.tsx`
  - Create: `src/__tests__/components/dashboard/contact-drawer.test.tsx`
  - Reference: `src/components/dashboard/copilot-card.tsx`
  - Reference: `src/components/dashboard/contact-drawer.tsx`

  **Approach:**
  - Factory function for `SelectedProspectDetail` with full defaults
  - Mock `next/navigation` for `useRouter` and `useSearchParams` (drawer uses both)
  - Mock server actions called by drawer sub-components (`overrideHeat`, `toggleSignal`, `updateConcerns`, `addPipelineNote`, `updateProspectStatus`) to prevent actual execution
  - Copilot card's `deriveNextMove` and `suggestHeat` are pure functions — test with controlled `last_touch_at` values
  - For Escape key test, use `fireEvent.keyDown(document, { key: "Escape" })`

  **Patterns to follow:**
  - `src/__tests__/components/dashboard/` — component test patterns
  - Existing `next/navigation` mock pattern: `useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })`

  **Test scenarios:**
  - Happy path: copilot card renders "Conversation Co-pilot" heading
  - Happy path: copilot card renders briefing text with days since last touch, heat level, primary concern
  - Happy path: copilot card renders next move recommendation from the rules engine
  - Edge case: copilot card shows "New prospect — update concerns and signals to get recommendations." when prospect has no concerns and no signals
  - Happy path: contact drawer renders with `data-testid="contact-drawer"`
  - Happy path: contact drawer displays the prospect name in the header
  - Happy path: contact drawer close button exists with `aria-label="Close drawer"`
  - Happy path: pressing Escape key calls `router.push` to remove `?prospect` param
  - Happy path: clicking close button calls `router.push` to remove `?prospect` param

  **Verification:**
  - Both test files pass
  - Copilot card correctly renders briefing and recommendation for various prospect states
  - Drawer open/close behavior verified

---

- [ ] **Unit 4: `recordLibrarySend` server action + schema + migration**

  **Goal:** Create the backend for recording library sends: Zod schema, server action following the 6-step pattern, and migration to update the audit_log constraint.

  **Requirements:** R12 (backend)

  **Dependencies:** None

  **Files:**
  - Modify: `src/lib/validations/pipeline-schemas.ts` (add `recordLibrarySendSchema`)
  - Modify: `src/lib/actions/pipeline.ts` (add `recordLibrarySend` action)
  - Modify: `src/types/database.ts` (add `'library-send'` to `AuditAction` type union)
  - Create: `supabase/migrations/008_library_send_audit.sql`

  **Approach:**
  - Schema: `{ prospect_id: uuid, library_item_id: uuid }` — channel is hardcoded to "in-app" in the action, not user-supplied
  - Action follows the 6-step sequence: `requireAuthenticated()` → geography guard → `Zod.safeParse()` → ownership check on prospect → verify library item exists and belongs to champion's geography (geography_id IS NULL or matches session) → insert into `library_sends` with `champion_id: session.userId`, `geography_id: session.geographyId`, `channel: "in-app"` → increment `library_items.send_count` using raw SQL or `.rpc()` for atomic `send_count = send_count + 1` → audit_log insert with `action: "library-send"` → return `{ success: true }`
  - On `recordLibrarySend` failure after optimistic UI, the panel reverts the button state and shows an error toast via the existing `ToastProvider`
  - Migration 008: `ALTER TABLE audit_log DROP CONSTRAINT audit_log_action_check; ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check CHECK (action IN (...existing values..., 'library-send'));`

  **Patterns to follow:**
  - The 5 existing actions in `src/lib/actions/pipeline.ts` — identical structure
  - `src/lib/validations/pipeline-schemas.ts` — schema conventions

  **Test scenarios:**
  - Happy path: valid input inserts into `library_sends`, increments `send_count`, writes audit log, returns `{ success: true }`
  - Error path: null geography returns `{ success: false, error: "No geography assigned." }`
  - Error path: invalid input (missing `prospect_id` or `library_item_id`) returns `{ success: false, error: "Invalid input." }`
  - Error path: prospect belongs to different geography returns `{ success: false, error: "Access denied." }`
  - Error path: prospect not found returns `{ success: false, error: "Prospect not found." }`

  **Verification:**
  - `recordLibrarySend` action exists and follows the 6-step pattern
  - Schema validates UUID fields
  - Migration 008 updates the constraint
  - Tests for this action pass (added to the test file from Unit 1, or in a separate file)

---

- [ ] **Unit 5: Library send panel component**

  **Goal:** Build the modal overlay that champions use to browse library items by concern and mark them as sent.

  **Requirements:** R9, R10, R11, R14, R15

  **Dependencies:** Unit 4 (recordLibrarySend action)

  **Files:**
  - Modify: `src/lib/constants/pipeline.ts` (flip `LIBRARY_UI_ENABLED` to `true`)
  - Create: `src/components/dashboard/library-send-panel.tsx`
  - Modify: `src/app/hub/(dashboard)/(champion)/pipeline/page.tsx` (add `library_items` query for selected prospect)
  - Modify: `src/components/dashboard/contact-drawer.tsx` (add `libraryItems` to `SelectedProspectDetail` type or accept as separate prop)
  - Modify: `src/components/dashboard/drawer-header.tsx` (wire button to open panel, receive and pass library items + sends)

  **Approach:**
  - **Data flow:** The server component (`pipeline/page.tsx`) fetches `library_items` filtered by `geography_id IS NULL OR geography_id = session.geographyId` and filtered to items whose `concern` matches the prospect's concerns array. This query joins the existing `Promise.all` block. The items are passed through `PipelineShell` → `ContactDrawer` → `DrawerHeader` → `LibrarySendPanel` as a prop. Add `libraryItems` to `SelectedProspectDetail` (or pass as a separate prop alongside `prospect`).
  - `LibrarySendPanel` is a modal overlay component receiving `libraryItems`, `librarySends`, `prospectId`, and `onClose` props
  - Items grouped by concern using `CONCERN_LABELS` for section headers
  - Each item card: title, type badge (`faq` / `talking` / `data` / `quote`), body text
  - "Mark as sent" button calls `recordLibrarySend({ prospect_id, library_item_id })`, then marks the item as sent in local state (optimistic) and calls `router.refresh()`. On failure (`{ success: false }`), revert the optimistic state and show an error toast via the existing `useToast()` hook
  - Already-sent items (matched via `librarySends`) show "Sent" disabled button
  - Empty state: "No concerns recorded — add concerns to see relevant library items." when prospect has no concerns
  - Backdrop click or close button dismisses the panel
  - z-50 modal with semi-transparent backdrop

  **Patterns to follow:**
  - Existing modal/overlay patterns in the codebase (if any), otherwise follow the toast z-index layering pattern
  - `StatusBadge` component pattern for type badges
  - `drawer-header.tsx` existing button styling

  **Test scenarios:**
  - Happy path: panel renders library items grouped by concern, with concern labels as section headers
  - Happy path: each item shows title, type badge, and body content
  - Happy path: clicking "Mark as sent" disables the button and shows "Sent"
  - Happy path: already-sent items render with "Sent" disabled button on initial load
  - Edge case: empty state shown when prospect has no concerns
  - Happy path: clicking backdrop calls `onClose`
  - Happy path: clicking close button calls `onClose`
  - Edge case: items with no concern (null) are excluded or grouped under a generic header

  **Verification:**
  - "Send from library" button visible in drawer header
  - Clicking button opens modal overlay with items grouped by concern
  - Champion can read item content in-app
  - "Mark as sent" flow works correctly

---

- [ ] **Unit 6: Wire sentConcerns from library_sends**

  **Goal:** Populate the co-pilot's `sentConcerns` Set from actual `library_sends` data so rule 3 stops firing for addressed concerns.

  **Requirements:** R13

  **Dependencies:** Unit 5

  **Files:**
  - Modify: `src/components/dashboard/contact-drawer.tsx` (add `concern` to `DrawerLibrarySend` type)
  - Modify: `src/app/hub/(dashboard)/(champion)/pipeline/page.tsx` (expand `library_sends` query to join `library_items` for concern)
  - Modify: `src/components/dashboard/copilot-card.tsx` (build `sentConcerns` from `prospect.librarySends`)
  - Modify: `src/components/dashboard/pipeline-table.tsx` (build `sentConcerns` from sends data or accept pre-built set)

  **Approach:**
  - Add `concern: string | null` to `DrawerLibrarySend` type
  - In `pipeline/page.tsx`, expand the `library_sends` select to include the joined concern from `library_items`. If Supabase relational queries work: `.select("id, library_item_id, channel, sent_at, library_items(concern)")`. If not, fetch items separately and map.
  - In `copilot-card.tsx`, replace the hardcoded empty Set with: `const sentConcerns = new Set(prospect.librarySends.map(s => s.concern).filter(Boolean))`
  - For `pipeline-table.tsx`, the table view doesn't have `librarySends` per row. Options: (a) accept that rule 3 fires in the table "Next Action" column since it only has summary data, or (b) pass a `sentConcernsMap` from the shell. Given complexity, option (a) is acceptable for v1 — the table shows a hint, the drawer shows the accurate recommendation.

  **Patterns to follow:**
  - Existing `Promise.all` data fetching pattern in `pipeline/page.tsx`
  - Pure function derivation pattern

  **Test scenarios:**
  - Happy path: copilot card with `librarySends` containing a send for concern "tuition" → `sentConcerns` includes "tuition" → rule 3 does not fire for "tuition"
  - Happy path: copilot card with empty `librarySends` → `sentConcerns` is empty → rule 3 fires for all concerns (existing behavior preserved)
  - Edge case: library send with `concern: null` is filtered out of `sentConcerns`
  - Integration: full flow — prospect has concerns `["tuition", "pace"]`, one library item for "tuition" marked as sent → copilot recommends addressing "pace" (not "tuition")

  **Verification:**
  - `sentConcerns` correctly populated from library sends data
  - Co-pilot rule 3 stops firing for concerns with at least one sent item
  - Existing behavior preserved when no items are sent

---

- [ ] **Unit 7: Library send component and integration tests**

  **Goal:** Test the library send panel, the recordLibrarySend action, and the sentConcerns wiring.

  **Requirements:** R12 (test), R13 (test)

  **Dependencies:** Units 4, 5, 6

  **Files:**
  - Create: `src/__tests__/components/dashboard/library-send-panel.test.tsx`
  - Modify: `src/__tests__/actions/pipeline-actions.test.ts` (add recordLibrarySend tests, or create separate file)

  **Approach:**
  - Factory functions for library items and library sends test data
  - Mock `recordLibrarySend` server action in component tests
  - Test the panel in isolation with mock data
  - Test the copilot card's sentConcerns derivation by passing controlled `librarySends` arrays

  **Patterns to follow:**
  - Component test patterns from Units 2 and 3
  - Server action test patterns from Unit 1

  **Test scenarios:**
  - Happy path: panel renders items grouped by concern sections
  - Happy path: clicking "Mark as sent" calls `recordLibrarySend` with correct `prospect_id` and `library_item_id`
  - Happy path: after marking as sent, button shows "Sent" and is disabled
  - Happy path: items already in `librarySends` render as "Sent" initially
  - Edge case: panel with no library items for the prospect's concerns shows empty state
  - Happy path: `recordLibrarySend` action test — valid input succeeds (covered in Unit 4 tests)
  - Error path: `recordLibrarySend` action test — null geography, invalid input, access denied (covered in Unit 4 tests)

  **Verification:**
  - All library send component tests pass
  - All recordLibrarySend action tests pass
  - Full test suite passes: `npx vitest run`

## System-Wide Impact

- **Interaction graph:** The library send panel calls `recordLibrarySend` → inserts `library_sends` row → increments `library_items.send_count`. On next page load, the server component fetches updated sends, the copilot card builds `sentConcerns`, and `deriveNextMove` produces different recommendations.
- **Error propagation:** `recordLibrarySend` returns `{ success: false, error }` on failure. The panel should show a toast on error and keep the "Mark as sent" button enabled for retry.
- **State lifecycle risks:** Optimistic UI for the "Sent" button state. If the server action fails, the button should revert to "Mark as sent". No partial-write risk since the library_sends insert is a single row.
- **API surface parity:** The pipeline-table's "Next Action" column uses an empty `sentConcerns` Set in v1 (no per-row library_sends data). This is a documented v1 limitation — the table shows a summary hint, not the authoritative recommendation. The drawer's copilot card shows the accurate version with real sentConcerns data.
- **Unchanged invariants:** The 5 existing server actions, the co-pilot engine's pure functions, the kanban drag-and-drop, and the drawer's URL-driven open/close pattern are all unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Supabase relational query syntax for library_sends → library_items join may differ from expected | Deferred to implementation — if nested select doesn't work, fall back to a separate query |
| audit_log constraint migration (008) must be applied before the recordLibrarySend action is used | Migration 008 is a simple ALTER — include in deploy instructions |
| Mocking complexity for 5 server actions with table-switching Supabase client | Follow the champion-actions.test.ts pattern which handles the same complexity |

## Sources & References

- **Origin document:** [docs/brainstorms/pipeline-tests-and-library-ui-requirements.md](docs/brainstorms/pipeline-tests-and-library-ui-requirements.md)
- Related plan: [docs/plans/2026-05-02-001-feat-pipeline-crm-plan.md](docs/plans/2026-05-02-001-feat-pipeline-crm-plan.md)
- Feature patterns: [docs/solutions/best-practices/pipeline-crm-feature-patterns-2026-05-02.md](docs/solutions/best-practices/pipeline-crm-feature-patterns-2026-05-02.md)
- Auth redirect loop (null-geography pattern): [docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md](docs/solutions/logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md)
- Clerk v7 middleware mock requirement: [docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md](docs/solutions/runtime-errors/clerk-v7-auth-requires-middleware-2026-04-29.md)
