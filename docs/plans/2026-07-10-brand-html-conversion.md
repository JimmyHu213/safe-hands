# Brand HTML → React Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the founder-designed landing page HTML verbatim into the Next.js app and extend its converted blocks across all public pages.

**Architecture:** The reference's rendered markup is split into per-section HTML files; each React component's internals are replaced with a mechanical JSX conversion of the corresponding file. Interactive behavior comes from the reference's own component script (`logic-x-dc.js`). Interior pages reuse converted blocks only.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · CSS (verbatim inline styles + `src/app/brand.css`) · Vitest + Testing Library · Playwright + axe.

## Global Constraints

- Spec: `docs/specs/2026-07-10-brand-html-conversion-design.md`. Branch: `feat/brand-restyle`.
- **Tabs for indentation. npm, not pnpm.**
- **Verbatim conversion — do not rewrite the reference markup into Tailwind utilities.** Keep exact values (padding, clamp(), gradients, radii, shadows).
- Forms/wizard: presentation only. Never change `name=` attributes, actions, validation, or flow logic.
- Copy: keep the localised strings in `src/lib/cms/content.ts` (`LANDING` etc.) where they deliberately differ from the reference (Safe Hands name, AU spelling, real contact details, "centre" spelling in visible copy).
- Admin (`src/app/admin`, `src/components/admin`) untouched.
- Verification loop for EVERY task: `npx vitest run` (all pass) and `npx tsc --noEmit` (clean) before each commit. Conventional Commits.

## Source files (regenerate if missing)

Section sources live in `<SCRATCH>/figma/sections/` where `<SCRATCH>` is the session scratchpad. If missing, regenerate from `reference/Safe Hand Website - Figma Import.html`:

```python
# regen.py — run: python3 regen.py <out-dir>
import re, json, sys, os
src = "reference/Safe Hand Website - Figma Import.html"
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
html = open(src).read()
site = json.loads(re.search(r'<script type="__bundler/template">(.*?)</script>', html, re.S).group(1).strip())
open(os.path.join(out, "site.html"), "w").write(site)
m = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', site, re.S)
open(os.path.join(out, "logic-x-dc.js"), "w").write(m.group(1))
def dump(name, s, e): open(os.path.join(out, name), "w").write(site[s:e])
hs = site.find('<header'); dump("header.html", hs, site.find('</header>') + 9)
fs = site.find('<footer'); dump("footer.html", fs, site.find('</footer>') + 9)
starts = [m.start() for m in re.finditer(r'<section[ >]', site)]
ends = [m.end() for m in re.finditer(r'</section>', site)]
named = {m.start(): m.group(1) for m in re.finditer(r'<section id="([a-z-]+)"', site)}
for i, s in enumerate(starts):
	dump(f"section-{i:02d}-{named.get(s, f'unnamed-{i}')}.html", s, ends[i])
blocks = list(re.finditer(r'<style>(.*?)</style>', site, re.S))
dump("global-style.html", blocks[0].start(), blocks[0].end())   # font-faces (ignore; next/font)
dump("base-style.css", blocks[1].start(), blocks[1].end())      # resets + sh-* keyframes
```

Files produced: `header.html`, `section-00-top.html` (hero), `section-01-unnamed-1.html` (stats), `section-02-how.html`, `section-03-why.html`, `section-04-audience.html`, `section-05-testimonials.html`, `section-06-trust.html`, `section-07-request.html`, `footer.html`, `base-style.css`, `logic-x-dc.js`.

## Conversion rules (apply in every task)

1. `class=` → `className=`; kebab-case SVG attrs → camelCase (`stroke-width` → `strokeWidth`); `style="a:b;c:d"` → `style={{ a: "b", c: "d" }}` with camelCase properties and values copied exactly.
2. `var(--sh-*, fallback)` expressions: keep verbatim, fallback included.
3. `style-hover="…"` → remove the attribute; add `className="sh-<component>-<element>"` and append the hover rules to `src/app/brand.css` as `.sh-<component>-<element>:hover { … }`. Add `transition` from the element's inline style if present.
4. `data-reveal` / `data-delay`: DROP (the reference's own logic sets `animate = false` — sections are static). Do not add opacity/transform.
5. `data-count` / `data-prefix` / `data-suffix` counters: render the final formatted text statically (`prefix + target.toLocaleString("en-US") + suffix`), matching `runCount` with `animate=false` in `logic-x-dc.js`.
6. `{{ binding }}` template refs → React per `logic-x-dc.js` (`renderVals()`): refs, state, and handlers re-implemented in the client component.
7. `<sc-if value="{{ cond }}">…</sc-if>` → JSX conditional `{cond ? (…) : null}` with `cond` from the same logic file.
8. `<image-slot id="hero-photo" …>` → `next/image` `<Image src="/brand/hero.jpg" alt="Educator caring for a child" fill priority style={{ objectFit: "cover" }} />` inside the same absolutely-positioned wrapper.
9. Text content: where the reference text and `LANDING` copy differ deliberately (localisation), keep `LANDING`. Structure and styling always from the reference.
10. Palette hexes appearing OUTSIDE `var()` fallbacks (e.g. `rgba(36,91,86,.06)` borders, `#fff`): keep verbatim.

---

### Task 1: Brand stylesheet + assets foundation

**Files:**
- Create: `src/app/brand.css`
- Modify: `src/app/layout.tsx` (import brand.css after globals.css)
- Create: `public/brand/hero.jpg` (copy of `reference/PHOTO-2026-06-29-21-07-04.jpg`)

**Interfaces:**
- Produces: CSS custom properties `--sh-deep --sh-teal --sh-soft --sh-tint --sh-cream --sh-ink --sh-muted --sh-accent --sh-accent-dark --sh-accent-soft --sh-accent-ink` on `:root`; keyframes `sh-float sh-float-b sh-drift sh-bubble sh-bubble-b`; base resets. Later tasks append `.sh-*:hover` rules here.

- [ ] **Step 1: Create `src/app/brand.css`** — brand values (from the established navy/teal/blush mapping; cross-check against the hexes already used in `src/app/globals.css` `@theme`):

```css
/* Brand variables consumed by the converted reference markup (var(--sh-*)).
   Values = Safe Hands brand mapping of the reference coastal/amber palette. */
:root {
	--sh-deep: #1A3B5E;        /* navy-800  (ref coastal deep  #245b56) */
	--sh-teal: #84B0B1;        /* teal-400  (ref teal          #2f8f86) */
	--sh-soft: #B6CDCD;        /* teal-300  (ref soft          #7cc4b8) */
	--sh-tint: #EAF0F1;        /* teal-100  (ref tint          #e6f2ef) */
	--sh-cream: #FBF4F4;       /* blush-50  (ref cream         #fbf7f1) */
	--sh-ink: #193048;         /* navy-900  (ref ink           #20413e) */
	--sh-muted: #456C6D;       /* teal-700  (ref muted         #5f726f) */
	--sh-accent: #E4B1AE;      /* blush-300 (ref amber         #f4a93a) */
	--sh-accent-dark: #D17A75; /* blush-400 (ref amber-dark    #e0902a) */
	--sh-accent-soft: #F5E6E6; /* blush-100 (ref amber-soft    #fce3bb) */
	--sh-accent-ink: #112131;  /* navy-950  (ref accent-ink    #3a2a08) */
}

/* Verbatim from reference base-style.css (second <style> block) */
html {
	scroll-behavior: smooth;
	scroll-padding-top: 90px;
}
@keyframes sh-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-13px); } }
@keyframes sh-float-b { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(11px); } }
@keyframes sh-drift { 0%, 100% { transform: translate(0, 0) rotate(0); } 50% { transform: translate(0, -10px) rotate(4deg); } }
@keyframes sh-bubble { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-13px) rotate(1.6deg); } }
@keyframes sh-bubble-b { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-17px) rotate(-2deg); } }

/* Hover rules appended per component during conversion (rule 3). */
```

Copy any remaining non-font rules from `base-style.css` verbatim (skip `*{box-sizing}` and `body{margin:0}` — Tailwind preflight covers them). If the existing `globals.css` already defines `scroll-behavior`, keep only one copy.

- [ ] **Step 2:** `import "./brand.css";` in `src/app/layout.tsx` directly after the `globals.css` import.
- [ ] **Step 3:** `mkdir -p public/brand && cp "reference/PHOTO-2026-06-29-21-07-04.jpg" public/brand/hero.jpg`
- [ ] **Step 4:** Run `npx vitest run` → 80 pass; `npx tsc --noEmit` → clean.
- [ ] **Step 5:** Commit: `feat(brand): add --sh-* variable stylesheet + hero photo asset`

---

### Task 2: Header — verbatim conversion with scroll pill + mobile menu

**Files:**
- Modify: `src/components/marketing/Header.tsx` (client component)
- Modify: `src/app/brand.css` (append hover rules)
- Test: `tests/unit/components/Header.test.tsx`

**Interfaces:**
- Consumes: `--sh-*` vars (Task 1); nav links + portal CTA from existing `Header.tsx` / `LANDING` content.
- Produces: `<Header />` (unchanged import signature), rendered fixed at top.

**Source:** `header.html` + `logic-x-dc.js`.

Behavior from `logic-x-dc.js` to re-implement with hooks:
- `isMobile = window.innerWidth < 880`, updated on `resize`; `menuOpen` state; `toggleMenu` / `closeMenu` (close on link click).
- Scroll handler (`onScroll`): when `scrollY > 14 || menuOpen`, the bar ref gets `maxWidth:1080px; margin:12px auto 0; padding:10px 14px 10px 20px; background:rgba(255,255,255,.92); borderRadius:999px; boxShadow:0 12px 32px rgba(20,60,55,.14); backdropFilter:saturate(170%) blur(12px); borderColor:rgba(36,91,86,.06)`, else the transparent defaults. Run on mount, scroll, and after state updates. (Implement exactly as the source: imperative style mutation on the ref inside a `useEffect`.)
- `<sc-if value="{{ desktop }}">` → `{!isMobile && (…)}`; `mobile` / `menuOpen` blocks likewise (rule 7).
- Guard `window` access for SSR: initialize `isMobile` false, set real value in a mount effect.

- [ ] **Step 1:** Update `tests/unit/components/Header.test.tsx` for the new markup first: keep assertions on nav link names/hrefs and portal CTA; add a test that the mobile menu button (`aria-label` per `header.html`, e.g. menu toggle) appears and toggles the menu links. Run `npx vitest run tests/unit/components/Header.test.tsx` → new assertions FAIL.
- [ ] **Step 2:** Convert `header.html` per the rules, replacing `Header.tsx` internals. Keep existing link destinations (`/#how`, `/#why`, `/#audience`, `/faq`, `/contact`, portal CTA, "Request an Educator" → `/#request` or existing route) — text/hrefs from the current component, markup from the reference.
- [ ] **Step 3:** `npx vitest run` → all pass; `npx tsc --noEmit` → clean.
- [ ] **Step 4:** Visual check: `npm run dev`, verify transparent → pill bar on scroll, burger menu below 880px.
- [ ] **Step 5:** Commit: `feat(marketing): convert header verbatim from reference (scroll pill + mobile menu)`

---

### Task 3: Hero — tabs, sliding pill, photo

**Files:**
- Modify: `src/components/marketing/Hero.tsx` (client component)
- Modify: `src/app/brand.css` (hover rules)
- Test: `tests/unit/components/Hero.test.tsx`

**Interfaces:**
- Consumes: `--sh-*` vars, `/brand/hero.jpg` (Task 1).
- Produces: `<Hero />` unchanged signature; section `id="top"`.

**Source:** `section-00-top.html` + `logic-x-dc.js`.

Behavior to re-implement:
- `heroTab` state: `"carer" | "facility" | "care"`, default `"care"`; three `role="tab"` buttons in a `role="tablist"`.
- Sliding accent pill: measure tab button `offsetLeft/offsetTop/offsetWidth/offsetHeight` (`measureTabs()` — on mount, resize, font load, and 350 ms after mount) → absolutely-positioned pill div with the measured rect + `pillBase` styles from `logic-x-dc.js:123`.
- Hint panel (`data-hint-panel`): per-tab `{ label, href, hint }` from `logic-x-dc.js:126-130`; tip triangle positioned under the active tab center (`tipStyle`, `logic-x-dc.js:121`).
- Keep the existing localised tab copy from `LANDING` if it differs (e.g. "centre").
- `<image-slot>` → `next/image` per rule 8; keep both gradient overlay divs verbatim.

- [ ] **Step 1:** Update `tests/unit/components/Hero.test.tsx` first: h1 `/trusted childcare staff/i`; three tabs; clicking a tab swaps CTA label/href per the info map. Run → FAIL on markup changes.
- [ ] **Step 2:** Convert the section per rules, preserving all inline styles.
- [ ] **Step 3:** `npx vitest run` → pass; `npx tsc --noEmit` → clean.
- [ ] **Step 4:** Visual check against the reference in a browser (open `reference/Safe Hand Website - Figma Import.html` and the dev server side by side).
- [ ] **Step 5:** Commit: `feat(marketing): convert hero verbatim (tabs + sliding pill + photo)`

---

### Task 4: StatsBand + HowItWorks

**Files:**
- Modify: `src/components/marketing/StatsBand.tsx`, `src/components/marketing/HowItWorks.tsx`
- Modify: `src/app/brand.css` (hover rules if any)

**Interfaces:** unchanged component signatures; server components (no interactivity — counters render static per rule 5).

**Source:** `section-01-unnamed-1.html` (stats, includes the top wavy divider SVG — keep verbatim), `section-02-how.html`.

Stats values stay the reference's `data-count` targets formatted per rule 5 — they are known placeholders (flagged pre-launch), sourced from `LANDING` content if already there.

- [ ] **Step 1:** Convert both sections per rules.
- [ ] **Step 2:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check.
- [ ] **Step 3:** Commit: `feat(marketing): convert stats band + how-it-works verbatim`

---

### Task 5: WhyCards + AudienceCards

**Files:**
- Modify: `src/components/marketing/WhyCards.tsx`, `src/components/marketing/AudienceCards.tsx`
- Modify: `src/app/brand.css` (card hover lifts per rule 3)

**Source:** `section-03-why.html`, `section-04-audience.html` (`#audience` with `#centers` `#families` `#carers` cards — keep those ids; keep AU "centres" wording from `LANDING` where the visible copy says so, anchor ids stay as the reference for in-page links).

- [ ] **Step 1:** Convert both sections per rules (card hover `style-hover` → `.sh-why-card:hover`, `.sh-audience-card:hover` etc.).
- [ ] **Step 2:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check.
- [ ] **Step 3:** Commit: `feat(marketing): convert why + audience sections verbatim`

---

### Task 6: Testimonials + TrustSafety

**Files:**
- Modify: `src/components/marketing/Testimonials.tsx`, `src/components/marketing/TrustSafety.tsx`
- Modify: `src/app/brand.css`

**Source:** `section-05-testimonials.html`, `section-06-trust.html`. Testimonial quotes remain the flagged placeholders from `LANDING`.

- [ ] **Step 1:** Convert both per rules.
- [ ] **Step 2:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check.
- [ ] **Step 3:** Commit: `feat(marketing): convert testimonials + trust sections verbatim`

---

### Task 7: RequestCta + Footer + root metadata

**Files:**
- Modify: `src/components/marketing/RequestCta.tsx`, `src/components/marketing/Footer.tsx`
- Modify: `src/app/layout.tsx` (metadata)

**Source:** `section-07-request.html`, `footer.html`.

- CTA links: "Request an Educator" → keep the current route target (forms), "Talk to our team" → `/contact` (current localisation) — markup verbatim, hrefs from existing component.
- Footer: keep existing localised link set (incl. FAQ where the reference had Pricing) and real contact details; social links stay `href="#"` placeholders (flagged).
- Metadata: replace the default in `src/app/layout.tsx`:

```ts
export const metadata: Metadata = {
	title: "Safe Hands Staffing Agency — Trusted childcare staff",
	description:
		"Vetted, compliant childcare educators for centres and families across NSW — casual relief, ratio cover and in-home care, usually within 48 hours.",
};
```

- [ ] **Step 1:** Convert both components per rules; update metadata.
- [ ] **Step 2:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check.
- [ ] **Step 3:** Commit: `feat(marketing): convert request CTA + footer verbatim; fix root metadata`

---

### Task 8: Homepage fidelity audit

**Files:** any homepage component needing drift fixes.

- [ ] **Step 1:** Render the reference HTML (open the file in a browser; it self-unpacks) and the dev-server homepage side by side at desktop and ~390 px widths. Compare every section: spacing, wave dividers, typography scale, pill bar behavior, tab pill animation, card shadows/hovers.
- [ ] **Step 2:** Fix any drift (markup diffs against the section files, not by eye alone).
- [ ] **Step 3:** `npx playwright test tests/e2e/pages-render.spec.ts` and the axe spec for `/` → pass. `npx vitest run` → pass.
- [ ] **Step 4:** Commit: `fix(marketing): homepage fidelity fixes vs reference`

---

### Task 9: PageHero + prose pages (about, contact, legal)

**Files:**
- Create: `src/components/marketing/PageHero.tsx`
- Modify: `src/app/(marketing)/about/page.tsx`, `src/app/(marketing)/contact/page.tsx`, `src/app/(marketing)/legal/**/page.tsx`
- Test: `tests/unit/components/PageHero.test.tsx`

**Interfaces:**
- Produces: `PageHero({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: string })` — a compact hero band assembled ONLY from converted reference blocks: the `#top` section's background treatment (tint bg, gradient overlays, bottom wave from the stats divider SVG) + the reference's eyebrow chip / `h1` / lede markup with sizes reduced via the same `clamp()` idiom (`min-height` ~ `clamp(260px,38vh,380px)`, keep every other property verbatim from the source elements).

Prose/body sections reuse the reference's section wrapper (`padding:clamp(...) 22px`, `max-width:1080px;margin:0 auto`) and card markup. About's values → the reference's chip markup (hero eyebrow chip, repeated per value). About ends with the converted `#request` block (`<RequestCta />`).

- [ ] **Step 1:** Write `tests/unit/components/PageHero.test.tsx` (renders eyebrow/title/lede; `h1` role) → FAIL.
- [ ] **Step 2:** Implement `PageHero.tsx` from converted blocks. → test PASS.
- [ ] **Step 3:** Rebuild about/contact/legal pages with PageHero + converted wrappers/cards; content unchanged from `ABOUT`/`CONTACT`/legal content objects.
- [ ] **Step 4:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check.
- [ ] **Step 5:** Commit: `feat(marketing): PageHero from converted blocks; restyle about/contact/legal`

---

### Task 10: Audience pages (for-centres, for-families, for-educators)

**Files:**
- Modify: `src/app/(marketing)/for-centres/page.tsx`, `src/app/(marketing)/for-families/page.tsx`, `src/app/(marketing)/for-educators/page.tsx`

**Interfaces:** consumes `PageHero` (Task 9) and card markup converted in Tasks 5–6.

Each page: `PageHero` (existing page h1/lede content) → benefits as the `#why` card markup (converted in Task 5 — copy the JSX card block, content from each page's existing content object) → CTA band (the converted `#request` markup) linking to that page's existing form/wizard route (`/for-centres/request`, family form route, `/for-educators/apply`).

- [ ] **Step 1:** Rebuild the three pages from converted blocks; content objects unchanged.
- [ ] **Step 2:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check all three.
- [ ] **Step 3:** Commit: `feat(marketing): restyle audience pages from converted blocks`

---

### Task 11: FAQ + Compliance pages

**Files:**
- Modify: `src/app/(marketing)/faq/page.tsx` (+ its accordion styling), `src/app/(marketing)/compliance/page.tsx`

FAQ: `PageHero` + existing accordion component restyled with reference tokens (accordion container = the reference card markup: white bg, `border:1px solid rgba(36,91,86,.08)`, radius/shadow verbatim from a `#why` card; trigger text `--sh-ink`, icon `--sh-teal`). Accordion behavior/DB data untouched.
Compliance: `PageHero` + the `#trust` section's check-list card markup (converted in Task 6), content from the existing compliance content object.

- [ ] **Step 1:** Rebuild both pages.
- [ ] **Step 2:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check.
- [ ] **Step 3:** Commit: `feat(marketing): restyle FAQ + compliance from converted blocks`

---

### Task 12: Intake forms restyle

**Files:**
- Modify: `src/components/forms/CentreRequestForm.tsx`, `src/components/forms/FamilyRequestForm.tsx`
- Modify: `src/app/brand.css` (add shared field + button classes)
- Modify: the two form pages' wrappers (`for-centres/request`, family form route) to sit in a converted card on `--sh-tint` background.

Add to `brand.css` (derived from the reference's card/button tokens — the reference has no form inputs, so fields use its card border/radius/ink tokens):

```css
.sh-field {
	width: 100%;
	border: 1px solid rgba(36, 91, 86, 0.18);
	border-radius: 12px;
	background: #fff;
	padding: 12px 14px;
	font-size: 1rem;
	color: var(--sh-ink, #193048);
}
.sh-field:focus {
	outline: 2px solid var(--sh-teal, #84B0B1);
	outline-offset: 1px;
	border-color: var(--sh-teal, #84B0B1);
}
.sh-label {
	font-family: "Hanken Grotesk", sans-serif;
	font-weight: 700;
	font-size: 0.92rem;
	color: var(--sh-deep, #1A3B5E);
}
.sh-btn-accent {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 9px;
	background: var(--sh-accent, #E4B1AE);
	color: var(--sh-accent-ink, #112131);
	font-family: "Hanken Grotesk", sans-serif;
	font-weight: 800;
	font-size: 1.08rem;
	padding: 17px 32px;
	border-radius: 999px;
	border: 0;
	cursor: pointer;
	box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.sh-btn-accent:hover {
	transform: translateY(-2px);
	box-shadow: 0 20px 38px rgba(0, 0, 0, 0.26);
}
```

(Accent button values are verbatim from `section-07-request.html`'s primary CTA.)

- [ ] **Step 1:** Swap form field/label/button classNames to `sh-field` / `sh-label` / `sh-btn-accent`; grid layout classes may stay. NO logic/name/action changes.
- [ ] **Step 2:** `npx vitest run` → pass (form tests assert names/validation, not classes); `npx tsc --noEmit` → clean. Visual + manual submit check in dev (Turnstile test keys if configured).
- [ ] **Step 3:** Commit: `feat(forms): restyle intake forms with brand field/button classes`

---

### Task 13: Educator wizard restyle

**Files:**
- Modify: `src/components/wizard/Step1Identity.tsx`, `Step2Qualifications.tsx`, `Step3Documents.tsx`, `Step4Review.tsx`, `FileUploadField.tsx`, `WizardProgress.tsx`

Same classes as Task 12. `WizardProgress`: completed/current steps use `--sh-teal` / `--sh-deep`; upcoming `rgba(36,91,86,.18)`; pill-shaped step indicators using the reference's chip markup. `FileUploadField` dropzone = converted card markup with dashed `rgba(36,91,86,.3)` border.

- [ ] **Step 1:** Apply presentation-only changes across the six files.
- [ ] **Step 2:** `npx vitest run` → pass; `npx tsc --noEmit` → clean. Visual check of all four steps (dev bypass or fixtures as the e2e admin test does).
- [ ] **Step 3:** Commit: `feat(wizard): restyle educator wizard with brand classes`

---

### Task 14: Full verification sweep

- [ ] **Step 1:** `npx vitest run` → all pass. `npx tsc --noEmit` → clean.
- [ ] **Step 2:** `npm run e2e` → same pass rate as baseline (27/30; the 3 known env-dependent failures excepted). Axe specs pass on all public pages — fix any contrast regressions (likely spots: blush accent text, teal on tint).
- [ ] **Step 3:** Browser pass over every public page at desktop + mobile widths.
- [ ] **Step 4:** Update `docs/specs/2026-07-10-brand-html-conversion-design.md` status line to "implemented"; commit: `test: verify brand conversion across public pages`
