---
title: "CSS isolation for full-page previews embedded in a Next.js app"
date: "2026-05-01"
category: best-practices
module: website-preview
problem_type: best_practice
component: frontend_stimulus
severity: medium
applies_when:
  - "Building a full-page preview or embed inside a Next.js app with its own global styles"
  - "Rendering a self-contained page design that must not inherit or leak CSS to/from the host app"
  - "Using CSS variables in a component that coexists with app-level :root variables"
  - "Using browser-only charting libraries (Recharts, Chart.js, D3) in Next.js 16+ Server Components"
tags:
  - css-isolation
  - css-scoping
  - css-variables
  - class-prefix
  - next-font
  - website-preview
  - ssr-guard
  - recharts
  - next-js
---

# CSS isolation for full-page previews embedded in a Next.js app

## Context

The team needed to embed a full-page website preview inside an existing Next.js 16.2.4 app (React 19.2.4). The preview page is a standalone replica of a real school website with its own design system -- different fonts (Sora + DM Sans), different colors, different layout -- that must coexist with the host app without style leakage in either direction. The host app uses Tailwind CSS v4, Clerk v7 for auth, and has its own global styles in `globals.css`. The preview also includes Recharts bar charts and YouTube embeds.

## Guidance

### 1. CSS Variable Scoping

Scope all CSS custom properties to `.wp-root` instead of `:root`. This prevents the preview's color palette, spacing tokens, and design tokens from colliding with the host app's CSS variables.

### 2. Class Prefix Isolation

Every CSS class uses a `wp-` prefix (e.g., `.wp-nav`, `.wp-hero`, `.wp-footer`). No bare element selectors (`h1`, `p`, `a`), no Tailwind utility classes from the host app. This creates a clean namespace boundary.

### 3. Font Loading via CSS Variables

Fonts loaded via `next/font/google` with the `variable` option, producing CSS variable names (`--wp-font-heading`, `--wp-font-body`). Applied through the wrapper's `className`. CSS references `var(--wp-font-heading)` rather than hardcoding font family names.

### 4. SSR Guard for Client Libraries

In Next.js 16, `next/dynamic` with `ssr: false` does NOT work correctly within Server Components. Instead, use a `"use client"` component with `useEffect` + `useState` mount guard:

```tsx
"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export function InterestChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div style={{ height: 300 }} />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <Bar dataKey="value" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

The placeholder div with fixed height prevents layout shift during hydration.

### 5. Route Isolation

The preview page lives outside the `(dashboard)` route group, skipping the HubShell layout and Clerk auth requirements entirely. It renders as a full-viewport standalone page.

## Why This Matters

Without CSS isolation, the preview page's styles bleed into the main app or vice versa, breaking both interfaces. Variables on `:root` are global and would be inherited by every page. Bare element selectors would restyle headings and paragraphs across the entire app. The SSR guard is critical because Recharts accesses `window` and DOM APIs during render, causing a hard crash during SSR -- and the standard `next/dynamic({ ssr: false })` pattern is broken in Next.js 16 Server Components.

## When to Apply

- Building embedded previews, demos, or template pages within an existing Next.js app
- Rendering pages with a completely different design system alongside the main app
- Using browser-only charting/visualization libraries in Next.js 16+ Server Components
- Creating pages that should bypass the app's auth or layout wrapper
- Any scenario where two independent CSS "worlds" must coexist without Shadow DOM

## Examples

**CSS Variable Scoping -- Before (leaks globally):**
```css
:root {
  --primary: #1e3a5f;
  --accent: #f59e0b;
}
```

**After (scoped to preview):**
```css
.wp-root {
  --wp-primary: #1e3a5f;
  --wp-accent: #f59e0b;
}
```

---

**Font Loading -- Before (hardcoded):**
```css
.hero-title { font-family: 'Sora', sans-serif; }
```
```tsx
const sora = Sora({ subsets: ["latin"] });
```

**After (CSS variable binding):**
```tsx
const sora = Sora({ subsets: ["latin"], variable: "--wp-font-heading" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--wp-font-body" });

export default function Page() {
  return (
    <div className={`wp-root ${sora.variable} ${dmSans.variable}`}>
      {/* content */}
    </div>
  );
}
```
```css
.wp-hero-title { font-family: var(--wp-font-heading); }
```

---

**SSR Guard -- Before (broken in Next.js 16):**
```tsx
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("./Chart"), { ssr: false });
// Does NOT reliably prevent SSR in Next.js 16 Server Components
```

**After (useEffect mount guard):**
```tsx
"use client";
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted) return <div style={{ height: 300 }} />;
return <RechartComponent />;
```

## Related

- `src/app/hub/library/website-preview/` -- implementation of this pattern
- `src/app/hub/library/website-preview/website-preview.css` -- scoped CSS with `wp-` prefix
- `docs/solutions/best-practices/hub-auth-aware-layout-and-routing-patterns-2026-04-30.md` -- related route group patterns
