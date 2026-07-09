# Brand HTML → React conversion — design

Date: 2026-07-10 · Branch: `feat/brand-restyle` · Status: approved

## Goal

Replace the public frontend's visuals with the founder-designed landing page,
converted **verbatim** from the reference HTML into the existing Next.js app.
This is a code conversion, not a reinterpretation: the markup, inline styles,
spacing, and behaviors in the reference are the source of truth.

## Source of truth

`reference/Safe Hand Website - Figma Import.html` (gitignored) is a
self-unpacking bundle. The rendered markup is recovered with:

1. Extract `<script type="__bundler/template">` contents (a JSON string) and
   `json.loads` it → full landing-page HTML (~93 KB).
2. JS payloads in `<script type="__bundler/manifest">` are base64+gzip
   (React, ReactDOM, dc-runtime, image-slot scaffold) — not needed in the
   conversion; their behaviors are re-implemented natively (see below).

The design is a **single landing page** with sections `#top` (hero), stats,
`#how`, `#why`, `#audience` (`#centers` `#families` `#carers`), `#testimonials`,
`#trust`, `#request`, plus header and footer.

## Scope decisions (user-confirmed)

- **All public pages** adopt the design. Admin stays untouched.
- **Verbatim conversion**: keep the reference's exact structure and inline
  styles, JSX-ified. Do not rewrite into Tailwind utility idiom.
- **Palette**: the reference styles read `var(--sh-*)` custom properties.
  Define them once with the brand palette mapping already in use
  (deep → navy-800/900 `#1A3B5E`/`#193048`, teal → `#84B0B1`,
  accent/amber → blush `#E4B1AE`, tint → teal-100, cream → blush-50).
  Reverting to the file's own coastal/amber is a one-block change.
- **Fonts**: Hanken Grotesk (headings) + Mulish (body) via `next/font`
  (already wired; variable classes live on `<html>`, not `<body>`).
- Forms and wizard keep all logic, names, actions, validation — only
  presentation changes.

## Runtime features → React infra

| Reference mechanism | Conversion |
|:---|:---|
| `style-hover="…"` attributes | CSS hover rules in a companion stylesheet `src/app/brand.css` (imported by the root layout), one class per interactive element |
| `data-reveal` / `data-delay` scroll-in | dropped — the reference's own logic sets `animate = false` ("static for Figma import"), so verbatim conversion renders sections static |
| `<image-slot>` hero photo | `next/image` with the founder-supplied photo (`reference/PHOTO-2026-06-29-21-07-04.jpg` → `public/`) |
| Google-font `@font-face` payloads | existing `next/font` setup |
| dc-runtime palette props (coastal/blue/cream) | not converted — single palette via `--sh-*` variables |

## Homepage

Replace the internals of the existing section components (Hero, StatsBand,
HowItWorks, WhyCards, AudienceCards, Testimonials, TrustSafety, RequestCta,
Header, Footer) with the direct conversion of the corresponding reference
sections. Component/file boundaries stay; markup inside becomes the
reference's, converted (style strings → JSX `style` objects; hover/reveal per
table above). Audit each section against `site.html` — no drift.

Copy stays as currently localised in `src/lib/cms/content.ts` (`LANDING`)
where it differs deliberately (Safe Hands name, AU spelling, real contact
details). Fabricated stats/testimonials remain **flagged, must be replaced
before launch**.

## Interior pages

No interior layouts exist in the reference, so interior pages are assembled
from the **converted blocks only** — the reference's section wrappers, card
markup, pill buttons, heading styles, and wave dividers, reused as-is with
only content differing. No new clean-room layouts.

- `/about` — hero band + prose section + values as chip row + `#request`-style CTA
- `/for-centres`, `/for-families`, `/for-educators` — hero band + benefit cards
  (reference card markup) + CTA to their form/wizard routes
- `/faq` — hero band + existing accordion, restyled with reference tokens
- `/contact` — hero band + contact cards (reference card markup)
- `/compliance` — hero band + check-list cards (`#trust` section markup)
- `/legal/*` — hero band + prose
- Forms (`CentreRequestForm`, `FamilyRequestForm`) and wizard (steps 1–4,
  `FileUploadField`, `WizardProgress`) — presentation-only restyle using the
  reference's input/button styles

## Header / Footer

Converted from the reference, including its own mobile menu (`sc-if
mobile`/`menuOpen` conditionals, breakpoint 880px) and scroll-shrink pill
bar. Root metadata fixed (currently "Create Next App").

## Testing / verification

- 80 Vitest tests stay green; update text/selector assertions that markup
  changes break.
- Playwright page-render + axe scans stay green; WCAG 2.2 AA maintained
  (verify contrast where blush is used on light backgrounds).
- Visual check of each page against the reference rendering in a browser.

## Out of scope

Admin restyle · copy rewrites · replacing fabricated stats/testimonials ·
production deploy/operator setup · the dc-runtime palette/animation toggles.
