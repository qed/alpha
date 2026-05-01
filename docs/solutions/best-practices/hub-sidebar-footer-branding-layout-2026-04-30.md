---
title: "Sidebar Footer Branding with Logo Lightbox and Responsive Spacing"
date: 2026-04-30
category: best-practices
module: hub
problem_type: best_practice
component: frontend_stimulus
severity: low
applies_when:
  - Placing a transparent-background logo on a dark sidebar
  - Building sidebar footers that must work in both desktop and mobile drawer layouts
  - Consolidating branding content from multiple locations into one sidebar callout
tags:
  - sidebar
  - footer
  - branding
  - logo-lightbox
  - responsive-spacing
  - mobile-drawer
  - alpha-toronto
---

# Sidebar Footer Branding with Logo Lightbox and Responsive Spacing

## Context

The Champions Hub sidebar (`bg-ink`, dark background) needed to display the Alpha Toronto logo — a transparent PNG with red elements and fine details. Placing it directly on the dark surface caused lighter details to disappear. The footer also needed different spacing behavior: pushed to the bottom on desktop (full-height sidebar) but tight against nav items on mobile (hamburger drawer where empty space wastes screen real estate).

Previously, the branding callout appeared as plain text in both the sidebar footer and a separate section in the main content area, creating redundancy.

## Guidance

### Transparent logos on dark backgrounds: use a white lightbox badge

Wrap the logo in a white, rounded container with padding so it stays legible regardless of the background:

```tsx
<a
  href="https://alphatoronto.org"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-white rounded-lg px-3 py-2 inline-block hover:shadow-md transition-shadow"
>
  <Image
    src="/artifacts/Alpha_Toronto_Transparent.png"
    alt="Alpha Toronto"
    width={140}
    height={42}
    className="h-7 w-auto"
  />
</a>
```

- `bg-white rounded-lg` creates the badge effect
- `px-3 py-2` gives breathing room around the logo
- `hover:shadow-md transition-shadow` adds a subtle interactive cue
- The entire badge is a link wrapping the image

### Responsive sidebar footer spacing: `lg:mt-auto mt-4`

In a flex-column sidebar, use `lg:mt-auto` to push the footer to the bottom on desktop, and `mt-4` for mobile where the sidebar is a collapsible drawer:

```tsx
<div className="lg:mt-auto mt-4 border-t border-white/10 px-4 py-4 flex flex-col items-center gap-2.5 text-center">
  {/* footer content */}
</div>
```

### Vertically stacked layout for narrow containers

Use `flex flex-col items-center gap-2.5 text-center` to stack tagline, logo badge, and secondary link vertically — this works well in the constrained 240px sidebar width:

```tsx
<p className="text-[11px] text-white/55 flex items-center gap-1.5">
  <span>With</span>
  <span className="text-red-400">❤️</span>
  <span>by</span>
</p>
{/* logo badge */}
<p className="text-[11px] leading-relaxed text-white/55">
  Know someone in Toronto?{" "}
  <a href="https://alphatoronto.org" className="text-alpha-sky underline ...">alphatoronto.org</a>
</p>
```

## Why This Matters

- **Legibility**: Transparent PNGs with light-colored content vanish on dark backgrounds. A white badge is a reliable fix that preserves the original logo asset without needing a dark-mode variant.
- **Consistent spacing across viewports**: On desktop, `mt-auto` anchors the footer to the bottom. On mobile, the drawer scrolls or collapses — `mt-auto` would create a large empty gap. The `lg:mt-auto mt-4` pattern handles both with a single element.
- **Reduced redundancy**: Consolidating branding into the sidebar footer and removing a separate right-panel callout keeps the main content area focused.

## When to Apply

- Placing any transparent-background logo on a dark surface (sidebar, footer, modal overlay)
- Building sidebar footers that must work in both persistent desktop layouts and collapsible mobile drawers
- Consolidating branding/attribution content from multiple locations into a single location

## Examples

**Before — inline text-only branding, always pushed to bottom:**

```tsx
<div className="mt-auto border-t border-white/10 px-5 py-4">
  <p className="text-[11px] leading-relaxed text-white/45">
    Built by Alpha Toronto.{" "}
    <span className="text-white/60">
      Know someone in Toronto?{" "}
      <a href="https://alphatoronto.org" className="text-alpha-sky underline ...">
        alphatoronto.org
      </a>
    </span>
  </p>
</div>
```

Problems: no logo presence, `mt-auto` always applied (creates gap on mobile), low-contrast text.

**After — logo badge with responsive spacing:**

```tsx
<div className="lg:mt-auto mt-4 border-t border-white/10 px-4 py-4 flex flex-col items-center gap-2.5 text-center">
  <p className="text-[11px] text-white/55 flex items-center gap-1.5">
    <span>With</span>
    <span className="text-red-400">❤️</span>
    <span>by</span>
  </p>
  <a
    href="https://alphatoronto.org"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white rounded-lg px-3 py-2 inline-block hover:shadow-md transition-shadow"
  >
    <Image
      src="/artifacts/Alpha_Toronto_Transparent.png"
      alt="Alpha Toronto"
      width={140}
      height={42}
      className="h-7 w-auto"
    />
  </a>
  <p className="text-[11px] leading-relaxed text-white/55">
    Know someone in Toronto?{" "}
    <a
      href="https://alphatoronto.org"
      target="_blank"
      rel="noopener noreferrer"
      className="text-alpha-sky underline underline-offset-2 hover:text-white transition-colors"
    >
      alphatoronto.org
    </a>
  </p>
</div>
```

## Related

- [Auth-aware layout and routing patterns](hub-auth-aware-layout-and-routing-patterns-2026-04-30.md) — covers the same sidebar component's auth navigation and mobile drawer accessibility (focus trap, Escape-to-close)
- [Unified app migration guide](nextjs-unified-app-migration-from-split-structure-2026-04-29.md) — explains why branding lives in the sidebar component rather than a layout file
