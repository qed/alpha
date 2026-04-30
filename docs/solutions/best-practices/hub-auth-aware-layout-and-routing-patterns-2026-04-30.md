---
title: "Auth-Aware Layout and Routing Patterns for the Champions Hub"
date: 2026-04-30
category: best-practices
module: hub
problem_type: best_practice
component: authentication
severity: medium
applies_when:
  - Building pages that mix authenticated and unauthenticated content
  - Creating sidebar navigation with auth-gated items
  - Adding mobile drawer navigation with accessibility requirements
  - Routing users through sign-in with return paths
tags:
  - auth-aware-ui
  - route-groups
  - open-redirect-prevention
  - mobile-drawer
  - accessibility
  - clerk
  - nextjs
  - server-client-bridge
---

# Auth-Aware Layout and Routing Patterns for the Champions Hub

## Context

The Champions Hub (`/hub`) needed to serve both authenticated champions and unauthenticated visitors from the same entry point. The intro page is public, the dashboard and pipeline are gated, and the library is open. This required patterns for passing auth state from server to client components, organizing route groups for mixed access, preventing open redirects in sign-in flows, and building an accessible mobile navigation drawer.

These patterns emerged during the initial Hub implementation and apply to any area of the app that mixes authenticated and unauthenticated content within a shared layout.

## Guidance

### 1. Server-to-Client Auth Prop Bridge

Call `auth()` once in the server component and pass `isAuthenticated` as a boolean prop to client components. This avoids multiple `auth()` calls per request and keeps the client component decoupled from Clerk's server API.

```tsx
// Server component (page.tsx)
import { auth } from "@clerk/nextjs/server";

export default async function HubPage() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;
  return <HubShell isAuthenticated={isAuthenticated}>{/* ... */}</HubShell>;
}
```

```tsx
// Client component (hub-shell.tsx)
"use client";
export function HubShell({ isAuthenticated, children }: Props) {
  // Use isAuthenticated as a UI hint only — never trust it for gating
}
```

### 2. Route Groups for Mixed Auth/Open Routes

Use Next.js route groups to separate auth-gated pages from open pages under the same URL prefix:

```
src/app/hub/
  page.tsx              # Open — intro page
  library/page.tsx      # Open — reference materials
  (dashboard)/
    layout.tsx          # Auth gate: redirects to /hub/sign-in if !userId
    dashboard/page.tsx  # Gated
    pipeline/page.tsx   # Gated
```

The `(dashboard)` route group applies its layout (with auth redirect) to all nested routes without affecting the URL structure. Pages outside the group remain accessible without authentication.

### 3. Hardcoded Return Paths to Prevent Open Redirects

When redirecting unauthenticated users to sign-in, use hardcoded return paths — never pass user-supplied URLs through query parameters.

```tsx
// Safe — hardcoded destination per nav item
const signInPaths: Record<string, string> = {
  Dashboard: "/hub/sign-in?redirect_url=/hub/dashboard",
  Pipeline: "/hub/sign-in?redirect_url=/hub/pipeline",
  Events: "/hub/sign-in?redirect_url=/hub/events",
};

function handleNavClick(item: NavItem) {
  if (item.requiresAuth && !isAuthenticated) {
    router.push(signInPaths[item.label]);
    return;
  }
  router.push(item.href);
}
```

Clerk's `redirect_url` query parameter is read by the sign-in component automatically. Using hardcoded values prevents open redirect attacks where an attacker could craft a URL pointing to an external site.

### 4. Accessible Mobile Drawer

Mobile sidebar drawers need focus trap, Escape-to-close, and focus restoration:

```tsx
useEffect(() => {
  if (!isOpen) return;

  previousFocusRef.current = document.activeElement as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  document.addEventListener("keydown", handleKeyDown);

  // Focus trap: keep Tab within the drawer
  const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
    'a, button, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable?.length) focusable[0].focus();

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    previousFocusRef.current?.focus(); // Restore focus on close
  };
}, [isOpen, onClose]);
```

Auth-gated items should show a lock icon and use `aria-label` to communicate their state:

```tsx
<a aria-label={`${item.label} (sign in required)`}>
  {item.label}
  <LockIcon />
</a>
```

## Why This Matters

- **Single `auth()` call**: Clerk's `auth()` is async and hits the session store. Calling it once per request and threading the result down avoids redundant lookups (see `docs/solutions/performance-issues/double-auth-call-optimization-2026-04-29.md`).
- **Route groups**: Without them, you'd need per-page auth checks or a single layout that either gates everything or gates nothing.
- **Hardcoded return paths**: Open redirects are a common OWASP vulnerability. Hardcoding destinations eliminates the attack surface entirely.
- **Accessible drawer**: Screen reader users and keyboard-only users cannot use a drawer that lacks focus management. These patterns meet WCAG 2.1 requirements.

## When to Apply

- Any page or layout that serves both authenticated and unauthenticated users
- Sidebar or nav components that show different CTAs or lock icons based on auth state
- Mobile navigation drawers or overlays
- Sign-in redirect flows where return paths are needed
- Any new route group under `/hub` or similar mixed-access areas

## Examples

**Auth-aware CTA switching:**

```tsx
{isAuthenticated ? (
  <Link href="/hub/dashboard">Go to Dashboard</Link>
) : (
  <Link href="/hub/sign-in">Enter the Hub</Link>
)}
```

**Mobile drawer with overlay:**

```tsx
{/* Backdrop */}
<div
  className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  }`}
  onClick={onClose}
/>

{/* Drawer */}
<nav
  ref={drawerRef}
  className={`fixed top-0 left-0 h-full w-[240px] z-50 lg:sticky lg:top-0
    transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
>
  {/* Nav items */}
</nav>
```

## Related

- [Auth redirect loop fix](../runtime-errors/redirect-loop-during-auth-with-clerk-middleware-nextjs-2026-04-29.md) — bug-track doc covering infinite redirect loops with Clerk middleware
- [Double auth() call optimization](../performance-issues/double-auth-call-optimization-2026-04-29.md) — why a single `auth()` call matters
- [Unified app migration guide](../best-practices/nextjs-unified-app-migration-from-split-structure-2026-04-29.md) — Section 4 covers route group organization
- [Clerk v7 middleware patterns](../integration-issues/clerk-v7-middleware-passthrough-pattern-2026-04-29.md) — why `src/middleware.ts` should not be modified
