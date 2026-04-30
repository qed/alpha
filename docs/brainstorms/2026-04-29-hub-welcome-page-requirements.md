---
date: 2026-04-29
topic: hub-welcome-page
---

# Hub Welcome Page & Navigation Consistency

## Problem Frame

The Alpha Hub (`/hub`) currently has no public-facing landing page — unauthenticated visitors are immediately sent to a sign-in form with no context about what the hub is or why they should join. The hub also uses a different navbar than the root page, creating a visual disconnect. Additionally, after signing in, users are redirected to `/` instead of back into the hub.

## Requirements

**Welcome Page**
- R1. `/hub` displays a public welcome page for unauthenticated visitors that explains what the Alpha Parents Hub is
- R2. The welcome page communicates the value proposition: you love Alpha School in your community and want tools to help more people commit
- R3. The welcome page previews planned tools — a shared library of FAQs, parent testimonials, and "why Alpha" talking points — displayed as cards or icons
- R4. The welcome page frames joining as becoming a leader for Alpha School in your community, with access to tools for tracking conversations and having resources on hand
- R5. The welcome page includes a single "Enter the Hub" CTA button that navigates to `/hub/sign-in` (Clerk handles both sign-in and sign-up on that page)

**Welcome Page Content Structure**
- R9. The page follows this section flow: Hero (headline + tagline) → Value Proposition → Tools Preview (3 cards) → Leader Framing → CTA

**Navigation Consistency**
- R6. The hub welcome page uses the identical navbar from the root page — same Alpha Toronto logo, "Parents Hub" label, "The Academics" link, and "Join the Community" button

**Auth Flow**
- R7. Logged-in users visiting `/hub` bypass the welcome page and are redirected to their role-appropriate dashboard (admin → leaderboard, champion → dashboard). Users with no recognized role default to champion.
- R8. Post-sign-in redirect to `/hub` — decoupled from this feature. Env vars already fixed locally; verify Vercel dashboard matches (see Dependencies).

## Success Criteria

- A new visitor to `/hub` immediately understands what the hub is, who it's for, and why they should join
- Navigation feels consistent between the root page and the hub welcome page
- Sign-in flow returns users to the hub, not the home page
- An authenticated user with no role assignment lands on the champion dashboard without errors

## Scope Boundaries

- The welcome page is a static marketing/pitch page — no dynamic content or database queries
- No changes to the dashboard navbar (the authenticated experience stays as-is)
- No sign-up flow changes — Clerk handles that
- The actual tools (FAQs library, testimonials, talking points) are described on the welcome page but not built as part of this work
- R8 env var fix is out of scope for this feature — it ships independently as a prerequisite

## Key Decisions

- **Logged-in users bypass the welcome page**: Returning users don't need the pitch every time — send them straight to their dashboard
- **Same navbar as root, not the dashboard navbar**: The welcome page is a public marketing surface, so it should match the root page's look and feel. Toronto-specific branding is correct since the hub is Toronto-focused for now.
- **No-role fallback defaults to champion**: Aligns with the default in `src/lib/auth.ts`. Note: `/hub/page.tsx` currently does not implement this — it needs updating to redirect unrecognized roles to `/hub/dashboard` instead of `/hub/sign-in`.
- **Single CTA button**: One "Enter the Hub" button navigates to the Clerk sign-in page, which handles both sign-in and sign-up
- **R8 decoupled**: The sign-in redirect fix is an env var change, not code — fix it independently before the welcome page work

## Dependencies / Assumptions

- Prerequisite (done locally, verify on Vercel dashboard): `NEXT_PUBLIC_CLERK_SIGN_IN_URL` corrected to `/hub/sign-in` in `.env.local`. Verify the Vercel dashboard env var matches.
- Prerequisite (done locally, verify on Vercel dashboard): `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` set to `/hub` in `.env.local`. Verify the Vercel dashboard env var matches.
- The current `/hub/page.tsx` does not implement the no-role fallback described in R7 — it redirects unrecognized roles to sign-in. This needs a code change to default to the champion dashboard.

## Next Steps

-> `/ce:plan` for structured implementation planning
