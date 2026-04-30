# Handoff: Champions Hub

> **For Claude Code:** start by reading this file, then `prototype/Champions Hub.html` (open it in a browser to interact). The prototype is the source of truth for visuals and behavior; this README is the source of truth for **what's already in the codebase, what's net-new, and the order to build it**.

---

## TL;DR

We're upgrading the Champion experience in the existing Next.js app at `src/app/(dashboard)/(champion)/`. The current MVP has a working CRM (prospects, stages, notes, follow-up dates). This design adds:

1. **Conversation Co-pilot** on the prospect detail screen — synthesizes what to do next based on contact data
2. **Heat score, concerns, signals** on prospects (additive Supabase columns)
3. **Library** of FAQs / testimonials / talking points + send-to-prospect composer
4. **Today's Briefing** on the dashboard (3 follow-ups + 1 library refresh + 1 event)
5. **Personal landing page builder** at `/{geography}/c/{champion-slug}` (last priority)

The design is **high-fidelity**. Recreate visually pixel-close using the existing Tailwind 4 theme tokens in `src/app/globals.css`. The prototype HTML/JSX is a reference — **do not** copy code into the Next.js app. Reimplement with the existing patterns (`StatusBadge`, `ProgressBar`, `prospect-table.tsx`, server actions in `src/lib/actions/`, `@tanstack/react-table`, Clerk auth, Supabase RLS).

---

## Codebase context (read before coding)

You're working inside `alphahub/` — a Next.js 16 + React 19 + Tailwind 4 + Supabase + Clerk app. **Important:** read `alphahub/AGENTS.md` first — Next 16 has breaking API changes from your training data, and there's a hard rule to consult `node_modules/next/dist/docs/` before writing any Next-specific code.

### What's already shipped (do not rebuild)

| Concern | File | Notes |
|---|---|---|
| Pipeline stages | `src/lib/constants/pipeline.ts` | `interested`, `shadow-day`, `committed`, `enrolled`, `lost`. Threshold = 25. `ALLOWED_TRANSITIONS` enforces valid stage moves. **Do not rename or add stages** without an explicit ask. |
| Status badge | `src/components/shared/status-badge.tsx` | Reuse. |
| Progress bar | `src/components/shared/progress-bar.tsx` | Reuse for the deposit thermometer. |
| Prospect table | `src/components/dashboard/prospect-table.tsx` | Already uses `@tanstack/react-table`. Extend, don't replace. |
| Prospect detail | `src/components/dashboard/prospect-detail.tsx` | This is where the **Co-pilot** lands. |
| Notes log | `src/components/dashboard/notes-log.tsx` | Reuse for the Activity timeline. |
| Pipeline summary | `src/components/dashboard/pipeline-summary.tsx` | The dashboard's pipeline-by-stage block already exists. |
| Server actions | `src/lib/actions/prospects.ts`, `notifications.ts`, `champions.ts` | Add new actions here. |
| Geography model | `src/lib/constants/geographies.ts`, `src/types/database.ts` | Champions are scoped to a `geography_id`. RLS already enforces this. |
| Auth | `@clerk/nextjs` | Don't touch. |

### Design tokens (already in `src/app/globals.css`)

Use Tailwind classes mapped to these CSS vars. **Do not introduce new color values.**

```
alpha-blue: #0000FF        alpha-blue-600/700/ink
alpha-sky: #CFE5FF         alpha-sky-soft, alpha-sky-50
alpha-sun: #FFD24A         alpha-coral: #FF7A59
ink, ink-2, ink-3, ink-4   line, line-2, border-strong
paper, paper-2, paper-3
success #0E8A5F            warning #B85C00            danger #C41E3A

font-display: Archivo
font-body: Inter
font-editorial: Instrument Serif (italic accents only)

radius: xs(4) sm(8) md(14) lg(20) xl(28) 2xl(40) pill(999)
shadow: sm, md, lg, blue
```

The prototype's `champion.css` has hand-written CSS that mirrors these tokens — translate to Tailwind utilities.

---

## Build order (recommended)

Build in this order. Each phase is shippable on its own.

### Phase 1 — Schema migration (additive, non-breaking)

Add four new fields to `prospects` and one new table. No existing columns change.

```sql
-- 0010_champion_copilot.sql
alter table prospects add column heat_score smallint default 3 check (heat_score between 1 and 5);
alter table prospects add column concerns text[] default '{}';
alter table prospects add column engagement_signals text[] default '{}';
alter table prospects add column last_touch_at timestamptz;

-- Library
create table library_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('faq', 'quote', 'talking', 'data')),
  title text not null,
  body text not null,
  author_id uuid references profiles(id),
  audience text[] default '{}',
  concern text,                          -- the concern this addresses (matches concerns array)
  geography_id uuid references geographies(id), -- null = global
  send_count int default 0,
  helpfulness_score smallint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table library_sends (
  id uuid primary key default gen_random_uuid(),
  library_item_id uuid not null references library_items(id),
  prospect_id uuid not null references prospects(id),
  champion_id uuid not null references profiles(id),
  channel text not null check (channel in ('email', 'sms', 'whatsapp', 'link')),
  sent_at timestamptz default now(),
  opened_at timestamptz
);

-- Update last_touch_at automatically when notes/sends/status changes happen
create or replace function update_prospect_last_touch() returns trigger ...
```

Defined enums for concerns and signals (keep in `src/lib/constants/champion.ts`):

```ts
export const CONCERNS = [
  "tuition", "pace", "accreditation", "screen-time",
  "socialization", "transcripts", "religion", "spouse-buy-in",
] as const;

export const ENGAGEMENT_SIGNALS = [
  { id: "faq",     label: "Sent FAQ" },
  { id: "1-1",     label: "1:1 conversation" },
  { id: "intro",   label: "Introduced to parent" },
  { id: "deposit", label: "Shared deposit link" },
  { id: "tour",    label: "Toured Austin/Brownsville" },
  { id: "shadow",  label: "Booked shadow day" },
] as const;
```

### Phase 2 — Co-pilot on Prospect Detail (the killer feature)

Modify `src/components/dashboard/prospect-detail.tsx`. Add a `<Copilot>` block at the top of the layout, **above** the existing prospect summary card.

The Co-pilot logic is rules-based for v1 (no LLM yet — keep it deterministic so it's debuggable):

```ts
function generateCopilotBriefing(prospect: ProspectWithChildren, library: LibraryItem[]) {
  const daysSince = differenceInDays(new Date(), new Date(prospect.last_touch_at ?? prospect.created_at));
  const primaryConcern = prospect.concerns[0];
  const matchedItems = library
    .filter(l => prospect.concerns.includes(l.concern))
    .sort((a, b) => b.helpfulness_score - a.helpfulness_score)
    .slice(0, 3);

  return {
    summary: `Last touch ${daysSince}d ago. ${primaryConcern ? `Primary concern: ${primaryConcern}.` : "No active concerns flagged."} Heat ${prospect.heat_score}/5${prospect.heat_score >= 4 ? " — close." : "."}`,
    nextMove: deriveNextMove(prospect, daysSince),
    suggestedItems: matchedItems.length ? matchedItems : library.slice(0, 3),
  };
}
```

`deriveNextMove` is a small rules engine: heat 5 + cold touch → "send a check-in", concerns include "tuition" + no recent send of l04 → "send 'Three things to say to the tuition-skeptic spouse'", etc. **Document the rules in code comments** so champions can later see why the Co-pilot says what it says.

Visual: indigo gradient card (`bg-alpha-blue` to `bg-alpha-blue-700`), white body text with serif italic for the lead sentence, "Suggested next move" pill, then a 3-card row of suggested library items. See `prototype/champion.css` `.copilot` and `prototype/crm.jsx` `<ContactDrawer>` for the exact layout.

**One state addition**: signals are toggleable from the detail panel and persist via a new `updateProspectSignals` server action.

### Phase 3 — Library

New page: `src/app/(dashboard)/(champion)/library/page.tsx`. Use the existing dashboard layout.

Two view modes — start with **faceted** (filter sidebar + 2-column grid). Defer "feed" mode to a follow-up.

Card components: `<LibraryCard>` with type-specific styles for `faq | quote | talking | data`. Send button opens a modal (`<SendComposer>`) — pre-fills subject/body templated with prospect first name and library item title/body. Channel toggle (email / SMS / whatsapp / copy-link). On send: insert `library_sends` row, increment `library_items.send_count`, optionally auto-add the matching engagement signal to the prospect.

Authority model: champions can submit new library items, but they go to a `pending` state until an admin promotes them. Add an admin queue at `src/app/(dashboard)/(admin)/library/`.

### Phase 4 — Dashboard reshape

Modify `src/app/(dashboard)/(champion)/dashboard/page.tsx`. Stack:

1. **KPI strip** — 4 cards. Featured one is "Deposits N/25" in `alpha-blue`. Others: active pipeline, total contacts, streak.
2. **Thermometer** — full-width card with the `ProgressBar` pegged to the geography's `enrollment_threshold`. "Mississauga · Port Credit Campus / Toward _opening day_." with the count on the right.
3. **Today's Briefing** — 3-column white card with `ink` chrome. Three cells: "3 Follow-ups" (computed from heat * 4 + days_since), "1 Refresh / 1 Event Reminder", "Watch" (cooling off + warming up). Each item is a click-through.
4. **Two-col footer** — existing `<PipelineSummary>` on the left, "This week" stats on the right.

### Phase 5 — Page Builder (lowest priority)

Public-facing landing pages for champions. Route: `src/app/(public)/[geography]/c/[champion-slug]/page.tsx`. Block-based composition — pre-defined block types (`hero`, `story`, `testimonial`, `events`, `cta`). Stored as JSON on a new `champion_pages` table. Lo-fi in the prototype — treat that as wireframe-fidelity.

---

## Privacy contract (non-negotiable)

From design conversations:

- **Prospects added manually by a champion are private notes.** The prospect knows nothing — no email, no notification.
- **Prospects only enter the system as a real record when they themselves take an action** (RSVP to an event, click a champion's link).
- **Heat score, concerns, private notes are champion-only.** Never expose to the prospect or to other champions.
- **Cross-champion attribution is multi-attributed** — a prospect can appear in multiple champions' pipelines. There's no "owner".
- No leaderboards in v1. Champions see only their own geography's progress.

---

## Screens

### 1. Champion Dashboard
`/dashboard`

Layout: stacked, max-width none, `p-8` page padding inside the existing dashboard chrome.

- **Legend banner** (only shown during rollout): green dot = "shipped", coral dot = "proposed in v1". Remove once everything ships.
- **KPI row** — `grid-cols-4 gap-4`. The featured Deposits card is `bg-alpha-blue text-white`, big number is `font-display font-extrabold text-4xl tracking-tight`, with `<em>` (italic Instrument Serif) for the "/25".
- **Thermometer card** — white, `rounded-2xl border-line p-8`. "Mississauga · Port Credit Campus" eyebrow in `font-display tracking-widest uppercase text-xs text-ink-4`. Headline uses `font-display` with an italic `font-editorial` accent on "opening day."
- **Briefing card** — white, three columns, sticky-ish feel. Top bar `bg-paper-3` with date + sparkle icon + "Generated 6:42am". Each cell has its own H5 + 2–4 brief items.
- **Two-col** — pipeline summary (existing component) + this-week stats.

### 2. Pipeline (CRM)
`/prospects` (already exists, extend)

Add to existing table:
- **Heat column** — small bar pip indicator (`prototype/champion.css` `.heat`)
- **Concerns column** — chip row, max 2 visible + "+N"
- **Days since touch** — color-coded (red if > 14)
- **Next action** — text column
- **Kanban toggle** — second view mode, 5 columns by stage. Persist preference per-user.

### 3. Prospect Detail (Drawer or Page — your call)

The existing implementation is a full page. The prototype shows it as a 920px right-side drawer. Either works — drawer is faster for power users (David has 112 prospects), full-page is what's already routed. **Recommendation: keep the existing route, restyle the page.** Drawer can come later.

Order of blocks on the page:
1. **Header** — name, kids string, neighborhood, status badge, heat, last touch chip, action buttons (Call / Send from library / Log activity).
2. **Co-pilot** — indigo gradient, full-width.
3. **Activity timeline** — uses existing `<NotesLog>` + `status_history` rendered as a vertical timeline.
4. **Aside (right rail, 360px on lg+ breakpoints)** — About, Engagement signals (toggleable grid), Concerns (tag chips + add), Private notes (italic editorial).

### 4. Library
`/library` (new)

Faceted layout: 240px left sidebar (type + concern filters) + 2-column card grid. Quote-type cards lead with the testimonial body in `font-editorial italic`. Each card has a "Send →" button that opens `<SendComposer>`.

### 5. Events
`/events` (likely new, or extension of admin events)

Card grid (2-col) of upcoming events. Date block on the left (`alpha-coral`-tinted), title + location, RSVP count on the right. Below: "Recent RSVPs" table — each RSVP auto-creates a prospect at the appropriate stage. **This is the only ingestion path that creates a prospect record without manual entry.**

### 6. My Page (page builder)
`/me/page` for editor; `/{geography}/c/{slug}` for public.

Two-pane: 320px tools panel left (URL, add-block grid, stats, publish button), large preview canvas on the right showing rendered blocks. Each block has a hover-only label tag in the corner. Lo-fi — wireframe-fidelity is fine for first cut.

---

## Co-pilot suggested-items algorithm (precise)

```
matched = library_items.filter(item =>
  item.concern && prospect.concerns.includes(item.concern)
)
sorted = matched.sort((a,b) =>
  b.helpfulness_score * 2 + b.send_count
  - (a.helpfulness_score * 2 + a.send_count)
)
final = sorted.slice(0, 3)
if final.length < 3:
  final += top library items by send_count, deduped, until length = 3
```

`deriveNextMove` rules (in priority order; first match wins):

1. `stage === "lost"` → "Re-engagement isn't worth your time. Move on."
2. `daysSince > 21 && heat <= 2` → "21d cold + low heat. One last public-event invite, then archive."
3. `concerns.includes("tuition") && !sentSignals.includes("l04")` → "Send 'Three things to say to the tuition-skeptic spouse'."
4. `stage === "interested" && heat >= 4 && daysSince > 5` → "Hot + cooling. Suggest a coffee or a shadow day."
5. `stage === "shadow-day" && !daysSinceShadow` → "Confirm shadow-day logistics within 48h."
6. `stage === "committed"` → "Loop into the depositors thread, send onboarding doc."
7. fallback → "Check in with a personalized note."

Keep these as a `nextMoveRules` array in `src/lib/champion/copilot.ts` so they're easy to tune.

---

## What is **not** in this handoff

- LLM-powered Co-pilot. v1 is fully rules-based and deterministic.
- Geographic map of prospects (deferred from "Block Party" creative direction).
- Cross-geography leaderboard (explicitly cut).
- Notification system for prospects when they're added (privacy contract: never).
- Payment integration for the $1,000 deposit (assume existing stripe-or-equivalent flow already exists — wire to "Place deposit" button only when shown a hook).

---

## Files in this handoff

```
design_handoff_champions_hub/
├── README.md                    ← this file
└── prototype/
    ├── Champions Hub.html       ← open in browser; main entry point
    ├── champion.css             ← all design CSS — translate to Tailwind utilities
    ├── data.jsx                 ← shape of mock prospects, library, events, signals, concerns
    ├── primitives.jsx           ← Icon, StagePill, Heat, Avatar, Wordmark
    ├── shell.jsx                ← Sidebar + PageBar
    ├── dashboard.jsx            ← Champion Dashboard
    ├── crm.jsx                  ← Pipeline + ContactDrawer (Co-pilot lives here)
    ├── library.jsx              ← Library faceted/feed views
    ├── other-screens.jsx        ← Events + PageBuilder + SendComposer
    ├── system/
    │   ├── colors_and_type.css  ← brand tokens (mirrors src/app/globals.css)
    │   └── kit.css              ← brand utility classes
    └── assets/
        └── logo-white.svg       ← Alpha wordmark
```

To run the prototype locally: `cd prototype && python3 -m http.server 8000` then open `http://localhost:8000/Champions Hub.html`.

---

## Suggested first prompt for Claude Code

> Read `design_handoff_champions_hub/README.md`. Then read `src/components/dashboard/prospect-detail.tsx`, `src/lib/constants/pipeline.ts`, and `src/types/database.ts`. Confirm you understand:
>
> 1. Which features are already shipped vs proposed
> 2. The non-negotiable privacy contract
> 3. The Phase 1 schema migration is fully additive
>
> Then propose a minimal first PR that ships only Phase 1 (migration + types + constants), no UI changes yet. Don't write code until I approve the plan.
