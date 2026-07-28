# BeeBright amber theme — design

**Date:** 2026-07-28
**Status:** Approved

## Context

The project was renamed from Safe Hands to BeeBright Staffing, and a new logo has been
supplied: a circular badge in amber and near-black on white. The site still carries the
Safe Hands visual identity — a navy/teal/blush/lavender palette — and every colour
identifier is still prefixed `sh-`.

Two goals:

1. Retheme the site to the new logo's colours.
2. Make colour changes **dynamic**: one definition governs the whole site, so a future
   palette change means editing a single block rather than hunting hundreds of literals.

## Current state

Colour lives in two parallel systems:

| System | Location | Tokens | Usages |
|---|---|---|---|
| `--sh-*` custom properties | `src/app/brand.css` | 14 | 230 across 33 files |
| Tailwind `@theme` scales | `src/app/globals.css` | 44 | **2 sitewide** |

Admin pages use generic Tailwind slate (~47 usages) and are deliberately neutral.

### The obstacle to single-source theming

228 of the 230 `var()` calls carry a hardcoded fallback, and the fallbacks are
**inconsistent** — `--sh-deep` appears with three different fallback values across the
codebase (`#1A3B5E`, `#1d4b47`, `#245b56`), of which only the first is the real value.

These fallbacks are *inert* today: `var()` only falls back when the property is undefined,
and all 14 are defined in `:root`. So they are not a live bug — they are dead weight that
encodes a palette which no longer exists, and a trap for anyone who deletes or renames a
token later.

## Brand colours

Sampled directly from the supplied logo PNG (pure-Python decoder, 1254×1254):

- **Amber `#FCB607`** — chroma 245, consistent across the artwork
- **Near-black `#101010`**
- **White `#FEFEFE`**

### The binding constraint

`#FCB607` on white is **1.79:1** — unusable for text at any size. On `#101010` it is
**10.7:1**. Therefore:

- Amber may be used as a **background**, a CTA fill, or a large decorative shape.
- Any amber **text or icon** must use a darkened variant.

## Design

### 1. Token layer — `src/app/brand.css`

14 semantic tokens. Names are semantic rather than hue-based, because "teal" and
"lavender" are actively misleading in an amber palette.

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--bb-amber` | `#FCB607` | logo amber — backgrounds/CTAs only | 10.7:1 w/ `ink-strong` |
| `--bb-amber-dark` | `#A66A00` | amber text & icons | 4.52:1 on white — AA |
| `--bb-amber-soft` | `#FFF3D6` | amber tile background | — |
| `--bb-amber-ink` | `#3D2A00` | text on amber | 7.68:1 on amber |
| `--bb-ink-strong` | `#101010` | logo black — headings | 19.6:1 on white |
| `--bb-ink` | `#1F1B14` | body text | ~17:1 on white |
| `--bb-ink-soft` | `#4A4238` | tile icons | 9.31:1 on tint |
| `--bb-ink-muted` | `#6B6257` | secondary text | 6.09:1 on white |
| `--bb-surface-tint` | `#FFF8E7` | warm cream section background | — |
| `--bb-surface` | `#FFFDF7` | lightest surface | — |
| `--bb-border` | `#E8DFC9` | hairlines | — |
| `--bb-decor` | `#FFE9A8` | decorative shapes | — |
| `--bb-btn-primary` | `#FCB607` | primary button fill | — |
| `--bb-btn-primary-hover` | `#E0A106` | primary button hover | — |

**Notable visual change:** primary buttons flip from navy-with-white-text to amber with
near-black text (10.7:1). This is the strongest expression of the logo and passes
contrast comfortably.

### 2. Old → new token mapping

| Old | New | Usages | Rationale |
|---|---|---|---|
| `--sh-deep` | `--bb-ink-strong` | 56 | dominant heading/structure colour |
| `--sh-tint` | `--bb-surface-tint` | 36 | section backgrounds |
| `--sh-ink` | `--bb-ink` | 35 | body text |
| `--sh-muted` | `--bb-ink-muted` | 33 | secondary text |
| `--sh-teal` | `--bb-ink-soft` | 30 | verified: icon colour inside tinted tiles, not body text |
| `--sh-accent` | `--bb-amber` | 12 | accent |
| `--sh-btn-primary` | `--bb-btn-primary` | 6 | button fill |
| `--sh-cream` | `--bb-surface` | 5 | lightest surface |
| `--sh-accent-dark` | `--bb-amber-dark` | 5 | accent text/icons |
| `--sh-soft` | `--bb-border` | 3 | hairlines |
| `--sh-btn-primary-hover` | `--bb-btn-primary-hover` | 3 | button hover |
| `--sh-accent-soft` | `--bb-amber-soft` | 3 | accent tile |
| `--sh-lavender` | `--bb-decor` | 2 | decorative shapes |
| `--sh-accent-ink` | `--bb-amber-ink` | 1 | text on accent |

Icon tiles retain their existing two-variant rhythm so pages do not flatten to one colour:

- **Neutral variant** — `--bb-ink-soft` on `--bb-surface-tint` (9.31:1)
- **Amber variant** — `--bb-amber-dark` on `--bb-amber-soft` (4.10:1, exceeds the 3:1
  non-text minimum)

### 3. Fallback removal

Every call site becomes `var(--bb-token)` with no fallback:

```
var(--sh-deep,#245b56)  →  var(--bb-ink-strong)
```

After this, `brand.css` is the single source of truth: editing 14 lines retints the
entire site.

### 4. Full `sh-` → `bb-` sweep

Beyond the colour tokens, 37 identifiers total:

- **14 custom properties** — as mapped above
- **18 class names** — `sh-label` (18×), `sh-field` (17×), `sh-footer-link` (11×),
  `sh-btn-accent` (8×), `sh-why-card`, `sh-request-cta-primary`,
  `sh-request-cta-secondary`, `sh-footer-social`, `sh-footer-bottom-link`,
  `sh-header-nav-link`, `sh-header-cta`, `sh-hero-cta`, `sh-hero-watch`,
  `sh-audience-cta`, `sh-audience-cta-outline`, `sh-faq-accordion`,
  `sh-decorative-numeral`
- **5 keyframes** — `sh-float`, `sh-float-b`, `sh-drift`, `sh-bubble`, `sh-bubble-b`

Already clean: no `sh_` identifiers remain (cookie renames covered those), and no
`sh`-prefixed JS/TS identifiers exist (`SHA` in the hashing code is a false positive).

### 5. Tailwind `@theme` — `src/app/globals.css`

Replace the 44 dead navy/teal/blush/lavender tokens with `amber-*` and `ink-*` scales
derived from the brand hues. Fix the two real usages in
`src/components/marketing/AcknowledgementOfCountry.tsx` (`bg-teal-100 text-teal-900`).

### 6. Admin UI

Map generic slate to brand ink tokens so the admin reads as the same product while
staying restrained: `bg-slate-900` → `--bb-ink-strong`, `text-slate-500` →
`--bb-ink-muted`. Brand the `AdminNav` wordmark.

### 7. Icons

Regenerate `public/brand/beebright-icon-{32,192}.png` from the supplied logo. Neither
ImageMagick nor PIL is available, so a pure-Python PNG decoder/encoder handles decode →
box-downsample → encode. **Both sizes use the same crop** (full circular badge), per
explicit user decision.

## Verification

1. `npx tsc --noEmit` — exit 0
2. `npm run build` — exit 0
3. `npx vitest run` — 84 tests pass
4. Residual greps assert zero matches: `--sh-`, `\.sh-`, `@keyframes sh-`, and any
   `var(--bb-[a-z-]+,` (i.e. no fallback survived)
5. Load every marketing page plus `/admin/login` in Chrome; screenshot each to confirm
   no text renders invisible and the amber CTAs read correctly
6. Confirm `npm run lint` still fails identically to `main` — it is broken pre-existing
   (an ESLint config-loading crash), not caused by this work

## Out of scope

- `docs/` historical specs and plans — dated records of what was built at the time
- Typography, spacing, and layout — this change is colour and naming only
