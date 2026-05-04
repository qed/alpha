---
date: 2026-05-03
topic: live-homepage
---

# Live Homepage from Website Template

## Problem Frame

The current homepage at `/` is a personal letter to Toronto Parents — valuable content but not a lead-capturing landing page. Meanwhile, a polished website template exists at `/hub/library/website-preview` as a static, non-functional preview. Converting this template into the live homepage with a working lead-capture form turns the site into an active enrollment funnel that feeds prospects directly into the Hub pipeline.

## Requirements

**Navigation Bar**

- R1. Top-left brand reads "Alpha Toronto Parents Hub" (matching the current design at `/`)
- R2. Remove "The Hub" link from the nav bar entirely
- R3. Top-right keeps "Join the community" link with the same external destination as current (`community.alpha.school`)
- R4. Add "For Parents" link in the nav bar to the left of "Join the community", linking to the letter content currently at `/`

**Letter Page**

- R5. Move the current homepage letter content (the personal letter to Toronto Parents) to its own route (e.g., `/my-story` or `/letter`)
- R6. The letter page uses the same public navbar as the new homepage

**Hero Section Lead Capture Form**

- R7. The hero section form is live and functional — submissions create prospects in the Hub pipeline
- R8. Form fields: First Name (required), Last Name (required), Email Address (required), Mobile Phone Number (optional), Postal Code (required), Child 1 Name (required), Child 1 Grade (required)
- R9. Support adding multiple children via an "add more" button (each additional child has name + grade, both required)
- R10. Below the form fields, display a privacy/consent note: committed to protecting and respecting your privacy, consent to contact with communications about Alpha Toronto
- R11. Form submission creates a prospect in the same pipeline table used by the existing intake form (exact server action reuse vs. new action deferred to planning)

**Pipeline View Updates**

- R12. In the pipeline prospect detail (the "about" section beneath email, phone, spouse, and source), display child name and child grade for each child — one line per child or grouped clearly

**"Where We Are" Progress Section**

- R13. First two circles are checkmarked (complete)
- R14. "50 commitments" circle is empty (not yet reached)
- R15. "Determining location" circle is empty (not yet reached)

**Interest Chart**

- R16. Title: "K-8 families Alpha Toronto (North, Central and West)"
- R17. Display grades K through 8 with random interest numbers between 4 and 12 for each grade

**Service Areas Section**

- R18. Heading: "Serving Families in the Greater Toronto Area"
- R19. Listed cities: Oakville, Mississauga, The City of Toronto, Thornhill, Vaughan, Markham, Richmond Hill, Newmarket

**Footer**

- R20. Bottom-left uses the same brand as the nav bar ("Alpha Toronto Parents Hub")
- R21. Middle displays "alphatoronto.org"
- R22. Copyright reads "Alpha Toronto"

## Success Criteria

- A visitor to `/` sees a polished landing page with a working lead-capture form
- Submitting the form creates a prospect in the pipeline with all provided data (parent info + children)
- Champions can see child name and grade in the pipeline prospect detail
- The letter to Toronto Parents is accessible via "For Parents" in the nav bar
- All Toronto-specific content (cities, school name, interest chart) renders correctly
- The website template at `/hub/library/website-preview` continues to exist as-is for champion reference

## Scope Boundaries

- The `/hub/library/website-preview` template remains unchanged — this work creates a new live homepage derived from it, not a modification of it
- No changes to the authenticated Hub dashboard beyond the pipeline "about" section (R12)
- No payment, enrollment, or application flow — this is lead capture only
- No CMS — content is hardcoded
- The interest chart numbers are static/hardcoded (random between 4-12), not pulled from real data

## Key Decisions

- **"For Parents" for letter link**: Clear audience signal, invites parents to read the personal narrative
- **Multiple children on form**: Parents with multiple school-age kids shouldn't need to submit twice; matches existing intake form capability
- **Postal code on form**: Enables geographic segmentation for North/Central/West targeting
- **Template stays intact**: Champions still need the generic preview; the homepage is Toronto-specific
- **Pipeline child display**: One line per child with name + grade makes it scannable for champions reviewing prospects

## Dependencies / Assumptions

- The existing intake form server action (`submitIntakeForm`) and Supabase prospect creation flow can be reused or adapted for the new homepage form
- The website template's layout and styling are the visual starting point; the homepage hardcodes Toronto-specific content (city list, interest chart, copy) independently from the generic template
- Postal code will need to be stored somewhere in the prospect data model (verify whether the field already exists)
- Turnstile CAPTCHA should protect the live form (same as existing intake form)

## Outstanding Questions

### Deferred to Planning

- [Affects R5][Technical] What route should the letter page live at — `/my-story`, `/letter`, or something else? Needs to work with existing routing structure.
- [Affects R7][Technical] Can the existing `submitIntakeForm` server action be reused directly, or does the different field set (adds postal code, removes spouse/source) require a new action?
- [Affects R8][Technical] Does the `prospects` table already have a `postal_code` column, or does a migration need to be added?
- [Affects R11][Technical] What should the `source` value be for homepage form submissions — e.g., "website" or "homepage"?
- [Affects R12][Technical] Where exactly in the pipeline drawer UI should child info appear, and what component renders the "about" section?

## Next Steps

-> `/ce:plan` for structured implementation planning
