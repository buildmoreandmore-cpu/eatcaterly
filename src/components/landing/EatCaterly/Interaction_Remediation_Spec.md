# CTA & Interaction Remediation Spec

Purpose: translate “Fix CTA & Interaction Debt” into concrete implementation steps for engineering/design.

## 1. Landing “Watch Demo” CTA (`src/components/landing/Hero.tsx:23-33`)

- **Current State:** Static `<button>` with no handler → user dead-end.
- **Decision:** Convert to linkable secondary CTA.
- **Implementation Options:**
  1. Link to hosted video (`/demo` or external `https://...`) using `<Link>` for internal route.
  2. If modal preferred, create `DemoModal` component triggered by CTA, with accessibility (dialog role, focus trap).
- **Copy Update:** “Watch Demo” → “Watch 2-min Demo” (sets expectation).
- **Analytics:** Track click events (`data-analytics="hero-demo-cta"`).
- **Accessibility:** Ensure focus state visible (`focus:ring-offset-2 focus:ring-orange-500`).

## 2. Pricing Flow Promo Feedback (`src/app/onboarding/plan/page.tsx:122-195`)

- **Pain Point:** Promo code success is invisible; errors generic.
- **Required Changes:**
  - Add inline status block beneath price:
    - Success: `bg-green-50`, message `Promo applied: {promoCode} – ${discount} off`.
    - Failure: `bg-red-50`, message returned from API.
  - Expose `loadingPromo` state with spinner icon inside `Validate` feedback line.
  - Update `setError` usage to map to specific contexts; display near `Continue` button and per-plan (if relevant).
- **UX Copy:** Provide discount math in plain language (“Your total today: $0, you’ll be billed $65/month starting Nov 1”).

## 3. Admin Quick Actions (`src/app/admin/page.tsx:290-318`)

- **Issue:** Mixed affordances—some buttons wrap links, others inert.
- **Resolution Path:**
  1. Convert grid into list of `<Link>` elements styled as buttons (consistent interactive pattern).
  2. If action not ready (e.g., “Send SMS”), add tooltip text “Coming soon” or disable with aria-disabled.
  3. Ensure each tile has icon, label, helper text, consistent spacing.
- **Empty State Add-on:** Introduce first-run checklist card above quick actions:
  - Steps: “Import customer list”, “Create first menu”, “Send first broadcast”.
  - Provide CTA for each step linking to respective screens.

## 4. Keyboard & Focus Tokens

- Define global focus ring utility (Tailwind plugin or custom class) to apply across CTAs: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`.
- Ensure modal/dialog components manage focus on open/close.

## 5. QA Checklist Before Ship

- [ ] Manual keyboard tab through hero, pricing, admin quick actions (Mac/Win).
- [ ] Verify `aria-label` on demo CTA if icon appended.
- [ ] Confirm promo success/failure messages are announced via `role="status"`.
- [ ] Add Jest/Playwright smoke test for hero CTA linking to `/demo`.
- [ ] Capture updated screenshots for documentation.

Implement these specs alongside the design kit to close the interaction debt highlighted in `Current_Experience_Report.md`.

