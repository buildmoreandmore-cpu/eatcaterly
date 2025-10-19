# Current Experience & UX Narrative

## Product Snapshot
- **Context:** SMS-driven ordering platform supporting landing acquisition, two-step business onboarding, Stripe-backed plan selection, and admin dashboards for menu broadcasts.
- **Sources Reviewed:** `UX_DESIGN_AUDIT.md`, landing components under `src/components/landing`, onboarding flow (`src/app/onboarding/plan/page.tsx`), and admin dashboard surface (`src/app/admin/page.tsx`).

## Current Experience Report

### What Works Well
- **Value Prop Framing:** Hero section combines bold headline, social proof ticks, and CTA stack that matches the promise of fast menu broadcasting (`src/components/landing/Hero.tsx`).
- **Pricing Transparency:** Plan cards expose price, feature granularity, promo behaviour, and payment reassurance modules, reducing decision anxiety (`src/app/onboarding/plan/page.tsx`).
- **Operational Overview:** Admin dashboard corrals KPIs, menu inventory, and quick actions into predictable panels, lowering daily task friction (`src/app/admin/page.tsx`).

### Where Flow Breaks
- **Pre-signup Proof:** Landing lacks live demo or real success metrics; “Watch Demo” is a dead-end button without modal or link (`src/components/landing/Hero.tsx`).
- **Onboarding Branching:** Promo-driven zero-cost path hides behind URL parameters; error messaging is generic and lacks field-level hints (`src/app/onboarding/plan/page.tsx`).
- **Admin Orientation:** Dashboard depends on data availability; fallback demo content is helpful but no first-run checklist, and quick actions mix links and inert buttons (`src/app/admin/page.tsx`).
- **Design Source of Truth:** Audit confirms no Figma files, personas, or journey maps exist, making cross-team alignment ad hoc (`UX_DESIGN_AUDIT.md`).

### Narrative of How We Got Here
The build proceeded code-first: developers encoded layout, color, and component decisions directly in Tailwind/React without companion wireframes or a tracked design system. UX debt now shows up as:
1. **Implicit Design Tokens** — palette and spacing live in CSS but are undocumented (`UX_DESIGN_AUDIT.md`).
2. **Assumption-Led Journeys** — user flows inferred from routing, not user validation.
3. **Reactive Accessibility** — semantics exist, but contrast, keyboarding, and assistive tech pathways remain untested.

## Annotated Screens / Mockups

### 1. Landing Hero Alignment
```
┌───────────────────────────────────────────────────────────┐
│ H1 "Catering. Made simple."                               │ ← Clear value prop, bold hierarchy
│ Subcopy explains SMS-led menu sharing                     │ ← Matches core workflow promise
│ [ Get Started Free ]   [ Watch Demo ]                     │ ← Primary CTA solid; secondary lacks destination ⚠︎
│ ✔ Free 14-day trial   ✔ No credit card required           │ ← Social proof ticks reinforce trust
└───────────────────────────────────────────────────────────┘
```
- **Critical Decision:** Dual CTA pattern with proof badges builds credibility fast.
- **Gap:** Secondary CTA should launch demo or link to async video to avoid dead-end (`src/components/landing/Hero.tsx`).

### 2. Plan Selection Confidence Builders
```
┌──────────────────────┐    ┌────────────────────────┐
│ STARTER              │    │ PRO (Most Popular)     │ ← Badge drives selection bias
│ $65 / month          │    │ $125 / month           │
│ Feature checklist    │    │ Expanded capabilities  │
│ [Select Starter]     │    │ [Select Pro]           │
└──────────────────────┘    └────────────────────────┘
            ↓ Highlight ring when selected, CTA label shifts to “Selected ✓”
                      ↓ Assurance tiles: Secure Payment / Trial / Guarantee
```
- **Critical Decision:** Visual differentiation + reassurance stack reduces purchase anxiety.
- **Gap:** Promo validation is silent success; add inline confirmation + discount math disclosure (`src/app/onboarding/plan/page.tsx`).

### 3. Admin Dashboard Day-One Flow
```
Dashboard Header → Broadcast Menu button (primary task)
│
├─ KPI Cards grid (Customers, Orders, Revenue, Today’s Orders, SMS)
│          ↑ Color-coded icons aid quick scanning
│
├─ Today’s Menu panel listing menu items, availability, pricing
│          ↑ Demo data fallback prevents empty state
│
└─ Quick Actions grid
           ↑ Mix of anchor and static buttons creates affordance confusion ⚠︎
```
- **Critical Decision:** Organizing KPIs above actionable menu management aligns with operator workflow.
- **Gap:** Introduce empty-state onboarding checklist + align all quick actions to consistent link/CTA behaviour (`src/app/admin/page.tsx`).

## Accessibility & Usability Summary

| Priority | Issue | Impact | Current State | Recommendation |
| --- | --- | --- | --- | --- |
| P0 | Keyboard focus visibility | Blocks keyboard users from easily tracking position | Tailwind defaults, no custom focus rings | Define focus tokens and audit interactive components (`src/components/landing/*`, `src/app/admin/page.tsx`) |
| P1 | Color contrast verification | Low-vision legibility | Palette unchecked vs WCAG AA | Run contrast audit, adjust orange/gray usage (`UX_DESIGN_AUDIT.md`) |
| P1 | CTA consistency & affordance | Cognitive load during onboarding | Mixed button/link patterns, dead-end CTAs | Standardize CTA components + ensure destinations exist (`Hero.tsx`, `plan/page.tsx`, `admin/page.tsx`) |
| P2 | Screen reader semantics | Assistive tech comprehension | Basic HTML only, ARIA missing | Add landmarks, announce async states, attach descriptive alt text |
| P2 | Mobile-first layouts | Majority SMS journeys on mobile | Tables & admin grids overflow on small screens | Introduce responsive table patterns and mobile nav |

## Recommendations for Next Iteration
1. **Stitch a Baseline Design Kit:** Capture existing components in Figma, including tokens from `globals.css`, to create a single, inspectable source of truth (impact: future velocity, onboarding clarity).
2. **Instrument Onboarding Validation:** Add inline feedback for promo codes, expose plan comparison helper, and set up first-run success checklist to raise conversion confidence (`src/app/onboarding/plan/page.tsx`).
3. **Fix CTA & Interaction Debt:** Connect “Watch Demo,” align admin quick actions to navigable destinations, and add hover/focus states to satisfy usability heuristics.
4. **Launch Accessibility Sprint:** Run WCAG AA scan (contrast, keyboard, ARIA) and create a recurring checklist embedded in PR process to mitigate legal and ethical risk.
5. **Kick Off Foundational Research:** Schedule 5 owner interviews + lightweight usability tests on onboarding and SMS ordering to validate assumptions captured in `UX_DESIGN_AUDIT.md`.

