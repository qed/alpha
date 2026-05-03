---
title: "Gate on incomplete profile data at the layout level with inline rendering"
date: 2026-05-02
category: best-practices
module: hub
problem_type: best_practice
component: authentication
severity: high
applies_when:
  - A user attribute (geography, team, org) must be set before any child route is usable
  - Multiple pages under a shared layout all need the same prerequisite check
  - A redirect-based guard has caused or could cause an infinite redirect loop
  - Both admin and non-admin roles need to satisfy the same prerequisite
tags:
  - geography-gate
  - layout-level-guard
  - inline-rendering
  - auth
  - next-js
  - server-components
  - clerk-supabase
---

# Gate on incomplete profile data at the layout level with inline rendering

## Context

In the Champions Hub, geography assignment is a prerequisite for all dashboard functionality. Initially, the geography check was duplicated in each individual page (`dashboard/page.tsx`, `pipeline/page.tsx`), leaving gaps: users without a geography could navigate to other child routes that lacked the check, and admins could access the dashboard with no geography at all. A previous attempt to enforce this via `requireChampion()` with a redirect caused an infinite redirect loop (see [redirect loop fix](../logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md)). The solution was to consolidate the check at the layout level and render the gate inline rather than via redirect.

A related issue: the hub sidebar (`hub-sidebar.tsx`) always showed a hardcoded "Set after sign-in" placeholder for the geography section. Once the layout confirmed the geography existed, the name needed to be threaded down to client components as a prop.

## Guidance

When a user attribute must be set before any child route is usable, enforce the check once in the shared layout rather than duplicating it across individual pages. Render the gate UI inline (replacing `{children}`) instead of redirecting.

**Three rules:**

1. **Gate at the layout, not the page.** Place the prerequisite check in the nearest shared layout that wraps all affected routes. This guarantees no child route can be reached without satisfying the check — including future pages added later.

2. **Render inline, never redirect.** When the prerequisite is missing, render the remediation UI (e.g., a picker, a form) in place of `{children}`. A redirect creates loop risk when there is no valid destination for a user who is authenticated but lacks the prerequisite.

3. **Read from the source of truth.** Use the authoritative data store (Supabase profiles table) rather than Clerk session claims, which can be stale or contain unprocessed template strings (auto memory [claude]).

**Thread resolved data to client components.** Once the layout confirms the attribute exists, pass it down so client components don't re-fetch or show placeholder text:

```tsx
// hub/layout.tsx (server) — look up geography name for sidebar
const profile = await supabase.from("profiles").select("geography_id").eq("clerk_user_id", userId).maybeSingle();
if (profile?.geography_id) {
  const { data: geo } = await supabase.from("geographies").select("name").eq("id", profile.geography_id).single();
  geographyName = geo?.name ?? null;
}
return <HubShell geographyName={geographyName}>{children}</HubShell>;
```

```tsx
// HubSidebar (client) — show real data, not placeholder
{geographyName ? (
  <span className="text-white text-xs font-semibold">{geographyName}</span>
) : (
  <span className="text-white/50 italic text-xs">
    {isAuthenticated ? "Not yet selected" : "Set after sign-in"}
  </span>
)}
```

## Why This Matters

- **Completeness**: A per-page guard is only as strong as the developer's memory to add it to every new page. A layout-level guard covers all current and future child routes automatically.
- **Redirect safety**: Inline rendering avoids the class of infinite redirect loops that occur when an authenticated user has no valid destination. This exact failure mode caused a critical bug documented in the [redirect loop solution](../logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md).
- **Role consistency**: Moving the check to the layout ensures it applies uniformly to all roles (champions, admins), not just the ones whose pages happened to include it.
- **Auth source of truth**: Reading from Supabase rather than Clerk session claims avoids stale or malformed data (see [cascade failure doc](../integration-issues/clerk-supabase-vercel-auth-cascade-failure-2026-05-01.md), Section 4).
- **No duplicate code**: One check in the layout replaces N identical checks across N sibling pages.

## When to Apply

- A user profile attribute (geography, organization, team, onboarding step) is a prerequisite for all routes under a shared layout
- Multiple sibling pages currently duplicate the same prerequisite guard
- You are considering a redirect-based guard for profile completeness and the user has no valid fallback destination
- A prerequisite check exists on some pages but not others under the same layout, leaving gaps
- Both admin and non-admin roles must satisfy the same prerequisite but current guards are role-specific

## Examples

### Before: Per-page guards with gaps

```tsx
// dashboard/page.tsx — has the guard
export default async function DashboardPage() {
  const session = await requireAuth();
  if (!session.geographyId) {
    return <GeographyPicker geographies={await getAvailableGeographies()} />;
  }
  // ... dashboard content
}

// pipeline/page.tsx — has the guard (duplicated)
export default async function PipelinePage() {
  const session = await requireAuth();
  if (!session.geographyId) {
    return <GeographyPicker geographies={await getAvailableGeographies()} />;
  }
  // ... pipeline content
}

// settings/page.tsx — MISSING the guard
export default async function SettingsPage() {
  const session = await requireAuth();
  // ... user reaches this without a geography
}
```

### After: Single layout-level gate

```tsx
// (dashboard)/layout.tsx — one gate covers ALL child routes
export default async function DashboardLayout({ children }) {
  const session = await requireAuth();

  if (!session.geographyId) {
    const geographies = await getAvailableGeographies();
    return (
      <div className="min-h-screen flex flex-col bg-paper-2">
        <header>{/* header remains visible */}</header>
        <main><GeographyPicker geographies={geographies} /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-2">
      <header>{/* full nav */}</header>
      <main>{children}</main>
    </div>
  );
}

// dashboard/page.tsx — no geography check needed
// pipeline/page.tsx — no geography check needed
// settings/page.tsx — automatically covered
```

## Related

- [Auth redirect loop for null geography](../logic-errors/clerk-auth-redirect-loop-null-geography-2026-04-30.md) — the original bug that motivated inline rendering over redirects
- [Auth-aware layout and routing patterns](hub-auth-aware-layout-and-routing-patterns-2026-04-30.md) — companion patterns for auth-aware hub layouts and server-to-client prop threading
- [Clerk+Supabase+Vercel auth cascade failure](../integration-issues/clerk-supabase-vercel-auth-cascade-failure-2026-05-01.md) — why Supabase is the auth source of truth (Section 4)
