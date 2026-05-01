---
date: 2026-05-01
topic: library-alpha-website-template
---

# Library: Full Alpha Website Template

## Problem Frame

Champions in the Hub need to show prospective families what a local Alpha school website looks like. Today, the only reference is the live Alpha South Bay LA site, which is geography-specific and hosted externally. Adding a genericized, full-fidelity website template gives champions an always-available, self-contained example they can walk families through.

## Requirements

**Library Integration & Delivery**

- R1. Add a 4th accordion section to the Library with the label "A full Alpha website"
- R2. The accordion item links to a standalone page (e.g., `/hub/library/website-preview`) that opens in a new browser tab
- R3. The standalone page renders a complete replica of the Alpha South Bay LA website (alphasouthbayla.org as of 2026-05-01), preserving all sections top to bottom, all styling, all images, and all charts

**Geography Genericization**

- R4. Replace every geography-specific reference (South Bay, Los Angeles, South Bay LA, Manhattan Beach, Hermosa Beach, etc.) throughout the entire page with generic equivalents. R5–R11 below are illustrative examples, not an exhaustive list — R4 is the operative rule.
- R5. Navbar brand: "Alpha Local City"
- R6. "Coming Soon" / High School section: remove "Los Angeles" in all places so it reads as a generic "Alpha High School"
- R7. "Indicative Interest by Grade" chart title: "Alpha Example City"; subtitle/small text: "from local families"
- R8. "Ready to be part of something different?" section: remove "South Bay"
- R9. Service areas section heading: "Serving Families in your local cities"; listed cities: Center City, City East, City West, City North, City South, City Suburbs
- R10. Footer: school name "Alpha Local City", website "alphalocalcity.org", copyright "Alpha Local City"
- R11. Enrollment Info tuition text and any other scattered geography references: replace with generic equivalents (e.g., "local families" instead of "South Bay families")

**Express Your Interest Form**

- R12. Replace the Express Your Interest form area with a static screenshot of the original HubSpot form, styled to match the surrounding page layout
- R13. The screenshot is non-interactive — no form fields, no submission, no confirmation state

**Events Section**

- R14. Under "This Week," replace individual event cards with the styled text "View all in Community Portal" (non-clickable — this is a template, not a live site)
- R15. Remove specific event details (dates, locations, event names) since they are geography- and time-specific

**Content Fidelity**

- R16. All other sections (Hero, The Alpha Model, See Alpha in Action, Daily Schedule, Enrollment Info, Where We Are progress tracker, SAT Scores, final CTA) are included and match the reference site's content, structure, and visual styling
- R17. All images from the reference site are downloaded and hosted locally in the repo
- R18. The "Indicative Interest by Grade" bar chart is rendered using a charting library (e.g., Recharts) so the title and labels can be genericized per R7
- R19. The "See Alpha in Action" video section embeds Alpha YouTube videos via iframe, playable inline on the page
- R20. Other interactive elements (accordion-style schedule, progress indicators) should be functional within the template

## Success Criteria

- A champion can click "A full Alpha website" in the Library, which opens a new tab showing a complete, polished website that looks professional and representative of what a local Alpha site would be
- No geography-specific references to South Bay or Los Angeles remain anywhere in the template
- The template is self-contained — no external dependencies on HubSpot or the live alphasouthbayla.org site (YouTube embeds for videos are acceptable)

## Scope Boundaries

- **Not** rendered inline in the Library accordion — it is a standalone page opened in a new tab
- **Not** connected to any backend — events are static, form is a screenshot
- **Not** editable by champions — this is a read-only reference/template
- No CMS or dynamic content — all content is hardcoded in the component
- Content is a point-in-time snapshot (2026-05-01) — staleness is an accepted tradeoff; the template can be updated manually if the reference site changes materially

## Key Decisions

- **Standalone page in new tab**: Avoids nested scrolling, compressed viewport, and accordion conflicts. The Library accordion item acts as a labeled link. Resolves the delivery mechanism concern raised in review.
- **Static screenshot for form**: Eliminates the risk of families filling in a demo form that discards data, removes the need to research HubSpot form fields, and avoids building a parallel intake flow.
- **Chart library for bar chart**: Allows the chart title and labels to be genericized in code (R7) rather than editing a static image.
- **YouTube embeds for videos**: Keeps the "See Alpha in Action" section fully functional with real Alpha content.
- **Genericize all geography**: Every South Bay/LA reference is replaced, not just the ones explicitly listed (R4 is operative; R5–R11 are examples). This ensures the template reads as a clean generic example.
- **Events replaced with static text**: "View all in Community Portal" is styled text, not a link — consistent with the template being a non-functional preview.

## Dependencies / Assumptions

- The reference site (alphasouthbayla.org) is the source of truth for content, layout, and styling as of 2026-05-01
- Images and chart assets from the reference site will need to be downloaded and hosted locally in the repo
- A charting library (e.g., Recharts) will need to be added as a project dependency
- Existing tests in `hub-library-page.test.tsx` assert exactly 3 accordion items and will need updating to expect 4
- A screenshot of the Express Your Interest form will need to be captured and stored as a local image asset

## Outstanding Questions

### Deferred to Planning

- [Affects R3][Technical] Should the standalone page be a new route under `/hub/library/` or a separate top-level route? Consider auth requirements and sidebar visibility.
- [Affects R3][Technical] CSS isolation strategy — the template needs its own styling that doesn't leak into the Hub's Tailwind theme, and vice versa. Evaluate scoped styles, CSS modules, or a wrapper with reset.
- [Affects R17][Technical] Content inventory needed: crawl the reference site to count all images, sections, and assets before estimating implementation scope.
- [Affects R18][Technical] Which charting library to use (Recharts, Chart.js, etc.) — evaluate bundle size impact and whether code-splitting the template page mitigates it.

## Next Steps

-> `/ce:plan` for structured implementation planning
