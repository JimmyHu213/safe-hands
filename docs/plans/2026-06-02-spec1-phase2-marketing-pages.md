# Spec 1 — Phase 2: Marketing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship all 10 public marketing pages (no intake forms yet), shared Header / Footer / CookieBanner / Acknowledgement-of-Country, and a DB-backed FAQ page. After this phase, `safehandsstaffing.com.au` is a fully browsable static-feeling site ready to be enhanced with forms in Phase 3.

**Architecture:** All pages are React Server Components under `src/app/(marketing)/`. Global layout in `src/app/(marketing)/layout.tsx`. Page copy lives in TSX (no CMS per spec). FAQ is the only DB-backed page. shadcn/ui provides primitives; Tailwind v4 (already configured) handles styling.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, Drizzle (FAQ reads), Vitest (component unit tests with jsdom), Playwright (page-render smoke tests).

**Source Spec:** `docs/specs/2026-05-28-spec1-marketing-intake-design.md`
**Depends on:** Phase 1 plan (`2026-06-02-spec1-phase1-foundations.md`) completed.

---

## File Structure (created in this phase)

```
src/app/(marketing)/
  layout.tsx                     Marketing layout with Header + Footer
  page.tsx                       /
  for-centres/page.tsx
  for-families/page.tsx
  for-educators/page.tsx
  about/page.tsx
  compliance/page.tsx
  faq/page.tsx                   Reads faq_entries from D1
  contact/page.tsx
  legal/privacy/page.tsx
  legal/terms/page.tsx

src/components/
  marketing/
    Header.tsx                   Sticky nav, phone CTA, conditional LOG IN
    Footer.tsx                   Sitemap, social, AoC, copyright
    AcknowledgementOfCountry.tsx
    CookieBanner.tsx             Client component; localStorage flag
    Hero.tsx                     Home hero with H1 + 3 audience cards
    AudienceCards.tsx
    TrustBand.tsx                Logo/badge strip
    CtaBand.tsx                  Footer-area CTA panel
    SectionHeading.tsx           Reusable heading + lede block
    PhoneCta.tsx                 Reusable phone+email row
  ui/                            shadcn primitives (button, card, badge, accordion)

src/lib/cms/
  content.ts                     Hardcoded copy for non-FAQ pages
  faq.ts                         Typed accessor for published FAQ entries

tests/
  unit/components/
    Header.test.tsx
    Footer.test.tsx
    CookieBanner.test.tsx
    Hero.test.tsx
  e2e/
    pages-render.spec.ts
    accessibility-public.spec.ts
playwright.config.ts             (created if not present)
```

---

## Task 1: Install shadcn/ui primitives + jsdom for component tests

**Files:**
- Modify: `package.json`
- Modify: `vitest.config.ts`
- Create: `components.json`

- [ ] **Step 1: Initialise shadcn/ui**

Run:
```bash
pnpm dlx shadcn@latest init --base-color slate --css-variables
```
When prompted, accept defaults (style: default, RSC: yes, alias `@/components`, `@/lib/utils`).

- [ ] **Step 2: Add the primitives we'll use**

Run:
```bash
pnpm dlx shadcn@latest add button card badge accordion sheet separator
```

- [ ] **Step 3: Install component-test deps**

Run:
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @playwright/test
```

- [ ] **Step 4: Update vitest.config.ts**

Replace its contents:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```

Install the React plugin:
```bash
pnpm add -D @vitejs/plugin-react
```

- [ ] **Step 5: Create tests/setup.ts**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Verify**

Run: `pnpm vitest run`
Expected: All previously-green Phase 1 tests still pass.

- [ ] **Step 7: Commit**

```bash
git add components.json src/components/ui src/lib/utils.ts package.json pnpm-lock.yaml vitest.config.ts tests/setup.ts
git commit -m "chore: add shadcn/ui primitives + jsdom test setup"
```

---

## Task 2: Hardcoded content module

**Files:**
- Create: `src/lib/cms/content.ts`

The spec is explicit: no CMS for page copy. We keep all copy in one TS module so a single PR can update text without touching JSX.

- [ ] **Step 1: Implement**

```ts
export const SITE = {
  name: "Safe Hands Staffing Agency",
  shortName: "Safe Hands",
  tagline: "Reliable, safe, and compassionate childcare workers you can trust.",
  phone: "1300 SAFE HANDS",
  phoneTel: "1300723343",
  emailGeneral: "hello@safehandsstaffing.com.au",
  emailBookings: "bookings@safehandsstaffing.com.au",
  emailRecruitment: "recruitment@safehandsstaffing.com.au",
  abn: "[ABN to be registered]",
  acn: "[ACN to be issued]",
  serviceArea: "Greater Sydney + selected regional NSW",
  hours: "Mon–Fri 6:00am–8:00pm, Sat–Sun 7:00am–6:00pm. After-hours emergency line for live-shift incidents.",
};

export const HOME = {
  heroH1: "Reliable, qualified, compassionate childcare staff.",
  heroLede:
    "Safe Hands supplies fully-compliant educators to NSW childcare centres, OSHC programs, and private families — for casual relief, short-term cover, and emergency shifts.",
  audiences: [
    {
      key: "centre" as const,
      title: "I'm a Centre",
      sub: "Same-day ratio cover. Compliance you can audit.",
      href: "/for-centres",
    },
    {
      key: "family" as const,
      title: "I'm a Family",
      sub: "Vetted in-home educators when you need them.",
      href: "/for-families",
    },
    {
      key: "educator" as const,
      title: "I'm an Educator",
      sub: "Flexible shifts. Award-rate pay. Real support.",
      href: "/for-educators",
    },
  ],
  trustBadges: [
    { label: "WWCC tracked", note: "Working With Children Check verified" },
    { label: "NSW Child Safe Standards", note: "Aligned to the OCG 10 standards" },
    { label: "NQF aligned", note: "National Quality Framework practice" },
    { label: "ASIC registered", note: "Pty Ltd, NSW" },
  ],
};

export const FOR_CENTRES = {
  h1: "Same-day ratio cover, properly compliant.",
  lede:
    "Centres call us because they can't afford a non-compliant placement. Every educator we send has a current WWCC, HLTAID012, Police Check, and the qualifications the room actually needs.",
  bullets: [
    "Cert III, Diploma, ECT, Room Leader, and OSHC educators",
    "≥95% shift fill rate; ≤4-hour response on emergencies",
    "Master Service Agreement, weekly invoicing, NET-14",
    "Inclusion-support educators for ASD, ADHD, behavioural complexity",
  ],
  ctaPhone: "Call our booking line",
  ctaEmail: "Email a centre enquiry",
};

export const FOR_FAMILIES = {
  h1: "Vetted in-home childcare when life happens.",
  lede:
    "Sick days, after-school cover, school holidays, the morning shift you can't move. Safe Hands sends educators we have personally screened, with full compliance documentation.",
  bullets: [
    "Minimum 3-hour shift, $30 admin fee per booking",
    "Same-day support where available",
    "After-school, holiday, ad-hoc, and overnight care",
    "Special-needs experienced educators on request",
  ],
};

export const FOR_EDUCATORS = {
  h1: "Flexible shifts. Award-rate pay. Real support.",
  lede:
    "Safe Hands is built and run by someone who's worked in compliance. We pay the Children's Services Award with casual loading and a 30% agency uplift, and we don't book you onto shifts you can't safely cover.",
  bullets: [
    "Choose your suburbs and your hours",
    "Cert III to Director-level positions",
    "Weekly pay, super, transparent rate cards",
    "Compliance reminders so your clearances never lapse",
  ],
};

export const ABOUT = {
  h1: "Built by someone who's spent their career on compliance.",
  paragraphs: [
    "Safe Hands was founded in 2026 by a healthcare and compliance professional. Most relief agencies treat compliance as paperwork. We treat it as the product.",
    "Our founder has spent over a decade running compliance frameworks in regulated environments. That discipline is what we bring to childcare staffing — written policies, tracked expiries, documented incident response, and a refusal to place an educator whose clearances are anything less than current.",
  ],
  values: ["Safety", "Trust", "Compassion", "Reliability", "Professionalism"],
};

export const COMPLIANCE = {
  h1: "Compliance is the product.",
  lede:
    "Every educator on our bench has cleared a checklist before they take a single shift. Every clearance has a stored expiry date with alerts at 60, 30, 14, and 7 days. A lapsed clearance automatically blocks new bookings.",
  documents: [
    { name: "Working With Children Check (NSW)", renewal: "Every 5 years" },
    { name: "National Police Check", renewal: "Annually" },
    { name: "HLTAID012 First Aid in an Education and Care Setting", renewal: "Every 3 years" },
    { name: "CPR", renewal: "Annually" },
    { name: "Anaphylaxis & Asthma management", renewal: "Annually" },
    { name: "Cert III or Diploma in ECEC", renewal: "Once" },
    { name: "Public Liability + Professional Indemnity insurance", renewal: "Annually" },
  ],
  frameworks: [
    "Education and Care Services National Law (NSW)",
    "National Quality Framework + National Quality Standard",
    "NSW Child Safe Standards (Office of the Children's Guardian)",
    "Fair Work Act 2009 + Children's Services Award 2020",
    "Privacy Act 1988 (Cth)",
    "WHS Act 2011 (NSW)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/cms/content.ts
git commit -m "feat(cms): add hardcoded page copy module for marketing pages"
```

---

## Task 3: Header component

**Files:**
- Create: `src/components/marketing/Header.tsx`
- Test: `tests/unit/components/Header.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/marketing/Header";

describe("Header", () => {
  it("renders the brand name", () => {
    render(<Header appLoginUrl="" />);
    expect(screen.getByText(/Safe Hands/i)).toBeInTheDocument();
  });

  it("renders the phone CTA with tel: href", () => {
    render(<Header appLoginUrl="" />);
    const link = screen.getByRole("link", { name: /1300/ });
    expect(link).toHaveAttribute("href", expect.stringMatching(/^tel:/));
  });

  it("renders the LOG IN button when appLoginUrl is set", () => {
    render(<Header appLoginUrl="https://app.safehandsstaffing.com.au" />);
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "https://app.safehandsstaffing.com.au",
    );
  });

  it("hides the LOG IN button when appLoginUrl is empty", () => {
    render(<Header appLoginUrl="" />);
    expect(screen.queryByRole("link", { name: /log in/i })).toBeNull();
  });

  it("renders the three audience nav links", () => {
    render(<Header appLoginUrl="" />);
    expect(screen.getByRole("link", { name: /for centres/i })).toHaveAttribute(
      "href",
      "/for-centres",
    );
    expect(screen.getByRole("link", { name: /for families/i })).toHaveAttribute(
      "href",
      "/for-families",
    );
    expect(screen.getByRole("link", { name: /for educators/i })).toHaveAttribute(
      "href",
      "/for-educators",
    );
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/components/Header.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
import Link from "next/link";
import { SITE } from "@/lib/cms/content";

export interface HeaderProps {
  appLoginUrl?: string;
}

export function Header({ appLoginUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg tracking-tight">{SITE.shortName}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary">
          <Link href="/for-centres" className="hover:underline">
            For centres
          </Link>
          <Link href="/for-families" className="hover:underline">
            For families
          </Link>
          <Link href="/for-educators" className="hover:underline">
            For educators
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/compliance" className="hover:underline">
            Compliance
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={`tel:${SITE.phoneTel}`}
            className="text-sm font-medium hover:underline"
            aria-label={`Call ${SITE.phone}`}
          >
            {SITE.phone}
          </a>
          {appLoginUrl ? (
            <a
              href={appLoginUrl}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
            >
              Log in
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/components/Header.test.tsx`
Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/components/Header.test.tsx src/components/marketing/Header.tsx
git commit -m "feat(marketing): add Header with conditional Log in CTA"
```

---

## Task 4: Acknowledgement of Country + Footer

**Files:**
- Create: `src/components/marketing/AcknowledgementOfCountry.tsx`
- Create: `src/components/marketing/Footer.tsx`
- Test: `tests/unit/components/Footer.test.tsx`

- [ ] **Step 1: Implement Acknowledgement**

```tsx
export function AcknowledgementOfCountry() {
  return (
    <aside className="bg-slate-50 px-4 py-6 text-sm text-slate-700" aria-label="Acknowledgement of Country">
      <p className="mx-auto max-w-3xl">
        Safe Hands Staffing Agency acknowledges the Traditional Owners of the lands on which we work
        and operate. We pay our respect to Elders past, present, and emerging, and recognise the
        deep connection of Aboriginal and Torres Strait Islander peoples to country, culture, and
        community.
      </p>
    </aside>
  );
}
```

- [ ] **Step 2: Write Footer failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/marketing/Footer";

describe("Footer", () => {
  it("renders the current year in copyright", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });

  it("renders the Acknowledgement of Country", () => {
    render(<Footer />);
    expect(screen.getByLabelText(/Acknowledgement of Country/i)).toBeInTheDocument();
  });

  it("renders Privacy and Terms links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/legal/privacy");
    expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute("href", "/legal/terms");
  });
});
```

- [ ] **Step 3: Verify FAIL**

Run: `pnpm vitest run tests/unit/components/Footer.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement Footer**

```tsx
import Link from "next/link";
import { SITE } from "@/lib/cms/content";
import { AcknowledgementOfCountry } from "./AcknowledgementOfCountry";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <AcknowledgementOfCountry />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="font-semibold">{SITE.shortName}</h3>
          <p className="mt-2 text-sm text-slate-600">{SITE.tagline}</p>
          <p className="mt-3 text-xs text-slate-500">ABN {SITE.abn}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Services</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/for-centres" className="hover:underline">For centres</Link></li>
            <li><Link href="/for-families" className="hover:underline">For families</Link></li>
            <li><Link href="/for-educators" className="hover:underline">For educators</Link></li>
            <li><Link href="/compliance" className="hover:underline">Compliance</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/about" className="hover:underline">About</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Legal</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/legal/privacy" className="hover:underline">Privacy policy</Link></li>
            <li><Link href="/legal/terms" className="hover:underline">Terms of use</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t bg-slate-50 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Run, expect PASS**

Run: `pnpm vitest run tests/unit/components/Footer.test.tsx`
Expected: 3 passing.

- [ ] **Step 6: Commit**

```bash
git add tests/unit/components/Footer.test.tsx src/components/marketing/AcknowledgementOfCountry.tsx src/components/marketing/Footer.tsx
git commit -m "feat(marketing): add Footer with Acknowledgement of Country and sitemap"
```

---

## Task 5: CookieBanner (client component with localStorage)

**Files:**
- Create: `src/components/marketing/CookieBanner.tsx`
- Test: `tests/unit/components/CookieBanner.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieBanner } from "@/components/marketing/CookieBanner";

describe("CookieBanner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders when no consent is stored", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
  });

  it("does not render when consent is already stored", () => {
    localStorage.setItem("sh_cookie_consent", "1");
    render(<CookieBanner />);
    expect(screen.queryByRole("button", { name: /accept/i })).toBeNull();
  });

  it("dismisses and persists consent on Accept", async () => {
    const user = userEvent.setup();
    render(<CookieBanner />);
    await user.click(screen.getByRole("button", { name: /accept/i }));
    expect(localStorage.getItem("sh_cookie_consent")).toBe("1");
    expect(screen.queryByRole("button", { name: /accept/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/components/CookieBanner.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
"use client";

import { useEffect, useState } from "react";

const KEY = "sh_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVisible(localStorage.getItem(KEY) !== "1");
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <p className="text-sm text-slate-700">
          We use minimal cookies to keep the site running and to remember your consent choice. See
          our <a href="/legal/privacy" className="underline">Privacy Policy</a> for details.
        </p>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setVisible(false);
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/components/CookieBanner.test.tsx`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/components/CookieBanner.test.tsx src/components/marketing/CookieBanner.tsx
git commit -m "feat(marketing): add CookieBanner with localStorage consent persistence"
```

---

## Task 6: Hero, AudienceCards, TrustBand, CtaBand

**Files:**
- Create: `src/components/marketing/Hero.tsx`
- Create: `src/components/marketing/AudienceCards.tsx`
- Create: `src/components/marketing/TrustBand.tsx`
- Create: `src/components/marketing/CtaBand.tsx`
- Create: `src/components/marketing/SectionHeading.tsx`
- Test: `tests/unit/components/Hero.test.tsx`

- [ ] **Step 1: Write Hero test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/marketing/Hero";

describe("Hero", () => {
  it("renders the H1 from content module", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders three audience cards as links", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /centre/i })).toHaveAttribute("href", "/for-centres");
    expect(screen.getByRole("link", { name: /family/i })).toHaveAttribute("href", "/for-families");
    expect(screen.getByRole("link", { name: /educator/i })).toHaveAttribute("href", "/for-educators");
  });
});
```

- [ ] **Step 2: Implement SectionHeading**

```tsx
export function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      {lede ? <p className="mt-3 text-base text-slate-600">{lede}</p> : null}
    </div>
  );
}
```

- [ ] **Step 3: Implement AudienceCards**

```tsx
import Link from "next/link";
import { HOME } from "@/lib/cms/content";

export function AudienceCards() {
  return (
    <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
      {HOME.audiences.map((a) => (
        <Link
          key={a.key}
          href={a.href}
          className="group rounded-lg border bg-white p-6 transition hover:border-slate-400 hover:shadow-sm"
        >
          <h3 className="text-lg font-semibold">{a.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{a.sub}</p>
          <p className="mt-4 text-sm font-medium text-slate-900 group-hover:underline">
            Learn more →
          </p>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Implement Hero**

```tsx
import { HOME } from "@/lib/cms/content";
import { AudienceCards } from "./AudienceCards";

export function Hero() {
  return (
    <section className="border-b bg-gradient-to-b from-white to-slate-50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {HOME.heroH1}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{HOME.heroLede}</p>
      </div>
      <AudienceCards />
    </section>
  );
}
```

- [ ] **Step 5: Implement TrustBand**

```tsx
import { HOME } from "@/lib/cms/content";

export function TrustBand() {
  return (
    <section className="border-y bg-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
          Compliance is the product
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {HOME.trustBadges.map((b) => (
            <li key={b.label} className="rounded-md border bg-white p-4 text-center">
              <p className="text-sm font-semibold">{b.label}</p>
              <p className="mt-1 text-xs text-slate-500">{b.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Implement CtaBand**

```tsx
import Link from "next/link";
import { SITE } from "@/lib/cms/content";

export function CtaBand({
  title,
  body,
  primaryHref,
  primaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <section className="bg-slate-900 px-4 py-12 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
        <p className="max-w-2xl text-slate-200">{body}</p>
        <div className="mt-2 flex flex-col gap-2 md:flex-row">
          <Link
            href={primaryHref}
            className="rounded-md bg-white px-5 py-2 text-sm font-medium text-slate-900"
          >
            {primaryLabel}
          </Link>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="rounded-md border border-white/30 px-5 py-2 text-sm font-medium text-white"
          >
            Call {SITE.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run Hero test, expect PASS**

Run: `pnpm vitest run tests/unit/components/Hero.test.tsx`
Expected: 2 passing.

- [ ] **Step 8: Commit**

```bash
git add tests/unit/components/Hero.test.tsx src/components/marketing/
git commit -m "feat(marketing): add Hero, AudienceCards, TrustBand, CtaBand, SectionHeading"
```

---

## Task 7: Marketing layout

**Files:**
- Create: `src/app/(marketing)/layout.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { ReactNode } from "react";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { CookieBanner } from "@/components/marketing/CookieBanner";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const appLoginUrl = process.env.APP_LOGIN_URL ?? "";
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow">
        Skip to main content
      </a>
      <Header appLoginUrl={appLoginUrl} />
      <main id="main">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
```

- [ ] **Step 2: Delete the default scaffold home page**

Run:
```bash
rm src/app/page.tsx
```
(It will be replaced by the marketing-grouped home page in the next task.)

- [ ] **Step 3: Commit**

```bash
git add src/app/(marketing)/layout.tsx src/app/page.tsx
git commit -m "feat(marketing): add (marketing) layout with skip-link, header, footer, banner"
```

---

## Task 8: Home page

**Files:**
- Create: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Hero } from "@/components/marketing/Hero";
import { TrustBand } from "@/components/marketing/TrustBand";
import { CtaBand } from "@/components/marketing/CtaBand";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBand />
      <section className="px-4 py-16">
        <SectionHeading
          eyebrow="What we do"
          title="One agency. Three audiences. One bench."
          lede="We supply the same vetted educators to centres, families, and OSHC programs across Greater Sydney and selected regional NSW."
        />
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Centres</h3>
            <p className="mt-2 text-sm text-slate-600">
              Casual relief, short-term cover, emergency fills. Cert III, Diploma, ECT,
              Room Leader, and OSHC educators with verified clearances.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Families</h3>
            <p className="mt-2 text-sm text-slate-600">
              In-home care for 0–12 year-olds. After-school, holiday, ad-hoc, overnight.
              Vetted educators, agency accountability.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Educators</h3>
            <p className="mt-2 text-sm text-slate-600">
              Children's Services Award rates with casual loading. Pick your suburbs and
              hours. Compliance reminders so your clearances never lapse.
            </p>
          </div>
        </div>
      </section>
      <CtaBand
        title="Need cover today?"
        body="Call our booking line, or apply if you're an educator looking for shifts."
        primaryHref="/for-centres"
        primaryLabel="For centres →"
      />
    </>
  );
}
```

- [ ] **Step 2: Verify it renders**

Run: `pnpm dev` (background; stop with Ctrl-C after smoke check)
Visit `http://localhost:3000/`
Expected: Hero, trust band, three audience cards, CTA band all visible.

- [ ] **Step 3: Commit**

```bash
git add src/app/(marketing)/page.tsx
git commit -m "feat(marketing): add home page"
```

---

## Task 9: /for-centres page

**Files:**
- Create: `src/app/(marketing)/for-centres/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from "next/link";
import { FOR_CENTRES, SITE } from "@/lib/cms/content";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export default function ForCentresPage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">For Centres</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{FOR_CENTRES.h1}</h1>
          <p className="mt-4 text-lg text-slate-700">{FOR_CENTRES.lede}</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ul className="space-y-3 text-base text-slate-800">
            {FOR_CENTRES.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-12 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Centres talk to us first.</h2>
          <p className="text-slate-200">
            We do not ask centres to fill in a form to start. Call our booking line or email — we
            answer the phone.
          </p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row">
            <a
              href={`tel:${SITE.phoneTel}`}
              className="rounded-md bg-white px-5 py-2 text-sm font-medium text-slate-900"
            >
              {FOR_CENTRES.ctaPhone}: {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.emailBookings}`}
              className="rounded-md border border-white/30 px-5 py-2 text-sm font-medium text-white"
            >
              {FOR_CENTRES.ctaEmail}
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Prefer a structured request? <Link href="/for-centres/request" className="underline">
              Submit a booking request →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(marketing)/for-centres/page.tsx
git commit -m "feat(marketing): add /for-centres landing page"
```

---

## Task 10: /for-families page

**Files:**
- Create: `src/app/(marketing)/for-families/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from "next/link";
import { FOR_FAMILIES, SITE } from "@/lib/cms/content";

export default function ForFamiliesPage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">For Families</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{FOR_FAMILIES.h1}</h1>
          <p className="mt-4 text-lg text-slate-700">{FOR_FAMILIES.lede}</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ul className="space-y-3 text-base text-slate-800">
            {FOR_FAMILIES.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-12 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Request care</h2>
          <p className="text-slate-200">
            Tell us about the shift you need and your suburb. We will call you back within 4 hours
            during business hours.
          </p>
          <Link
            href="/for-families/request"
            className="mt-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-slate-900"
          >
            Request care →
          </Link>
          <p className="mt-4 text-sm text-slate-300">
            Or call us on{" "}
            <a href={`tel:${SITE.phoneTel}`} className="underline">
              {SITE.phone}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(marketing)/for-families/page.tsx
git commit -m "feat(marketing): add /for-families landing page"
```

---

## Task 11: /for-educators page

**Files:**
- Create: `src/app/(marketing)/for-educators/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from "next/link";
import { FOR_EDUCATORS } from "@/lib/cms/content";

export default function ForEducatorsPage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">For Educators</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{FOR_EDUCATORS.h1}</h1>
          <p className="mt-4 text-lg text-slate-700">{FOR_EDUCATORS.lede}</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ul className="space-y-3 text-base text-slate-800">
            {FOR_EDUCATORS.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-12 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Join the bench</h2>
          <p className="text-slate-200">
            Tell us about your qualifications, where you can travel, and when you can work. Step
            through at your own pace — we will email you a link to resume any time.
          </p>
          <Link
            href="/for-educators/apply"
            className="mt-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-slate-900"
          >
            Start your application →
          </Link>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(marketing)/for-educators/page.tsx
git commit -m "feat(marketing): add /for-educators landing page"
```

---

## Task 12: /about, /compliance, /contact pages

**Files:**
- Create: `src/app/(marketing)/about/page.tsx`
- Create: `src/app/(marketing)/compliance/page.tsx`
- Create: `src/app/(marketing)/contact/page.tsx`

- [ ] **Step 1: Implement /about**

```tsx
import { ABOUT } from "@/lib/cms/content";

export default function AboutPage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">About</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{ABOUT.h1}</h1>
        </div>
      </section>
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-4 text-base text-slate-800">
          {ABOUT.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
      <section className="bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold">Our values</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ABOUT.values.map((v) => (
              <li
                key={v}
                className="rounded-full border bg-white px-3 py-1 text-sm text-slate-700"
              >
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Implement /compliance**

```tsx
import { COMPLIANCE } from "@/lib/cms/content";

export default function CompliancePage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Compliance</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{COMPLIANCE.h1}</h1>
          <p className="mt-4 text-lg text-slate-700">{COMPLIANCE.lede}</p>
        </div>
      </section>
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold">Documents we track on every educator</h2>
          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm text-slate-600">
                <th className="py-2">Document</th>
                <th className="py-2">Renewal</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE.documents.map((d) => (
                <tr key={d.name} className="border-b text-sm">
                  <td className="py-3">{d.name}</td>
                  <td className="py-3 text-slate-600">{d.renewal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold">Frameworks we operate under</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {COMPLIANCE.frameworks.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Implement /contact**

```tsx
import { SITE } from "@/lib/cms/content";

export default function ContactPage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Get in touch.</h1>
          <p className="mt-4 text-lg text-slate-700">
            We answer the phone. For bookings, recruitment, or general questions — use the channel
            below that suits you.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold">Bookings</h2>
            <p className="mt-2 text-sm text-slate-600">
              For centres and families needing a shift filled.
            </p>
            <p className="mt-4 text-sm">
              Phone:{" "}
              <a href={`tel:${SITE.phoneTel}`} className="underline">
                {SITE.phone}
              </a>
            </p>
            <p className="text-sm">
              Email:{" "}
              <a href={`mailto:${SITE.emailBookings}`} className="underline">
                {SITE.emailBookings}
              </a>
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold">Recruitment</h2>
            <p className="mt-2 text-sm text-slate-600">
              For educators interested in joining our bench.
            </p>
            <p className="mt-4 text-sm">
              Email:{" "}
              <a href={`mailto:${SITE.emailRecruitment}`} className="underline">
                {SITE.emailRecruitment}
              </a>
            </p>
            <p className="text-sm">
              Or start your application:{" "}
              <a href="/for-educators/apply" className="underline">
                /for-educators/apply
              </a>
            </p>
          </div>
          <div className="rounded-lg border p-6 md:col-span-2">
            <h2 className="font-semibold">Hours</h2>
            <p className="mt-2 text-sm text-slate-700">{SITE.hours}</p>
            <p className="mt-2 text-sm text-slate-700">Service area: {SITE.serviceArea}</p>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(marketing)/about src/app/(marketing)/compliance src/app/(marketing)/contact
git commit -m "feat(marketing): add /about, /compliance, /contact pages"
```

---

## Task 13: /legal/privacy and /legal/terms

**Files:**
- Create: `src/app/(marketing)/legal/privacy/page.tsx`
- Create: `src/app/(marketing)/legal/terms/page.tsx`

- [ ] **Step 1: Implement privacy**

```tsx
import { SITE } from "@/lib/cms/content";

export default function PrivacyPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-4 py-12">
      <h1>Privacy Policy</h1>
      <p>Last updated: 2 June 2026.</p>

      <h2>1. Who we are</h2>
      <p>
        {SITE.name} ({SITE.shortName}) is an Australian Pty Ltd company operating in New South
        Wales. We collect and handle personal information in accordance with the Privacy Act 1988
        (Cth) and the Australian Privacy Principles.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>From centres and families submitting a request:</strong> business / parent name,
          contact details, suburb, postcode, the shift details you supply.
        </li>
        <li>
          <strong>From educators applying to join our bench:</strong> identity, contact, suburb,
          qualifications, work history, availability, and the compliance documents you upload
          (Working With Children Check, First Aid, qualification certificates, ID, references).
        </li>
        <li>
          <strong>Technical:</strong> we hash your IP address with a daily-rotated salt for rate
          limiting and abuse prevention. We do not store raw IP addresses.
        </li>
      </ul>

      <h2>3. Where it is stored</h2>
      <p>
        Submitted information is stored in Cloudflare D1 (database) and Cloudflare R2 (uploaded
        files), in Cloudflare's Asia–Pacific region.
      </p>

      <h2>4. How long we keep it</h2>
      <p>
        Submissions that we do not action are automatically purged 24 months after submission.
        Submissions related to a current or past working relationship are retained for the duration
        required by tax, work health and safety, and child-safety record-keeping obligations.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You may request access to or deletion of your personal information by emailing{" "}
        <a href={`mailto:${SITE.emailGeneral}`}>{SITE.emailGeneral}</a>. We respond within 30 days.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use a minimal set of cookies: one to remember you have dismissed our cookie consent
        banner, and one to keep our admin team logged in to the administration portal. We do not
        use analytics or advertising cookies on this site.
      </p>

      <h2>7. Contact</h2>
      <p>
        Privacy questions can be sent to{" "}
        <a href={`mailto:${SITE.emailGeneral}`}>{SITE.emailGeneral}</a>.
      </p>
    </article>
  );
}
```

- [ ] **Step 2: Implement terms**

```tsx
import { SITE } from "@/lib/cms/content";

export default function TermsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-4 py-12">
      <h1>Terms of Use</h1>
      <p>Last updated: 2 June 2026.</p>

      <h2>1. About this site</h2>
      <p>
        This website is operated by {SITE.name}. By using the site you agree to these terms. If you
        do not agree, please do not use the site.
      </p>

      <h2>2. Service provision</h2>
      <p>
        Use of the booking-request and application forms on this site is an enquiry, not a binding
        contract for service. A formal service agreement (Master Service Agreement for centres,
        Private Family Client Agreement for families, or Worker Onboarding Agreement for educators)
        applies before any shift is filled.
      </p>

      <h2>3. Acceptable use</h2>
      <p>
        You must not submit false information, attempt to circumvent rate limits, or attempt to
        access areas of the site for which you have not been granted credentials.
      </p>

      <h2>4. Liability</h2>
      <p>
        To the maximum extent permitted by law, our liability arising out of your use of this site
        is limited to the supply of the relevant information or service again. This does not affect
        any non-excludable consumer guarantees under Australian Consumer Law.
      </p>

      <h2>5. Governing law</h2>
      <p>These terms are governed by the laws of New South Wales, Australia.</p>

      <h2>6. Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href={`mailto:${SITE.emailGeneral}`}>{SITE.emailGeneral}</a>.
      </p>
    </article>
  );
}
```

- [ ] **Step 3: Add prose typography**

If `@tailwindcss/typography` is not installed, run:
```bash
pnpm add -D @tailwindcss/typography
```
Add to `src/app/globals.css` (after the existing `@import "tailwindcss";`):

```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(marketing)/legal/ src/app/globals.css package.json pnpm-lock.yaml
git commit -m "feat(marketing): add /legal/privacy and /legal/terms"
```

---

## Task 14: FAQ accessor + page

**Files:**
- Create: `src/lib/cms/faq.ts`
- Create: `src/app/(marketing)/faq/page.tsx`
- Test: `tests/unit/cms/faq.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { groupByAudience } from "@/lib/cms/faq";
import type { FaqEntry } from "@/lib/db/schema";

const entries: FaqEntry[] = [
  { id: "1", audience: "centre", question: "A?", answer: "X", sortOrder: 1, published: true, createdAt: 1, updatedAt: 1 },
  { id: "2", audience: "centre", question: "B?", answer: "Y", sortOrder: 0, published: true, createdAt: 1, updatedAt: 1 },
  { id: "3", audience: "family", question: "C?", answer: "Z", sortOrder: 0, published: true, createdAt: 1, updatedAt: 1 },
];

describe("groupByAudience", () => {
  it("groups entries by audience", () => {
    const g = groupByAudience(entries);
    expect(g.centre).toHaveLength(2);
    expect(g.family).toHaveLength(1);
    expect(g.educator).toHaveLength(0);
    expect(g.general).toHaveLength(0);
  });

  it("sorts within each group by sortOrder", () => {
    const g = groupByAudience(entries);
    expect(g.centre[0].question).toBe("B?");
    expect(g.centre[1].question).toBe("A?");
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/cms/faq.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement faq.ts**

```ts
import { eq, and, asc } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { faqEntries, type FaqEntry, FAQ_AUDIENCE } from "@/lib/db/schema";

export async function listPublishedFaq(db: Db): Promise<FaqEntry[]> {
  return db
    .select()
    .from(faqEntries)
    .where(eq(faqEntries.published, true))
    .orderBy(asc(faqEntries.audience), asc(faqEntries.sortOrder));
}

export function groupByAudience(
  entries: FaqEntry[],
): Record<(typeof FAQ_AUDIENCE)[number], FaqEntry[]> {
  const empty = { centre: [], family: [], educator: [], general: [] } as Record<
    (typeof FAQ_AUDIENCE)[number],
    FaqEntry[]
  >;
  const grouped = entries.reduce((acc, e) => {
    acc[e.audience].push(e);
    return acc;
  }, empty);
  for (const key of Object.keys(grouped) as (typeof FAQ_AUDIENCE)[number][]) {
    grouped[key].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return grouped;
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/cms/faq.test.ts`
Expected: 2 passing.

- [ ] **Step 5: Implement /faq page**

```tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { listPublishedFaq, groupByAudience } from "@/lib/cms/faq";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const { env } = getCloudflareContext();
  const entries = await listPublishedFaq(db(env.DB));
  const grouped = groupByAudience(entries);

  const sections: { key: keyof typeof grouped; title: string }[] = [
    { key: "general", title: "General" },
    { key: "centre", title: "For centres" },
    { key: "family", title: "For families" },
    { key: "educator", title: "For educators" },
  ];

  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight">Frequently asked questions</h1>
          <p className="mt-4 text-lg text-slate-700">
            Answers to the questions we hear most. If yours is not here, give us a call.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s) => {
            const items = grouped[s.key];
            if (items.length === 0) return null;
            return (
              <div key={s.key}>
                <h2 className="text-xl font-semibold">{s.title}</h2>
                <dl className="mt-4 divide-y border-y">
                  {items.map((e) => (
                    <div key={e.id} className="py-4">
                      <dt className="font-medium">{e.question}</dt>
                      <dd className="mt-2 whitespace-pre-line text-sm text-slate-700">
                        {e.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}

          {entries.length === 0 ? (
            <p className="text-sm text-slate-600">No FAQ entries yet — please contact us directly.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add tests/unit/cms/faq.test.ts src/lib/cms/faq.ts src/app/(marketing)/faq/page.tsx
git commit -m "feat(marketing): add /faq page reading from faq_entries"
```

---

## Task 15: Page-render Playwright smoke tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/pages-render.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

Run:
```bash
pnpm dlx playwright install chromium
```

- [ ] **Step 2: Create config**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Write tests**

```ts
import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", h1: /reliable/i },
  { path: "/for-centres", h1: /same-day ratio cover/i },
  { path: "/for-families", h1: /vetted in-home/i },
  { path: "/for-educators", h1: /flexible shifts/i },
  { path: "/about", h1: /built by someone/i },
  { path: "/compliance", h1: /compliance is the product/i },
  { path: "/contact", h1: /get in touch/i },
  { path: "/faq", h1: /frequently asked questions/i },
  { path: "/legal/privacy", h1: /privacy policy/i },
  { path: "/legal/terms", h1: /terms of use/i },
];

for (const p of PAGES) {
  test(`${p.path} renders with the expected H1`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(p.h1);
  });
}

test("home page has three audience cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /centre/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /family/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /educator/i })).toBeVisible();
});
```

- [ ] **Step 4: Add npm script**

In `package.json` scripts, add:
```json
"e2e": "playwright test"
```

- [ ] **Step 5: Run tests**

Run: `pnpm e2e`
Expected: All 11 tests pass.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e/pages-render.spec.ts package.json
git commit -m "test(e2e): add Playwright smoke tests for all 10 marketing pages"
```

---

## Task 16: Accessibility scan (axe-core) on public pages

**Files:**
- Modify: `package.json`
- Create: `tests/e2e/accessibility-public.spec.ts`

- [ ] **Step 1: Install axe**

```bash
pnpm add -D @axe-core/playwright
```

- [ ] **Step 2: Write tests**

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  "/",
  "/for-centres",
  "/for-families",
  "/for-educators",
  "/about",
  "/compliance",
  "/contact",
  "/faq",
  "/legal/privacy",
  "/legal/terms",
];

for (const path of PAGES) {
  test(`${path} has no WCAG AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 3: Run**

Run: `pnpm e2e tests/e2e/accessibility-public.spec.ts`
Expected: All 10 tests pass. If any fail, fix accessibility issues (typically: missing labels, contrast issues, missing alt text) and re-run.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/accessibility-public.spec.ts package.json pnpm-lock.yaml
git commit -m "test(a11y): add axe-core WCAG AA scan on all marketing pages"
```

---

## Phase 2 Acceptance

After completing this plan:

- [ ] All 16 tasks committed.
- [ ] `pnpm vitest run` passes.
- [ ] `pnpm e2e` passes (10 page-render + 10 a11y tests).
- [ ] `pnpm tsc --noEmit` passes.
- [ ] `pnpm build` succeeds.
- [ ] Visiting `pnpm dev` shows a fully browsable marketing site with all 10 pages reachable from the navigation.
- [ ] `/faq` displays a "no entries yet" message until Phase 4 seeds entries via the admin portal.

**Next phase:** `2026-06-02-spec1-phase3-intake-flows.md` (to be written) — centre + family booking-request forms and the 4-step educator wizard.
