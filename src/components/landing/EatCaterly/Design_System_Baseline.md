# Design System Baseline Kit (v0.1)

This document captures the current visual + interaction tokens encoded in code so they can be imported into a Figma library quickly.

## 1. Color Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `brand/primary-50` | `#EFF6FF` | Background tints for hero/sections |
| `brand/primary-100` | `#DBEAFE` | Secondary CTA hover, info accents |
| `brand/primary-500` | `#3B82F6` | Primary CTA (legacy code) |
| `brand/primary-600` | `#2563EB` | Primary CTA hover |
| `brand/primary-700` | `#1D4ED8` | High-emphasis buttons/text |
| `brand/accent-500` | `#F97316` | Current CTA highlight (landing hero) |
| `status/success-500` | `#10B981` | Status badges, tick icons |
| `status/error-500` | `#EF4444` | Validation errors |
| `status/warning-500` | `#F59E0B` | Promo and caution highlights |
| `neutral/50` | `#F9FAFB` | Section backgrounds |
| `neutral/200` | `#E5E7EB` | Borders |
| `neutral/400` | `#9CA3AF` | Secondary text |
| `neutral/900` | `#111827` | Body text |

> Import these as global color styles in Figma (`brand/`, `status/`, `neutral/` folders) and map to Tailwind class equivalents for dev parity.

## 2. Typography Scale

| Style | Tailwind | px | Usage |
| --- | --- | --- | --- |
| `display/lg` | `text-6xl` | 60 | Hero headline |
| `display/md` | `text-5xl` | 48 | Section headers |
| `heading/lg` | `text-4xl` | 36 | Onboarding titles |
| `heading/md` | `text-3xl` | 30 | Admin section titles |
| `heading/sm` | `text-2xl` | 24 | Card headers |
| `body/lg` | `text-xl` | 20 | Landing supporting copy |
| `body/md` | `text-base` | 16 | Default copy |
| `body/sm` | `text-sm` | 14 | Helper text |
| `meta` | `text-xs` | 12 | Labels, badges |

- **Fonts:** Geist Sans (primary), Geist Mono (code), fallback `system-ui`.
- **Weights:** 700 (bold), 600 (semibold), 500 (medium), 400 (regular).
- Set line heights: display 120%, heading 130%, body 150%.

## 3. Spacing & Layout

- **Spacing scale:** Tailwind base (`4px` steps). Common combos:
  - Section padding: `py-20` (80px), `lg:py-32` (128px)
  - Card padding: `p-8` (32px) to `p-10` (40px)
  - Stack gaps: `space-y-8`, `gap-12`
- **Grid system:** `max-w-7xl` (1280px) center alignment, `grid lg:grid-cols-2` for hero, `md:grid-cols-2` for plan grid.
- **Border radius:** `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px). Use `rounded-2xl` for hero card, `rounded-lg` for admin cards, `rounded-full` for badges.

## 4. Components Inventory (to recreate as Figma components)

1. **Buttons**
   - Primary Solid (`bg-orange-500`, `text-white`)
   - Primary Variant (`bg-blue-600`, `hover:bg-blue-700`)
   - Secondary Outline (`border-gray-300`, `hover:bg-gray-50`)
   - Destructive (`bg-red-500`), Success (`bg-green-500`)
   - Loading state with spinner overlay (`Button` component in `@/components/ui/button`)

2. **Form Inputs**
   - Text input: `border-gray-300`, `focus:ring-blue-500`, `rounded-lg`, `px-4 py-3`
   - Textarea, select, checkbox, radio (same visual system)
   - Error state: red border + helper text

3. **Cards**
   - Hero menu card (`rounded-2xl`, `shadow-2xl`, `p-10`)
   - Pricing plan card with selectable outline (`border-4 border-blue-500` when active)
   - Admin stat card (`shadow`, `p-5`, icon container)

4. **Badges & Tags**
   - Popular badge (`bg-orange-500`, `text-white`, `rounded-full`)
   - Status tags (`bg-gray-100` base)

5. **Tables/List Items**
   - Admin menu list tile (name, description, badge, price, status)

6. **Feedback**
   - Alert box: `bg-red-50`, `border-red-200`, `rounded-lg`, `p-4`
   - Toast/notification placeholders (define in next iteration)

## 5. Interaction Patterns

- **Hover:** Use `shade-600` for solid buttons, `bg-gray-50` for outlines.
- **Focus:** Needs dedicated spec—recommend `outline: 2px solid #2563EB` with `outline-offset: 2px`.
- **Selection:** Pricing cards use border + `ring-blue-100`. Standardize selection ring tokens.
- **Motion:** No animations defined; record requirement for micro-interactions (CTA hover, modal transitions).

## 6. Asset Export Checklist

1. Create Figma page “Foundations” → add color styles, typography, spacing tokens.
2. Page “Components” → reconstruct primary flows:
   - Landing hero
   - Plan selection card states
   - Admin dashboard overview
3. Publish as Team Library once component variants (states: default, hover, focus, disabled) are defined.

## 7. Missing Pieces

- Iconography set (currently using Lucide via code).
- Shadow tokens (observe `shadow-lg`, `shadow-2xl` usage and translate to design token naming).
- Responsive breakpoints: document Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) and intended layout changes.

Use this baseline as the blueprint for rebuilding in Figma; once recreated, upload screenshots of final components to replace text-based references.

