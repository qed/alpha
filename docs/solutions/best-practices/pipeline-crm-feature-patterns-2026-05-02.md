---
title: Pipeline CRM Feature Patterns
date: "2026-05-02"
category: best-practices
module: pipeline-crm
problem_type: best_practice
component: documentation
severity: medium
applies_when:
  - "Building URL-driven slide-out detail drawers with search params in Next.js App Router"
  - "Implementing drag-and-drop kanban boards without third-party DnD libraries"
  - "Writing deterministic rules engines (co-pilot suggestions) as pure functions"
  - "Using Supabase behind Clerk auth where no RLS session exists"
  - "Creating server actions with consistent auth, validation, and audit trail patterns"
tags:
  - pipeline-crm
  - url-driven-drawer
  - drag-and-drop
  - kanban
  - server-actions
  - supabase-admin-client
  - rules-engine
  - toast-notifications
---

# Pipeline CRM Feature Patterns

## Context

The Champions Hub needed a Pipeline CRM to replace a simple prospects list (`/hub/prospects`) with a full pipeline management interface (`/hub/pipeline`). This required building seven interlocking patterns from scratch -- none had prior precedent in this Next.js 16 + Clerk + Supabase codebase. These patterns now serve as the canonical reference for any future feature involving URL-driven detail panels, optimistic drag-and-drop, deterministic business logic, server actions with audit trails, or lightweight UI infrastructure (toasts, view persistence).

## Guidance

### Pattern 1: URL-driven slide-out drawer

Keep data fetching in the server component; pass fully-hydrated props to the client drawer. The URL search param (`?prospect={id}`) acts as the single source of truth for drawer open/close state.

**Server component** (`pipeline/page.tsx`): Await the `searchParams` Promise (Next.js 16 requirement), detect the `prospect` param, fetch full detail plus 5 related tables via `Promise.all`, and pass the assembled object as a prop to the client shell.

```tsx
const resolvedParams = await searchParams;
const prospectId = typeof resolvedParams.prospect === "string"
  ? resolvedParams.prospect : undefined;

if (prospectId) {
  const { data: detail } = await supabase
    .from("prospects").select("...").eq("id", prospectId).single();

  const [{ data: children }, { data: notes }, ...] = await Promise.all([
    supabase.from("children").select("...").eq("prospect_id", prospectId),
    supabase.from("notes").select("...").eq("prospect_id", prospectId),
    // ...3 more queries
  ]);

  selectedProspect = { ...detail, children, notes, ... };
}

return <PipelineShell selectedProspect={selectedProspect} />;
```

**Client drawer** (`contact-drawer.tsx`): Fixed 920px panel at `z-40`. Close removes the param via `router.push()`. Escape key listener registered in `useEffect` with cleanup.

```tsx
const closeDrawer = useCallback(() => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("prospect");
  router.push(`/hub/pipeline${qs ? `?${qs}` : ""}`);
}, [router, searchParams]);
```

Key rules:
- Never fetch data client-side for the drawer; the server component owns all queries.
- Use `Promise.all` for parallel related-data fetching.
- The drawer component must be conditionally rendered: `{prospectParam && selectedProspect && <ContactDrawer />}`.

### Pattern 2: Deterministic rules engine (co-pilot)

Implement business logic as pure functions with no side effects. The co-pilot engine has two functions:

`suggestHeat(signals, daysSinceLast, stage)` -- returns a heat score 1-5:

```ts
if (stage === "lost") return 1;          // Terminal: early return
let heat = HEAT_BASE[stage];             // Base from stage
if (signals.length >= 5) heat += 2;      // Signal bonus
else if (signals.length >= 3) heat += 1;
if (daysSinceLast > 21) heat -= 2;       // Recency penalty
else if (daysSinceLast > 14) heat -= 1;
return Math.max(1, Math.min(5, heat));   // Clamp
```

`deriveNextMove(prospect, sentConcerns)` -- first-match-wins rule cascade returning `{ message, ruleId }`:

```ts
if (stage === "lost") return { message: "...", ruleId: 1 };
if (daysSinceLastTouch > 21 && heat_score <= 2) return { ..., ruleId: 2 };
const unaddressed = concerns.find(c => !sentConcerns.has(c));
if (unaddressed) return { ..., ruleId: 3 };
// ...4 more rules
return { message: "Check in with a personalized note.", ruleId: 7 };
```

Key rules:
- Early return for terminal states before applying bonuses/penalties.
- Every rule has a numeric `ruleId` for traceability and testing.
- Pure functions with zero imports from React or server libraries -- unit-testable in isolation.

### Pattern 3: Native HTML drag-and-drop kanban

Use the browser's native drag-and-drop API with an `ALLOWED_TRANSITIONS` state machine. No library required for simple column-to-column moves.

**State machine** (`constants/pipeline.ts`):

```ts
export const ALLOWED_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  interested: ["shadow-day", "lost"],
  "shadow-day": ["interested", "committed", "lost"],
  committed: ["shadow-day", "enrolled", "lost"],
  enrolled: ["committed", "lost"],
  lost: ["interested"],
};
```

**Drag data transfer**: Store three values in `dataTransfer`:

```ts
e.dataTransfer.setData("text/prospect-id", prospect.id);
e.dataTransfer.setData("text/source-stage", effectiveStage);
e.dataTransfer.setData("text/updated-at", prospect.updated_at);
```

**Optimistic state**: `useState<Map<string, PipelineStage>>()` maps prospect ID to overridden stage. On drop, set the optimistic stage immediately; on server error, delete the entry to snap back; on success, delete the entry and `router.refresh()` to let server data take over.

### Pattern 4: Toast notification system

Minimal toast via React context. No external dependency.

- Module-level `let nextId = 0` for unique keys.
- `ToastProvider` wraps the shell, provides `showToast(message, type)` via context.
- Auto-dismiss after 4s, cleanup all timers on unmount.
- `z-[60]` on the toast container, above drawer's `z-40`.
- `role="alert"` + `aria-live="polite"` for screen readers.

### Pattern 5: Server action pattern with audit trail

Every server action follows an identical 6-step sequence:

```
"use server" -> requireAuthenticated() -> geography guard -> Zod.safeParse() -> mutation -> audit_log.insert() -> return ActionResult
```

Key rules:
- Accept `data: unknown`, never trust the caller's type.
- Every mutation sets `last_touch_at = new Date().toISOString()`.
- `session.userId` (Clerk user ID) is used directly for `actor_id`/`author_id` -- matches the existing codebase pattern.
- Return a uniform `{ success: boolean; error?: string }` shape.
- Ownership check: `prospect.geography_id !== session.geographyId` returns "Access denied."

### Pattern 6: Dual Supabase client strategy

In a Clerk-authenticated app with no Supabase auth session:

| Context | Client | Why |
|---------|--------|-----|
| Server component reads | `getSupabaseAdminClient()` | Bypasses RLS (no Supabase session exists for Clerk-authenticated users) |
| Server action writes | `getSupabaseServerClient()` | Uses service role for authorized mutations behind Clerk auth gate |

Never attempt RLS-based access control with Clerk tokens. Enforce authorization in application code: `requireAuthenticated()` for identity, geography guard for tenancy, ownership check for row-level access. (auto memory [claude])

### Pattern 7: View preference persistence

For UI-only preferences (no cross-device sync needed), use `localStorage` directly with SSR-safe initialization:

```ts
const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
useEffect(() => {
  const saved = localStorage.getItem(VIEW_PREF_KEY);
  if (saved === "kanban" || saved === "table") setViewMode(saved);
}, []);
```

Default to a safe value in `useState` (SSR-safe). Validate the stored value before applying.

## Why This Matters

1. **Server-first data fetching** avoids client waterfalls and keeps secrets server-side. The drawer pattern proves that even highly interactive UI can receive all data via props.
2. **Deterministic, testable business logic** in pure functions prevents the co-pilot from becoming a black box. The `ruleId` on every result makes test failures immediately diagnosable.
3. **Native DnD without a library** avoids 30-50KB of bundle size and version-lock risk for simple column-to-column moves.
4. **Uniform server action structure** makes security audits trivial -- every action is verified by checking the same 6-step sequence.
5. **Explicit dual-client pattern** prevents the most common Clerk+Supabase footgun: assuming RLS works when there is no Supabase auth session.

## When to Apply

- **URL-driven drawer**: Any feature needing a detail panel that should be linkable/shareable/bookmarkable. Do not use client-side state for open/close if the panel represents a distinct entity.
- **Rules engine**: Any feature with deterministic business logic that should be unit-tested independently of React. Keep it in `src/lib/` as pure functions.
- **Native DnD kanban**: Column-to-column drag with a finite state machine of allowed transitions. If you need sortable reordering within a column, consider a library instead.
- **Toast system**: Already available project-wide via `<ToastProvider>` and `useToast()`. Do not create a second notification system.
- **Server action pattern**: Every new mutation touching Supabase from the hub. Follow the 6-step sequence exactly.
- **Dual Supabase clients**: Every page/action in the Clerk-authenticated hub. Never change this without also implementing Supabase JWT integration.
- **View preference persistence**: Any toggle/preference that is cosmetic and user-local. If cross-device sync is needed, store in the database instead.

## Examples

**Adding a new server action** (e.g., `archiveProspect`):

```ts
// src/lib/validations/pipeline-schemas.ts
export const archiveProspectSchema = z.object({
  prospect_id: z.string().uuid(),
  reason: z.string().min(1).max(500).transform(stripHtml),
});

// src/lib/actions/pipeline.ts
export async function archiveProspect(data: unknown): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) return { success: false, error: "No geography assigned." };
  const parsed = archiveProspectSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  const supabase = await getSupabaseServerClient();
  // ... ownership check, mutation, audit_log.insert, return { success: true }
}
```

**Adding a new co-pilot rule** (insert before the fallback rule 7):

```ts
if (stage === "interested" && daysSinceLastTouch > 10 && concerns.length === 0) {
  return { message: "No concerns logged. Ask about hesitations.", ruleId: 8 };
}
```

**Opening the drawer from any component**:

```tsx
router.push(`/hub/pipeline?prospect=${prospectId}`);
```

No additional state management needed -- the server component detects the param and fetches on the next render.

## Related

- [Clerk+Supabase auth cascade](../integration-issues/clerk-supabase-vercel-auth-cascade-failure-2026-05-01.md) -- admin client pattern origin
- [Hub auth-aware layout and routing](hub-auth-aware-layout-and-routing-patterns-2026-04-30.md) -- route group structure the pipeline lives within
- [Null geography redirect loop](../logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md) -- geography guard pattern used in all pipeline actions
- [Missing hub placeholder pages](../ui-bugs/missing-hub-placeholder-pages-cause-404-2026-05-01.md) -- pipeline placeholder superseded by this feature
- Origin plan: `docs/plans/2026-05-02-001-feat-pipeline-crm-plan.md`
- Origin requirements: `docs/brainstorms/pipeline-crm-requirements.md`
