# Spec 1 — Phase 3: Intake Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three audience intake flows — centre booking request, family booking request, and the 4-step educator application wizard with direct-to-R2 document uploads and email-based resume tokens.

**Architecture:** Three new public routes (`/for-centres/request`, `/for-families/request`, `/for-educators/apply/*`) with Server Actions writing to D1 and Resend emitting transactional emails. Educator wizard uses a presigned-PUT R2 upload pattern so the Worker never handles file bytes. Resume tokens are signed random strings stored as SHA-256 hashes; the plaintext token is only ever in the email link.

**Tech Stack:** Next.js 16 Server Actions, Drizzle, Zod, Resend with React Email templates, Cloudflare Turnstile, R2 S3-compatible API via `aws4fetch`.

**Source Spec:** `docs/specs/2026-05-28-spec1-marketing-intake-design.md` (§6 Intake Flows)
**Depends on:** Phases 1 and 2 plans completed.

---

## File Structure (created in this phase)

```
src/lib/validation/schemas.ts          All Zod schemas: centre, family, educator step 1-4
src/lib/db/queries/centres.ts          insertCentreRequest
src/lib/db/queries/families.ts         insertFamilyRequest
src/lib/db/queries/educators.ts        draft + step updates + finalize + docs
src/lib/db/queries/resume-tokens.ts    issueResumeToken, consumeResumeToken
src/lib/email/render.tsx               render React Email to {html, text}
src/lib/email/templates/               7 transactional templates
src/lib/server/request-context.ts      Cloudflare context helpers
src/lib/server/rate-guard.ts           Turnstile + rate-limit wrapper
src/lib/auth/wizard-cookie.ts          2-hour signed cookie carrying draft id
src/app/(marketing)/for-centres/request/page.tsx + actions.ts + thank-you/
src/app/(marketing)/for-families/request/page.tsx + actions.ts + thank-you/
src/app/(marketing)/for-educators/apply/page.tsx + step-{2,3,4}/page.tsx
src/app/(marketing)/for-educators/apply/actions.ts
src/app/(marketing)/for-educators/apply/resume/route.ts
src/app/(marketing)/for-educators/apply/record-document/route.ts
src/app/(marketing)/for-educators/apply/thank-you/page.tsx
src/app/api/uploads/presign/route.ts   Presigned R2 PUT URL
src/components/forms/                  TurnstileWidget, Centre/Family forms
src/components/wizard/                 Progress + 4 step components + FileUploadField

tests/helpers/test-db.ts               In-memory SQLite helper via drizzle migrator
tests/unit/validation/schemas.test.ts
tests/unit/db/queries/*.test.ts
tests/e2e/centre-flow.spec.ts
tests/e2e/family-flow.spec.ts
tests/e2e/educator-wizard.spec.ts
tests/fixtures/sample.pdf
```

---

## Task 1: Zod schemas for all three intake types

**Files:**
- Create: `src/lib/validation/schemas.ts`
- Test: `tests/unit/validation/schemas.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import {
  centreRequestSchema,
  familyRequestSchema,
  educatorStep1Schema,
  educatorStep2Schema,
  educatorStep3Schema,
} from "@/lib/validation/schemas";

describe("centreRequestSchema", () => {
  const valid = {
    centreName: "Sunny Days ELC",
    contactName: "Jane Smith",
    contactEmail: "jane@sunny.example",
    contactPhone: "0400123456",
    suburb: "Parramatta",
    postcode: "2150",
    roleNeeded: "cert3",
    shiftDate: "2026-07-10",
    shiftStart: "07:30",
    shiftDurationHrs: 8,
    specialNeedsFlag: false,
    notes: "",
    privacyConsent: true,
    turnstileToken: "tok",
  };
  it("accepts a valid payload", () => {
    expect(() => centreRequestSchema.parse(valid)).not.toThrow();
  });
  it("rejects missing privacy consent", () => {
    expect(() => centreRequestSchema.parse({ ...valid, privacyConsent: false })).toThrow();
  });
  it("rejects bad postcode", () => {
    expect(() => centreRequestSchema.parse({ ...valid, postcode: "abc" })).toThrow();
  });
  it("rejects unknown role", () => {
    expect(() => centreRequestSchema.parse({ ...valid, roleNeeded: "unknown" })).toThrow();
  });
  it("caps notes at 2000 chars", () => {
    expect(() => centreRequestSchema.parse({ ...valid, notes: "x".repeat(2001) })).toThrow();
  });
});

describe("familyRequestSchema", () => {
  const valid = {
    parentName: "Sam Lee",
    contactEmail: "sam@example.com",
    contactPhone: "0400123456",
    suburb: "Newtown",
    postcode: "2042",
    childrenCount: 2,
    childrenAges: "3,7",
    careType: "after_school",
    shiftDate: "2026-07-10",
    shiftStart: "15:00",
    shiftDurationHrs: 3,
    specialNeedsFlag: false,
    specialNeedsNotes: "",
    notes: "",
    privacyConsent: true,
    turnstileToken: "tok",
  };
  it("accepts a valid payload", () => {
    expect(() => familyRequestSchema.parse(valid)).not.toThrow();
  });
  it("rejects childrenCount < 1", () => {
    expect(() => familyRequestSchema.parse({ ...valid, childrenCount: 0 })).toThrow();
  });
});

describe("educator step schemas", () => {
  it("step 1 accepts identity payload", () => {
    expect(() =>
      educatorStep1Schema.parse({
        firstName: "Alex",
        lastName: "Park",
        email: "alex@example.com",
        phone: "0400123456",
        suburb: "Marrickville",
        postcode: "2204",
        privacyConsent: true,
        turnstileToken: "tok",
      }),
    ).not.toThrow();
  });
  it("step 2 accepts qualification payload", () => {
    expect(() =>
      educatorStep2Schema.parse({
        qualificationLevel: "diploma",
        qualificationOther: "",
        yearsExperience: 5,
        specialNeedsExperience: true,
        specialNeedsNotes: "ASD support 2 yrs",
        availability: { mon: ["am", "pm"], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
        travelRadiusKm: 15,
        hasOwnTransport: true,
      }),
    ).not.toThrow();
  });
  it("step 3 requires the three mandatory docs", () => {
    expect(() =>
      educatorStep3Schema.parse({
        documents: [
          { docType: "wwcc", r2Key: "k1", originalFilename: "wwcc.pdf", mimeType: "application/pdf", sizeBytes: 100 },
          { docType: "first_aid_hltaid012", r2Key: "k2", originalFilename: "fa.pdf", mimeType: "application/pdf", sizeBytes: 100 },
          { docType: "cert3_diploma", r2Key: "k3", originalFilename: "c3.pdf", mimeType: "application/pdf", sizeBytes: 100 },
        ],
      }),
    ).not.toThrow();
  });
  it("step 3 rejects when a mandatory doc is missing", () => {
    expect(() =>
      educatorStep3Schema.parse({
        documents: [
          { docType: "wwcc", r2Key: "k1", originalFilename: "wwcc.pdf", mimeType: "application/pdf", sizeBytes: 100 },
        ],
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/validation/schemas.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement schemas.ts**

```ts
import { z } from "zod";
import {
  CENTRE_ROLE,
  FAMILY_CARE_TYPE,
  EDUCATOR_QUALIFICATION,
  EDUCATOR_DOC_TYPE,
} from "@/lib/db/schema";

const phoneRe = /^[+]?[\d\s()-]{8,20}$/;
const postcodeRe = /^\d{4}$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const timeRe = /^\d{2}:\d{2}$/;

const txt = (max: number) => z.string().trim().min(1).max(max);

export const centreRequestSchema = z.object({
  centreName: txt(200),
  contactName: txt(200),
  contactEmail: z.string().email().max(200),
  contactPhone: z.string().regex(phoneRe),
  suburb: txt(100),
  postcode: z.string().regex(postcodeRe),
  roleNeeded: z.enum(CENTRE_ROLE),
  shiftDate: z.string().regex(dateRe),
  shiftStart: z.string().regex(timeRe),
  shiftDurationHrs: z.number().min(0.5).max(24),
  specialNeedsFlag: z.boolean(),
  notes: z.string().max(2000).default(""),
  privacyConsent: z.literal(true),
  turnstileToken: z.string().min(1).max(2048),
});
export type CentreRequestInput = z.infer<typeof centreRequestSchema>;

export const familyRequestSchema = z.object({
  parentName: txt(200),
  contactEmail: z.string().email().max(200),
  contactPhone: z.string().regex(phoneRe),
  suburb: txt(100),
  postcode: z.string().regex(postcodeRe),
  childrenCount: z.number().int().min(1).max(10),
  childrenAges: z.string().max(100),
  careType: z.enum(FAMILY_CARE_TYPE),
  shiftDate: z.string().regex(dateRe),
  shiftStart: z.string().regex(timeRe),
  shiftDurationHrs: z.number().min(0.5).max(24),
  specialNeedsFlag: z.boolean(),
  specialNeedsNotes: z.string().max(2000).default(""),
  notes: z.string().max(2000).default(""),
  privacyConsent: z.literal(true),
  turnstileToken: z.string().min(1).max(2048),
});
export type FamilyRequestInput = z.infer<typeof familyRequestSchema>;

export const educatorStep1Schema = z.object({
  firstName: txt(100),
  lastName: txt(100),
  email: z.string().email().max(200),
  phone: z.string().regex(phoneRe),
  suburb: txt(100),
  postcode: z.string().regex(postcodeRe),
  privacyConsent: z.literal(true),
  turnstileToken: z.string().min(1).max(2048),
});
export type EducatorStep1Input = z.infer<typeof educatorStep1Schema>;

const dailyAvail = z.array(z.enum(["am", "pm"])).default([]);
export const availabilitySchema = z.object({
  mon: dailyAvail, tue: dailyAvail, wed: dailyAvail, thu: dailyAvail,
  fri: dailyAvail, sat: dailyAvail, sun: dailyAvail,
});
export type Availability = z.infer<typeof availabilitySchema>;

export const educatorStep2Schema = z.object({
  qualificationLevel: z.enum(EDUCATOR_QUALIFICATION),
  qualificationOther: z.string().max(200).default(""),
  yearsExperience: z.number().int().min(0).max(60),
  specialNeedsExperience: z.boolean(),
  specialNeedsNotes: z.string().max(2000).default(""),
  availability: availabilitySchema,
  travelRadiusKm: z.number().int().min(0).max(200),
  hasOwnTransport: z.boolean(),
});
export type EducatorStep2Input = z.infer<typeof educatorStep2Schema>;

const documentSchema = z.object({
  docType: z.enum(EDUCATOR_DOC_TYPE),
  r2Key: z.string().min(1).max(500),
  originalFilename: z.string().min(1).max(300),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
});

export const educatorStep3Schema = z
  .object({ documents: z.array(documentSchema).min(3).max(20) })
  .refine(
    (v) => {
      const types = new Set(v.documents.map((d) => d.docType));
      return types.has("wwcc") && types.has("first_aid_hltaid012") && types.has("cert3_diploma");
    },
    { message: "WWCC, First Aid (HLTAID012), and Cert III/Diploma documents are all required" },
  );
export type EducatorStep3Input = z.infer<typeof educatorStep3Schema>;
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/validation/schemas.test.ts`
Expected: 11 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/validation/schemas.test.ts src/lib/validation/schemas.ts
git commit -m "feat(validation): add Zod schemas for centre/family/educator intake"
```

---

## Task 2: In-memory test DB helper

**Files:**
- Modify: `package.json`
- Create: `tests/helpers/test-db.ts`

Drizzle's `migrate` reads SQL files and applies them in order. We use it against a fresh in-memory SQLite via better-sqlite3 for unit-testing queries — fast, deterministic, no Cloudflare runtime needed.

- [ ] **Step 1: Install deps**

```bash
pnpm add -D better-sqlite3 @types/better-sqlite3
```

- [ ] **Step 2: Implement helper**

```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";

export function makeTestDb() {
  const sqlite = new Database(":memory:");
  const drizzleDb = drizzle(sqlite, { schema });
  migrate(drizzleDb, { migrationsFolder: "drizzle/migrations" });
  return drizzleDb;
}

export type TestDb = ReturnType<typeof makeTestDb>;
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml tests/helpers/test-db.ts
git commit -m "test: add in-memory SQLite test-db helper via drizzle migrator"
```

---

## Task 3: Request context + rate guard

**Files:**
- Create: `src/lib/server/request-context.ts`
- Create: `src/lib/server/rate-guard.ts`

- [ ] **Step 1: Implement request-context.ts**

```ts
import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hashIp } from "@/lib/util/ip-hash";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
}

export async function clientIpHash(): Promise<string> {
  const { env } = getCloudflareContext();
  const ip = await clientIp();
  return hashIp(ip, new Date(), env.IP_HASH_SALT_ROTATION);
}

export function bindings() {
  return getCloudflareContext().env;
}
```

- [ ] **Step 2: Implement rate-guard.ts**

```ts
import { verifyTurnstile } from "@/lib/util/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp, clientIpHash, bindings } from "./request-context";

export interface GuardResult {
  ok: boolean;
  reason?: "rate_limited" | "turnstile_failed";
  ipHash: string;
}

export async function rateGuard(opts: {
  bucket: string;
  turnstileToken: string;
  limit?: number;
  windowSeconds?: number;
}): Promise<GuardResult> {
  const env = bindings();
  const ip = await clientIp();
  const ipHash = await clientIpHash();

  const tsOk = await verifyTurnstile({
    token: opts.turnstileToken,
    remoteIp: ip,
    secret: env.TURNSTILE_SECRET_KEY,
  });
  if (!tsOk) return { ok: false, reason: "turnstile_failed", ipHash };

  const rl = await checkRateLimit(
    env.RATE_LIMITS,
    `${opts.bucket}:${ipHash}`,
    opts.limit ?? 10,
    opts.windowSeconds ?? 86400,
  );
  if (!rl.allowed) return { ok: false, reason: "rate_limited", ipHash };

  return { ok: true, ipHash };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/request-context.ts src/lib/server/rate-guard.ts
git commit -m "feat(server): add request-context + Turnstile+rate-limit guard"
```

---

## Task 4: Email rendering + Centre templates

**Files:**
- Modify: `package.json`
- Create: `src/lib/email/render.tsx`
- Create: `src/lib/email/templates/CentreRequestAck.tsx`
- Create: `src/lib/email/templates/CentreRequestNotify.tsx`

- [ ] **Step 1: Install React Email**

```bash
pnpm add @react-email/components @react-email/render
```

- [ ] **Step 2: Implement render.tsx**

```tsx
import { render } from "@react-email/render";
import type { ReactElement } from "react";

export async function renderEmail(element: ReactElement): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}
```

- [ ] **Step 3: Implement CentreRequestAck**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface CentreRequestAckProps {
  contactName: string;
  centreName: string;
  shiftDate: string;
  shiftStart: string;
}

export default function CentreRequestAck(props: CentreRequestAckProps) {
  return (
    <Html>
      <Head />
      <Preview>We have received your centre booking request</Preview>
      <Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
        <Container style={{ maxWidth: 560, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 20 }}>
            Thanks, {props.contactName}.
          </Heading>
          <Section>
            <Text>
              We have received your booking request for <strong>{props.centreName}</strong> on{" "}
              {props.shiftDate} at {props.shiftStart}.
            </Text>
            <Text>
              A Safe Hands operator will be in touch within 4 business hours to confirm coverage or
              ask any clarifying questions.
            </Text>
            <Text>
              If you need an immediate response, please call <strong>1300 SAFE HANDS</strong>.
            </Text>
            <Text>— Safe Hands Staffing</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 4: Implement CentreRequestNotify**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface CentreRequestNotifyProps {
  centreName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  suburb: string;
  postcode: string;
  roleNeeded: string;
  shiftDate: string;
  shiftStart: string;
  shiftDurationHrs: number;
  specialNeedsFlag: boolean;
  notes: string;
  adminLinkUrl: string;
}

export default function CentreRequestNotify(p: CentreRequestNotifyProps) {
  return (
    <Html>
      <Head />
      <Preview>New centre booking request — {p.centreName}</Preview>
      <Body style={{ fontFamily: "ui-monospace, monospace", color: "#0f172a" }}>
        <Container style={{ maxWidth: 600, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 18 }}>New centre booking request</Heading>
          <Section>
            <Text>
              <strong>Centre:</strong> {p.centreName}<br />
              <strong>Contact:</strong> {p.contactName} &lt;{p.contactEmail}&gt; — {p.contactPhone}<br />
              <strong>Suburb:</strong> {p.suburb} {p.postcode}<br />
              <strong>Role:</strong> {p.roleNeeded}<br />
              <strong>Shift:</strong> {p.shiftDate} {p.shiftStart} for {p.shiftDurationHrs}h<br />
              <strong>Special needs:</strong> {p.specialNeedsFlag ? "yes" : "no"}<br />
              <strong>Notes:</strong> {p.notes || "(none)"}
            </Text>
            <Text><a href={p.adminLinkUrl}>Open in admin</a></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/email/render.tsx src/lib/email/templates/CentreRequestAck.tsx src/lib/email/templates/CentreRequestNotify.tsx
git commit -m "feat(email): add render helper + Centre request ack/notify templates"
```

---

## Task 5: Centre insert query + integration test

**Files:**
- Create: `src/lib/db/queries/centres.ts`
- Test: `tests/unit/db/queries/centres.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { insertCentreRequest, getCentreRequestById } from "@/lib/db/queries/centres";

describe("insertCentreRequest", () => {
  it("inserts a row with status=new and returns the id", async () => {
    const db = makeTestDb();
    const id = await insertCentreRequest(db as any, {
      centreName: "Sunny Days",
      contactName: "Jane",
      contactEmail: "jane@sunny.example",
      contactPhone: "0400000000",
      suburb: "Parramatta",
      postcode: "2150",
      roleNeeded: "cert3",
      shiftDate: "2026-07-10",
      shiftStart: "07:30",
      shiftDurationHrs: 8,
      specialNeedsFlag: false,
      notes: "",
      ipHash: "abc",
      source: null,
    });
    expect(id).toMatch(/^[0-9A-Za-z_-]{26}$/);
    const row = await getCentreRequestById(db as any, id);
    expect(row?.status).toBe("new");
    expect(row?.centreName).toBe("Sunny Days");
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/db/queries/centres.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { centreRequests, type CentreRequest, CENTRE_ROLE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export interface InsertCentreInput {
  centreName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  suburb: string;
  postcode: string;
  roleNeeded: (typeof CENTRE_ROLE)[number];
  shiftDate: string;
  shiftStart: string;
  shiftDurationHrs: number;
  specialNeedsFlag: boolean;
  notes: string;
  ipHash: string;
  source: string | null;
}

export async function insertCentreRequest(db: Db, input: InsertCentreInput): Promise<string> {
  const id = newId();
  const now = Date.now();
  await db.insert(centreRequests).values({
    id,
    status: "new",
    centreName: input.centreName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    suburb: input.suburb,
    postcode: input.postcode,
    roleNeeded: input.roleNeeded,
    shiftDate: input.shiftDate,
    shiftStart: input.shiftStart,
    shiftDurationHrs: input.shiftDurationHrs,
    specialNeedsFlag: input.specialNeedsFlag,
    notes: input.notes || null,
    source: input.source,
    ipHash: input.ipHash,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function getCentreRequestById(db: Db, id: string): Promise<CentreRequest | undefined> {
  const rows = await db.select().from(centreRequests).where(eq(centreRequests.id, id)).limit(1);
  return rows[0];
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/db/queries/centres.test.ts`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/db/queries/centres.test.ts src/lib/db/queries/centres.ts
git commit -m "feat(db): add centre insert query + test"
```

---

## Task 6: Centre Server Action + form + page + thank-you

**Files:**
- Create: `src/app/(marketing)/for-centres/request/actions.ts`
- Create: `src/components/forms/TurnstileWidget.tsx`
- Create: `src/components/forms/CentreRequestForm.tsx`
- Create: `src/app/(marketing)/for-centres/request/page.tsx`
- Create: `src/app/(marketing)/for-centres/request/thank-you/page.tsx`

- [ ] **Step 1: Implement actions.ts**

```tsx
"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { centreRequestSchema, type CentreRequestInput } from "@/lib/validation/schemas";
import { bindings } from "@/lib/server/request-context";
import { rateGuard } from "@/lib/server/rate-guard";
import { db } from "@/lib/db/client";
import { insertCentreRequest } from "@/lib/db/queries/centres";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import CentreRequestAck from "@/lib/email/templates/CentreRequestAck";
import CentreRequestNotify from "@/lib/email/templates/CentreRequestNotify";

export type ActionState = { ok: boolean; error?: string };

export async function submitCentreRequest(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = {
    centreName: fd.get("centreName"),
    contactName: fd.get("contactName"),
    contactEmail: fd.get("contactEmail"),
    contactPhone: fd.get("contactPhone"),
    suburb: fd.get("suburb"),
    postcode: fd.get("postcode"),
    roleNeeded: fd.get("roleNeeded"),
    shiftDate: fd.get("shiftDate"),
    shiftStart: fd.get("shiftStart"),
    shiftDurationHrs: Number(fd.get("shiftDurationHrs")),
    specialNeedsFlag: fd.get("specialNeedsFlag") === "on",
    notes: fd.get("notes") ?? "",
    privacyConsent: fd.get("privacyConsent") === "on",
    turnstileToken: fd.get("cf-turnstile-response") ?? "",
  };

  let parsed: CentreRequestInput;
  try {
    parsed = centreRequestSchema.parse(raw);
  } catch {
    return { ok: false, error: "Please check the required fields and try again." };
  }

  const guard = await rateGuard({ bucket: "centre", turnstileToken: parsed.turnstileToken });
  if (!guard.ok) {
    return { ok: false, error: "Verification failed. Please refresh and try again." };
  }

  const env = bindings();
  const id = await insertCentreRequest(db(env.DB), {
    centreName: parsed.centreName,
    contactName: parsed.contactName,
    contactEmail: parsed.contactEmail,
    contactPhone: parsed.contactPhone,
    suburb: parsed.suburb,
    postcode: parsed.postcode,
    roleNeeded: parsed.roleNeeded,
    shiftDate: parsed.shiftDate,
    shiftStart: parsed.shiftStart,
    shiftDurationHrs: parsed.shiftDurationHrs,
    specialNeedsFlag: parsed.specialNeedsFlag,
    notes: parsed.notes,
    ipHash: guard.ipHash,
    source: null,
  });

  const resend = new Resend(env.RESEND_API_KEY);
  const ack = await renderEmail(
    <CentreRequestAck
      contactName={parsed.contactName}
      centreName={parsed.centreName}
      shiftDate={parsed.shiftDate}
      shiftStart={parsed.shiftStart}
    />,
  );
  const notify = await renderEmail(
    <CentreRequestNotify
      {...parsed}
      adminLinkUrl={`${env.PUBLIC_SITE_URL}/admin/submissions/centre/${id}`}
    />,
  );

  try {
    await sendEmail({
      client: resend,
      from: env.RESEND_FROM_ADDRESS,
      to: parsed.contactEmail,
      subject: "We have received your booking request",
      ...ack,
    });
    await sendEmail({
      client: resend,
      from: env.RESEND_FROM_ADDRESS,
      to: env.ADMIN_EMAIL,
      subject: `[Safe Hands] Centre request — ${parsed.centreName}`,
      ...notify,
    });
  } catch (err) {
    console.error("centre email send failed", err);
  }

  redirect("/for-centres/request/thank-you");
}
```

- [ ] **Step 2: Implement TurnstileWidget**

```tsx
"use client";
import Script from "next/script";

export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} />
    </>
  );
}
```

- [ ] **Step 3: Implement CentreRequestForm**

```tsx
"use client";

import { useActionState } from "react";
import { submitCentreRequest, type ActionState } from "@/app/(marketing)/for-centres/request/actions";
import { TurnstileWidget } from "./TurnstileWidget";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "cert3", label: "Cert III" },
  { value: "diploma", label: "Diploma" },
  { value: "ect", label: "Early Childhood Teacher" },
  { value: "room_leader", label: "Room Leader" },
  { value: "oshc", label: "OSHC" },
];

export function CentreRequestForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitCentreRequest, { ok: true });
  return (
    <form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field name="centreName" label="Centre name" required />
      <Field name="contactName" label="Your name" required />
      <Field name="contactEmail" label="Email" type="email" required />
      <Field name="contactPhone" label="Phone" type="tel" required />
      <Field name="suburb" label="Suburb" required />
      <Field name="postcode" label="Postcode" required pattern="\d{4}" inputMode="numeric" />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Role needed</span>
        <select name="roleNeeded" required className="rounded-md border px-3 py-2">
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
      <Field name="shiftDate" label="Shift date" type="date" required />
      <Field name="shiftStart" label="Shift start" type="time" required />
      <Field name="shiftDurationHrs" label="Duration (hours)" type="number" step="0.5" min="0.5" required />
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="specialNeedsFlag" />
        Educator should have special-needs / behavioural-support experience
      </label>
      <label className="md:col-span-2 flex flex-col gap-1 text-sm">
        <span className="font-medium">Notes (optional, max 2000 chars)</span>
        <textarea name="notes" maxLength={2000} rows={4} className="rounded-md border px-3 py-2" />
      </label>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="privacyConsent" required />
        I have read and agree to the <a href="/legal/privacy" className="underline">Privacy Policy</a>.
      </label>
      <div className="md:col-span-2"><TurnstileWidget siteKey={siteKey} /></div>
      {state.error ? <p className="md:col-span-2 text-sm text-red-700">{state.error}</p> : null}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit request"}
        </button>
      </div>
    </form>
  );
}

function Field(props: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  pattern?: string;
  inputMode?: "numeric" | "text";
  step?: string;
  min?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{props.label}{props.required ? " *" : ""}</span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        pattern={props.pattern}
        inputMode={props.inputMode}
        step={props.step}
        min={props.min}
        className="rounded-md border px-3 py-2"
      />
    </label>
  );
}
```

- [ ] **Step 4: Implement page**

```tsx
import { CentreRequestForm } from "@/components/forms/CentreRequestForm";

export default function CentreRequestPage() {
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Centre booking request</h1>
        <p className="mt-2 text-slate-700">
          Prefer to call? We answer the phone on <a href="tel:1300723343" className="underline">1300 SAFE HANDS</a>.
        </p>
        <div className="mt-8 rounded-lg border bg-white p-6">
          <CentreRequestForm siteKey={siteKey} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement thank-you**

```tsx
export default function CentreThankYouPage() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Thanks — request received.</h1>
        <p className="mt-4 text-slate-700">
          A Safe Hands operator will be in touch within 4 business hours to confirm coverage.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/(marketing)/for-centres/request/ src/components/forms/
git commit -m "feat(forms): add centre request end-to-end (action, form, page, thank-you)"
```

---

## Task 7: Family insert query + integration test

**Files:**
- Create: `src/lib/db/queries/families.ts`
- Test: `tests/unit/db/queries/families.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { insertFamilyRequest, getFamilyRequestById } from "@/lib/db/queries/families";

describe("insertFamilyRequest", () => {
  it("inserts a row with status=new", async () => {
    const db = makeTestDb();
    const id = await insertFamilyRequest(db as any, {
      parentName: "Sam Lee",
      contactEmail: "sam@example.com",
      contactPhone: "0400123456",
      suburb: "Newtown",
      postcode: "2042",
      childrenCount: 2,
      childrenAges: "3,7",
      careType: "after_school",
      shiftDate: "2026-07-10",
      shiftStart: "15:00",
      shiftDurationHrs: 3,
      specialNeedsFlag: false,
      specialNeedsNotes: "",
      notes: "",
      ipHash: "abc",
      source: null,
    });
    const row = await getFamilyRequestById(db as any, id);
    expect(row?.status).toBe("new");
    expect(row?.parentName).toBe("Sam Lee");
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/db/queries/families.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { familyRequests, type FamilyRequest, FAMILY_CARE_TYPE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export interface InsertFamilyInput {
  parentName: string;
  contactEmail: string;
  contactPhone: string;
  suburb: string;
  postcode: string;
  childrenCount: number;
  childrenAges: string;
  careType: (typeof FAMILY_CARE_TYPE)[number];
  shiftDate: string;
  shiftStart: string;
  shiftDurationHrs: number;
  specialNeedsFlag: boolean;
  specialNeedsNotes: string;
  notes: string;
  ipHash: string;
  source: string | null;
}

export async function insertFamilyRequest(db: Db, input: InsertFamilyInput): Promise<string> {
  const id = newId();
  const now = Date.now();
  await db.insert(familyRequests).values({
    id,
    status: "new",
    parentName: input.parentName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    suburb: input.suburb,
    postcode: input.postcode,
    childrenCount: input.childrenCount,
    childrenAges: input.childrenAges,
    careType: input.careType,
    shiftDate: input.shiftDate,
    shiftStart: input.shiftStart,
    shiftDurationHrs: input.shiftDurationHrs,
    specialNeedsFlag: input.specialNeedsFlag,
    specialNeedsNotes: input.specialNeedsNotes || null,
    notes: input.notes || null,
    source: input.source,
    ipHash: input.ipHash,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function getFamilyRequestById(db: Db, id: string): Promise<FamilyRequest | undefined> {
  const rows = await db.select().from(familyRequests).where(eq(familyRequests.id, id)).limit(1);
  return rows[0];
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/db/queries/families.test.ts`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/db/queries/families.test.ts src/lib/db/queries/families.ts
git commit -m "feat(db): add family insert query + test"
```

---

## Task 8: Family Resend templates + Server Action + form + page + thank-you

**Files:**
- Create: `src/lib/email/templates/FamilyRequestAck.tsx`
- Create: `src/lib/email/templates/FamilyRequestNotify.tsx`
- Create: `src/app/(marketing)/for-families/request/actions.ts`
- Create: `src/components/forms/FamilyRequestForm.tsx`
- Create: `src/app/(marketing)/for-families/request/page.tsx`
- Create: `src/app/(marketing)/for-families/request/thank-you/page.tsx`

This mirrors Task 6 with family-specific fields. The repetition is intentional — same pattern, different shape.

- [ ] **Step 1: FamilyRequestAck template**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function FamilyRequestAck(props: {
  parentName: string;
  shiftDate: string;
  shiftStart: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>We have received your care request</Preview>
      <Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
        <Container style={{ maxWidth: 560, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 20 }}>Thanks, {props.parentName}.</Heading>
          <Section>
            <Text>
              We have received your care request for {props.shiftDate} at {props.shiftStart}.
            </Text>
            <Text>
              A Safe Hands operator will be in touch within 4 business hours to discuss next steps.
            </Text>
            <Text>— Safe Hands Staffing</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: FamilyRequestNotify template**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function FamilyRequestNotify(p: {
  parentName: string;
  contactEmail: string;
  contactPhone: string;
  suburb: string;
  postcode: string;
  childrenCount: number;
  childrenAges: string;
  careType: string;
  shiftDate: string;
  shiftStart: string;
  shiftDurationHrs: number;
  specialNeedsFlag: boolean;
  specialNeedsNotes: string;
  notes: string;
  adminLinkUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>New family care request — {p.parentName}</Preview>
      <Body style={{ fontFamily: "ui-monospace, monospace", color: "#0f172a" }}>
        <Container style={{ maxWidth: 600, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 18 }}>New family care request</Heading>
          <Section>
            <Text>
              <strong>Parent:</strong> {p.parentName} &lt;{p.contactEmail}&gt; — {p.contactPhone}<br />
              <strong>Suburb:</strong> {p.suburb} {p.postcode}<br />
              <strong>Children:</strong> {p.childrenCount} (ages {p.childrenAges})<br />
              <strong>Care type:</strong> {p.careType}<br />
              <strong>Shift:</strong> {p.shiftDate} {p.shiftStart} for {p.shiftDurationHrs}h<br />
              <strong>Special needs:</strong> {p.specialNeedsFlag ? "yes" : "no"}<br />
              <strong>Special needs notes:</strong> {p.specialNeedsNotes || "(none)"}<br />
              <strong>Notes:</strong> {p.notes || "(none)"}
            </Text>
            <Text><a href={p.adminLinkUrl}>Open in admin</a></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 3: Family actions.ts**

```tsx
"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { familyRequestSchema, type FamilyRequestInput } from "@/lib/validation/schemas";
import { bindings } from "@/lib/server/request-context";
import { rateGuard } from "@/lib/server/rate-guard";
import { db } from "@/lib/db/client";
import { insertFamilyRequest } from "@/lib/db/queries/families";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import FamilyRequestAck from "@/lib/email/templates/FamilyRequestAck";
import FamilyRequestNotify from "@/lib/email/templates/FamilyRequestNotify";

export type ActionState = { ok: boolean; error?: string };

export async function submitFamilyRequest(_p: ActionState, fd: FormData): Promise<ActionState> {
  const raw = {
    parentName: fd.get("parentName"),
    contactEmail: fd.get("contactEmail"),
    contactPhone: fd.get("contactPhone"),
    suburb: fd.get("suburb"),
    postcode: fd.get("postcode"),
    childrenCount: Number(fd.get("childrenCount")),
    childrenAges: fd.get("childrenAges") ?? "",
    careType: fd.get("careType"),
    shiftDate: fd.get("shiftDate"),
    shiftStart: fd.get("shiftStart"),
    shiftDurationHrs: Number(fd.get("shiftDurationHrs")),
    specialNeedsFlag: fd.get("specialNeedsFlag") === "on",
    specialNeedsNotes: fd.get("specialNeedsNotes") ?? "",
    notes: fd.get("notes") ?? "",
    privacyConsent: fd.get("privacyConsent") === "on",
    turnstileToken: fd.get("cf-turnstile-response") ?? "",
  };
  let parsed: FamilyRequestInput;
  try {
    parsed = familyRequestSchema.parse(raw);
  } catch {
    return { ok: false, error: "Please check the required fields and try again." };
  }

  const guard = await rateGuard({ bucket: "family", turnstileToken: parsed.turnstileToken });
  if (!guard.ok) return { ok: false, error: "Verification failed." };

  const env = bindings();
  const id = await insertFamilyRequest(db(env.DB), { ...parsed, ipHash: guard.ipHash, source: null });

  const resend = new Resend(env.RESEND_API_KEY);
  const ack = await renderEmail(
    <FamilyRequestAck parentName={parsed.parentName} shiftDate={parsed.shiftDate} shiftStart={parsed.shiftStart} />,
  );
  const notify = await renderEmail(
    <FamilyRequestNotify {...parsed} adminLinkUrl={`${env.PUBLIC_SITE_URL}/admin/submissions/family/${id}`} />,
  );

  try {
    await sendEmail({
      client: resend,
      from: env.RESEND_FROM_ADDRESS,
      to: parsed.contactEmail,
      subject: "We have received your care request",
      ...ack,
    });
    await sendEmail({
      client: resend,
      from: env.RESEND_FROM_ADDRESS,
      to: env.ADMIN_EMAIL,
      subject: `[Safe Hands] Family request — ${parsed.parentName}`,
      ...notify,
    });
  } catch (err) {
    console.error("family email send failed", err);
  }
  redirect("/for-families/request/thank-you");
}
```

- [ ] **Step 4: FamilyRequestForm**

Same shape as `CentreRequestForm.tsx`. Replace the field set with: parentName, contactEmail, contactPhone, suburb, postcode, childrenCount (number input min 1 max 10), childrenAges (text), careType (select: after_school/holiday/ad_hoc/overnight), shiftDate, shiftStart, shiftDurationHrs, specialNeedsFlag (checkbox), specialNeedsNotes (textarea), notes (textarea), privacyConsent (checkbox), Turnstile widget. Action wire: `useActionState(submitFamilyRequest, {ok:true})`. Copy the `Field` helper from CentreRequestForm into this file so it is self-contained.

- [ ] **Step 5: Page**

```tsx
import { FamilyRequestForm } from "@/components/forms/FamilyRequestForm";

export default function FamilyRequestPage() {
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Request care</h1>
        <p className="mt-2 text-slate-700">
          We will call you back within 4 business hours during operating hours.
        </p>
        <div className="mt-8 rounded-lg border bg-white p-6">
          <FamilyRequestForm siteKey={siteKey} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Thank-you**

```tsx
export default function FamilyThankYouPage() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Thanks — care request received.</h1>
        <p className="mt-4 text-slate-700">
          A Safe Hands operator will be in touch within 4 business hours.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/email/templates/FamilyRequest*.tsx src/app/(marketing)/for-families/request/ src/components/forms/FamilyRequestForm.tsx
git commit -m "feat(forms): add family booking-request end-to-end"
```

---

## Task 9: Educator queries — draft, step updates, finalize, documents

**Files:**
- Create: `src/lib/db/queries/educators.ts`
- Test: `tests/unit/db/queries/educators.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import {
  createDraftEducator,
  getDraftById,
  updateEducatorStep2,
  recordEducatorDocument,
  listEducatorDocuments,
  setStep3Complete,
  finalizeEducatorApplication,
} from "@/lib/db/queries/educators";

describe("educator queries", () => {
  it("draft → step2 → docs → finalize", async () => {
    const db = makeTestDb();
    const id = await createDraftEducator(db as any, {
      firstName: "Alex", lastName: "Park", email: "alex@example.com", phone: "0400000000",
      suburb: "Marrickville", postcode: "2204", privacyConsent: true, ipHash: "h",
    });
    expect((await getDraftById(db as any, id))?.stepCompleted).toBe(1);

    await updateEducatorStep2(db as any, id, {
      qualificationLevel: "diploma", qualificationOther: "",
      yearsExperience: 4, specialNeedsExperience: true, specialNeedsNotes: "ASD",
      availability: { mon: ["am"], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      travelRadiusKm: 10, hasOwnTransport: true,
    });
    expect((await getDraftById(db as any, id))?.stepCompleted).toBe(2);

    await recordEducatorDocument(db as any, {
      applicationId: id, docType: "wwcc", r2Key: "k1",
      originalFilename: "wwcc.pdf", mimeType: "application/pdf", sizeBytes: 1000,
    });
    expect(await listEducatorDocuments(db as any, id)).toHaveLength(1);

    await setStep3Complete(db as any, id);
    expect((await getDraftById(db as any, id))?.stepCompleted).toBe(3);

    await finalizeEducatorApplication(db as any, id);
    const final = await getDraftById(db as any, id);
    expect(final?.status).toBe("submitted");
    expect(final?.submittedAt).toBeGreaterThan(0);
    expect(final?.stepCompleted).toBe(4);
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/db/queries/educators.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  educatorApplications,
  educatorDocuments,
  type EducatorApplication,
  type EducatorDocument,
  EDUCATOR_DOC_TYPE,
} from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";
import type { EducatorStep2Input } from "@/lib/validation/schemas";

export interface CreateDraftInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  suburb: string;
  postcode: string;
  privacyConsent: boolean;
  ipHash: string;
}

export async function createDraftEducator(db: Db, input: CreateDraftInput): Promise<string> {
  const id = newId();
  const now = Date.now();
  await db.insert(educatorApplications).values({
    id,
    status: "draft",
    stepCompleted: 1,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    suburb: input.suburb,
    postcode: input.postcode,
    privacyConsent: input.privacyConsent,
    privacyConsentAt: now,
    ipHash: input.ipHash,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function getDraftById(db: Db, id: string): Promise<EducatorApplication | undefined> {
  const rows = await db.select().from(educatorApplications).where(eq(educatorApplications.id, id)).limit(1);
  return rows[0];
}

export async function updateEducatorStep2(db: Db, id: string, input: EducatorStep2Input): Promise<void> {
  const now = Date.now();
  await db.update(educatorApplications)
    .set({
      qualificationLevel: input.qualificationLevel,
      qualificationOther: input.qualificationOther || null,
      yearsExperience: input.yearsExperience,
      specialNeedsExperience: input.specialNeedsExperience,
      specialNeedsNotes: input.specialNeedsNotes || null,
      availability: JSON.stringify(input.availability),
      travelRadiusKm: input.travelRadiusKm,
      hasOwnTransport: input.hasOwnTransport,
      stepCompleted: 2,
      updatedAt: now,
    })
    .where(eq(educatorApplications.id, id));
}

export interface RecordDocInput {
  applicationId: string;
  docType: (typeof EDUCATOR_DOC_TYPE)[number];
  r2Key: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export async function recordEducatorDocument(db: Db, input: RecordDocInput): Promise<string> {
  const id = newId();
  await db.insert(educatorDocuments).values({
    id,
    applicationId: input.applicationId,
    docType: input.docType,
    r2Key: input.r2Key,
    originalFilename: input.originalFilename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    uploadedAt: Date.now(),
  });
  return id;
}

export async function listEducatorDocuments(db: Db, applicationId: string): Promise<EducatorDocument[]> {
  return db.select().from(educatorDocuments).where(eq(educatorDocuments.applicationId, applicationId));
}

export async function setStep3Complete(db: Db, id: string): Promise<void> {
  await db.update(educatorApplications)
    .set({ stepCompleted: 3, updatedAt: Date.now() })
    .where(eq(educatorApplications.id, id));
}

export async function finalizeEducatorApplication(db: Db, id: string): Promise<void> {
  const now = Date.now();
  await db.update(educatorApplications)
    .set({ status: "submitted", submittedAt: now, stepCompleted: 4, updatedAt: now })
    .where(eq(educatorApplications.id, id));
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/db/queries/educators.test.ts`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/db/queries/educators.test.ts src/lib/db/queries/educators.ts
git commit -m "feat(db): add educator draft/step/finalize queries"
```

---

## Task 10: Resume token queries

**Files:**
- Create: `src/lib/db/queries/resume-tokens.ts`
- Test: `tests/unit/db/queries/resume-tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { issueResumeToken, consumeResumeToken } from "@/lib/db/queries/resume-tokens";
import { createDraftEducator } from "@/lib/db/queries/educators";

describe("resume tokens", () => {
  it("issues and consumes a valid token", async () => {
    const db = makeTestDb();
    const appId = await createDraftEducator(db as any, {
      firstName: "A", lastName: "B", email: "a@b.example", phone: "0400000000",
      suburb: "X", postcode: "2000", privacyConsent: true, ipHash: "h",
    });
    const plain = await issueResumeToken(db as any, appId, 30 * 86400);
    expect(plain).toMatch(/^[A-Za-z0-9_-]{30,}$/);
    const consumed = await consumeResumeToken(db as any, plain);
    expect(consumed).toBe(appId);
    const again = await consumeResumeToken(db as any, plain);
    expect(again).toBeNull(); // single-use
  });

  it("rejects expired tokens", async () => {
    const db = makeTestDb();
    const appId = await createDraftEducator(db as any, {
      firstName: "A", lastName: "B", email: "a@b.example", phone: "0400000000",
      suburb: "X", postcode: "2000", privacyConsent: true, ipHash: "h",
    });
    const plain = await issueResumeToken(db as any, appId, -1);
    expect(await consumeResumeToken(db as any, plain)).toBeNull();
  });
});
```

- [ ] **Step 2: Implement**

```ts
import { and, eq, gte, isNull } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { educatorResumeTokens } from "@/lib/db/schema";
import { generateToken, hashToken } from "@/lib/auth/tokens";

export async function issueResumeToken(db: Db, applicationId: string, ttlSeconds: number): Promise<string> {
  const plain = generateToken();
  const tokenHash = await hashToken(plain);
  const now = Date.now();
  await db.insert(educatorResumeTokens).values({
    tokenHash,
    applicationId,
    expiresAt: now + ttlSeconds * 1000,
    createdAt: now,
  });
  return plain;
}

export async function consumeResumeToken(db: Db, plainToken: string): Promise<string | null> {
  const tokenHash = await hashToken(plainToken);
  const now = Date.now();
  const rows = await db.select().from(educatorResumeTokens).where(
    and(
      eq(educatorResumeTokens.tokenHash, tokenHash),
      isNull(educatorResumeTokens.usedAt),
      gte(educatorResumeTokens.expiresAt, now),
    ),
  ).limit(1);
  const row = rows[0];
  if (!row) return null;
  await db.update(educatorResumeTokens)
    .set({ usedAt: now })
    .where(eq(educatorResumeTokens.tokenHash, tokenHash));
  return row.applicationId;
}
```

- [ ] **Step 3: Run, expect PASS**

Run: `pnpm vitest run tests/unit/db/queries/resume-tokens.test.ts`
Expected: 2 passing.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/db/queries/resume-tokens.test.ts src/lib/db/queries/resume-tokens.ts
git commit -m "feat(db): add resume-token issue/consume queries (single-use)"
```

---

## Task 11: Wizard draft cookie

**Files:**
- Create: `src/lib/auth/wizard-cookie.ts`

- [ ] **Step 1: Implement**

```ts
import { cookies } from "next/headers";

const COOKIE = "sh_educator_draft";

export async function setWizardCookie(applicationId: string) {
  const jar = await cookies();
  jar.set(COOKIE, applicationId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });
}

export async function getWizardCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function clearWizardCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth/wizard-cookie.ts
git commit -m "feat(auth): add 2-hour cookie for wizard draft id"
```

---

## Task 12: Educator Step 1 — email template, action, progress, form, page

**Files:**
- Create: `src/lib/email/templates/EducatorStep1Resume.tsx`
- Create: `src/components/wizard/WizardProgress.tsx`
- Create: `src/components/wizard/Step1Identity.tsx`
- Create: `src/app/(marketing)/for-educators/apply/actions.ts`
- Create: `src/app/(marketing)/for-educators/apply/page.tsx`

- [ ] **Step 1: EducatorStep1Resume template**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EducatorStep1Resume(props: { firstName: string; resumeUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>Resume your Safe Hands application</Preview>
      <Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
        <Container style={{ maxWidth: 560, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 20 }}>Hi {props.firstName},</Heading>
          <Section>
            <Text>
              Thanks for starting your application with Safe Hands Staffing. You can finish it now
              or come back later — use the link below to resume from where you left off.
            </Text>
            <Text>
              <a href={props.resumeUrl}>Resume your application →</a>
            </Text>
            <Text style={{ fontSize: 12, color: "#475569" }}>
              This link is valid for 30 days and can only be used once. If you need a new link,
              contact us at recruitment@safehandsstaffing.com.au.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: WizardProgress**

```tsx
const STEPS = [
  { num: 1, label: "Identity" },
  { num: 2, label: "Qualifications" },
  { num: 3, label: "Documents" },
  { num: 4, label: "Review" },
];

export function WizardProgress({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center justify-between gap-2" aria-label="Application progress">
      {STEPS.map((s) => {
        const state = s.num < current ? "done" : s.num === current ? "current" : "todo";
        return (
          <li key={s.num} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                state === "done"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : state === "current"
                    ? "border-slate-900 bg-white text-slate-900"
                    : "border-slate-300 text-slate-400"
              }`}
              aria-current={state === "current" ? "step" : undefined}
            >
              {s.num}
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-700">{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Step1Identity component**

```tsx
"use client";
import { useActionState } from "react";
import { educatorStep1Action, type WizardActionState } from "@/app/(marketing)/for-educators/apply/actions";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

export function Step1Identity({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState<WizardActionState, FormData>(
    educatorStep1Action, { ok: true },
  );
  return (
    <form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field name="firstName" label="First name" required />
      <Field name="lastName" label="Last name" required />
      <Field name="email" label="Email" type="email" required />
      <Field name="phone" label="Phone" type="tel" required />
      <Field name="suburb" label="Suburb" required />
      <Field name="postcode" label="Postcode" required pattern="\d{4}" />
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="privacyConsent" required />
        I have read and agree to the <a href="/legal/privacy" className="underline">Privacy Policy</a>.
      </label>
      <div className="md:col-span-2"><TurnstileWidget siteKey={siteKey} /></div>
      {state.error ? <p className="md:col-span-2 text-sm text-red-700">{state.error}</p> : null}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save and continue"}
        </button>
      </div>
    </form>
  );
}

function Field(props: { name: string; label: string; type?: string; required?: boolean; pattern?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{props.label}{props.required ? " *" : ""}</span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        pattern={props.pattern}
        className="rounded-md border px-3 py-2"
      />
    </label>
  );
}
```

- [ ] **Step 4: actions.ts (step 1 only — extended in later tasks)**

```tsx
"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { educatorStep1Schema } from "@/lib/validation/schemas";
import { bindings } from "@/lib/server/request-context";
import { rateGuard } from "@/lib/server/rate-guard";
import { db } from "@/lib/db/client";
import { createDraftEducator } from "@/lib/db/queries/educators";
import { issueResumeToken } from "@/lib/db/queries/resume-tokens";
import { setWizardCookie } from "@/lib/auth/wizard-cookie";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import EducatorStep1Resume from "@/lib/email/templates/EducatorStep1Resume";

export type WizardActionState = { ok: boolean; error?: string };

export async function educatorStep1Action(
  _p: WizardActionState,
  fd: FormData,
): Promise<WizardActionState> {
  const raw = {
    firstName: fd.get("firstName"),
    lastName: fd.get("lastName"),
    email: fd.get("email"),
    phone: fd.get("phone"),
    suburb: fd.get("suburb"),
    postcode: fd.get("postcode"),
    privacyConsent: fd.get("privacyConsent") === "on",
    turnstileToken: fd.get("cf-turnstile-response") ?? "",
  };
  let parsed;
  try {
    parsed = educatorStep1Schema.parse(raw);
  } catch {
    return { ok: false, error: "Please check the required fields and try again." };
  }

  const guard = await rateGuard({ bucket: "educator", turnstileToken: parsed.turnstileToken });
  if (!guard.ok) return { ok: false, error: "Verification failed." };

  const env = bindings();
  const applicationId = await createDraftEducator(db(env.DB), { ...parsed, ipHash: guard.ipHash });

  const plainToken = await issueResumeToken(db(env.DB), applicationId, 30 * 86400);
  const resumeUrl = `${env.PUBLIC_SITE_URL}/for-educators/apply/resume?token=${encodeURIComponent(plainToken)}`;
  await setWizardCookie(applicationId);

  const resend = new Resend(env.RESEND_API_KEY);
  const email = await renderEmail(<EducatorStep1Resume firstName={parsed.firstName} resumeUrl={resumeUrl} />);
  try {
    await sendEmail({
      client: resend,
      from: env.RESEND_FROM_ADDRESS,
      to: parsed.email,
      subject: "Resume your Safe Hands application",
      ...email,
    });
  } catch (err) {
    console.error("educator resume email failed", err);
  }

  redirect("/for-educators/apply/step-2");
}
```

- [ ] **Step 5: page**

```tsx
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step1Identity } from "@/components/wizard/Step1Identity";

export default function ApplyStep1Page() {
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
        <p className="mt-2 text-slate-700">Step 1 of 4 — identity & consent</p>
        <div className="mt-6"><WizardProgress current={1} /></div>
        <div className="mt-8 rounded-lg border bg-white p-6">
          <Step1Identity siteKey={siteKey} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/email/templates/EducatorStep1Resume.tsx src/components/wizard/WizardProgress.tsx src/components/wizard/Step1Identity.tsx src/app/(marketing)/for-educators/apply/page.tsx src/app/(marketing)/for-educators/apply/actions.ts
git commit -m "feat(wizard): add educator step 1 — identity, draft, resume email"
```

---

## Task 13: Educator Step 2 — qualifications

**Files:**
- Modify: `src/app/(marketing)/for-educators/apply/actions.ts` (append step 2 action)
- Create: `src/components/wizard/Step2Qualifications.tsx`
- Create: `src/app/(marketing)/for-educators/apply/step-2/page.tsx`

- [ ] **Step 1: Append educatorStep2Action to actions.ts**

Add these imports at the top:

```ts
import { educatorStep2Schema, availabilitySchema } from "@/lib/validation/schemas";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { updateEducatorStep2 } from "@/lib/db/queries/educators";
```

Append:

```ts
export async function educatorStep2Action(
  _p: WizardActionState,
  fd: FormData,
): Promise<WizardActionState> {
  const applicationId = await getWizardCookie();
  if (!applicationId) return { ok: false, error: "Your session expired. Please restart your application." };

  const avail = {
    mon: fd.getAll("availability_mon") as ("am" | "pm")[],
    tue: fd.getAll("availability_tue") as ("am" | "pm")[],
    wed: fd.getAll("availability_wed") as ("am" | "pm")[],
    thu: fd.getAll("availability_thu") as ("am" | "pm")[],
    fri: fd.getAll("availability_fri") as ("am" | "pm")[],
    sat: fd.getAll("availability_sat") as ("am" | "pm")[],
    sun: fd.getAll("availability_sun") as ("am" | "pm")[],
  };

  const raw = {
    qualificationLevel: fd.get("qualificationLevel"),
    qualificationOther: fd.get("qualificationOther") ?? "",
    yearsExperience: Number(fd.get("yearsExperience")),
    specialNeedsExperience: fd.get("specialNeedsExperience") === "on",
    specialNeedsNotes: fd.get("specialNeedsNotes") ?? "",
    availability: availabilitySchema.parse(avail),
    travelRadiusKm: Number(fd.get("travelRadiusKm")),
    hasOwnTransport: fd.get("hasOwnTransport") === "on",
  };

  let parsed;
  try {
    parsed = educatorStep2Schema.parse(raw);
  } catch {
    return { ok: false, error: "Please check the required fields and try again." };
  }

  const env = bindings();
  await updateEducatorStep2(db(env.DB), applicationId, parsed);
  redirect("/for-educators/apply/step-3");
}
```

- [ ] **Step 2: Step2Qualifications component**

```tsx
"use client";
import { useActionState } from "react";
import { educatorStep2Action, type WizardActionState } from "@/app/(marketing)/for-educators/apply/actions";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABEL: Record<(typeof DAYS)[number], string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

export function Step2Qualifications() {
  const [state, action, pending] = useActionState<WizardActionState, FormData>(
    educatorStep2Action, { ok: true },
  );
  return (
    <form action={action} className="space-y-6">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Highest qualification *</span>
        <select name="qualificationLevel" required className="rounded-md border px-3 py-2">
          <option value="cert3">Cert III ECEC</option>
          <option value="diploma">Diploma</option>
          <option value="ect">Early Childhood Teacher (ECT)</option>
          <option value="adv_dip">Advanced Diploma</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">If "Other", specify</span>
        <input name="qualificationOther" type="text" className="rounded-md border px-3 py-2" />
      </label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Years of experience *</span>
          <input name="yearsExperience" type="number" min={0} max={60} required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Travel radius (km) *</span>
          <input name="travelRadiusKm" type="number" min={0} max={200} required className="rounded-md border px-3 py-2" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="hasOwnTransport" /> I have my own transport
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="specialNeedsExperience" /> I have special-needs / behavioural-support experience
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Special-needs experience notes (optional)</span>
        <textarea name="specialNeedsNotes" rows={3} maxLength={2000} className="rounded-md border px-3 py-2" />
      </label>
      <fieldset>
        <legend className="text-sm font-medium">Availability</legend>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th></th><th className="px-2">AM</th><th className="px-2">PM</th></tr></thead>
            <tbody>
              {DAYS.map((d) => (
                <tr key={d}>
                  <td className="py-1 pr-2 font-medium">{DAY_LABEL[d]}</td>
                  <td className="px-2"><input type="checkbox" name={`availability_${d}`} value="am" /></td>
                  <td className="px-2"><input type="checkbox" name={`availability_${d}`} value="pm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: step-2 page**

```tsx
import { redirect } from "next/navigation";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step2Qualifications } from "@/components/wizard/Step2Qualifications";

export default async function ApplyStep2Page() {
  if (!(await getWizardCookie())) redirect("/for-educators/apply");
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
        <p className="mt-2 text-slate-700">Step 2 of 4 — qualifications & availability</p>
        <div className="mt-6"><WizardProgress current={2} /></div>
        <div className="mt-8 rounded-lg border bg-white p-6">
          <Step2Qualifications />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(marketing)/for-educators/apply/actions.ts src/app/(marketing)/for-educators/apply/step-2 src/components/wizard/Step2Qualifications.tsx
git commit -m "feat(wizard): add educator step 2 — qualifications & availability"
```

---

## Task 14: Presigned upload API route

**Files:**
- Create: `src/app/api/uploads/presign/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { EDUCATOR_DOC_TYPE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";
import { presignPutUrl } from "@/lib/storage/r2";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

const bodySchema = z.object({
  docType: z.enum(EDUCATOR_DOC_TYPE),
  filename: z.string().min(1).max(300),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  sizeBytes: z.number().int().min(1).max(MAX_BYTES),
});

export async function POST(req: NextRequest) {
  const applicationId = await getWizardCookie();
  if (!applicationId) return NextResponse.json({ error: "no_draft" }, { status: 401 });

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(parsed.mimeType)) {
    return NextResponse.json({ error: "unsupported_mime" }, { status: 415 });
  }

  const ext = parsed.mimeType === "application/pdf" ? "pdf" : parsed.mimeType === "image/png" ? "png" : "jpg";
  const r2Key = `educator-docs/${applicationId}/${parsed.docType}-${newId()}.${ext}`;

  const { env } = getCloudflareContext();
  const url = await presignPutUrl({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: "safe-hands-educator-docs",
    key: r2Key,
    contentType: parsed.mimeType,
    expiresInSeconds: 300,
  });

  return NextResponse.json({ uploadUrl: url, r2Key });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/uploads/presign/route.ts
git commit -m "feat(api): add presigned R2 PUT URL route for educator doc uploads"
```

---

## Task 15: Educator Step 3 — FileUploadField, record-document route, Step3 component, page, action

**Files:**
- Create: `src/components/wizard/FileUploadField.tsx`
- Create: `src/app/(marketing)/for-educators/apply/record-document/route.ts`
- Modify: `src/app/(marketing)/for-educators/apply/actions.ts` (append step 3 action)
- Create: `src/components/wizard/Step3Documents.tsx`
- Create: `src/app/(marketing)/for-educators/apply/step-3/page.tsx`

- [ ] **Step 1: FileUploadField**

```tsx
"use client";
import { useState } from "react";

export interface UploadedDoc {
  docType: string;
  r2Key: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export function FileUploadField(props: {
  docType: string;
  label: string;
  onUploaded: (doc: UploadedDoc) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError(null);
    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: props.docType,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });
      if (!presignRes.ok) throw new Error("presign_failed");
      const { uploadUrl, r2Key } = (await presignRes.json()) as { uploadUrl: string; r2Key: string };

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("put_failed");

      const recordRes = await fetch("/for-educators/apply/record-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: props.docType,
          r2Key,
          originalFilename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });
      if (!recordRes.ok) throw new Error("record_failed");

      props.onUploaded({
        docType: props.docType,
        r2Key,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Upload failed. Try again.");
    }
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{props.label}</span>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        onChange={handleChange}
        className="rounded-md border px-3 py-2"
      />
      {status === "uploading" ? <span className="text-xs text-slate-500">Uploading…</span> : null}
      {status === "done" ? <span className="text-xs text-green-700">Uploaded ✓</span> : null}
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
```

- [ ] **Step 2: record-document route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { recordEducatorDocument } from "@/lib/db/queries/educators";
import { EDUCATOR_DOC_TYPE } from "@/lib/db/schema";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";

const schema = z.object({
  docType: z.enum(EDUCATOR_DOC_TYPE),
  r2Key: z.string().min(1).max(500),
  originalFilename: z.string().min(1).max(300),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
});

export async function POST(req: NextRequest) {
  const applicationId = await getWizardCookie();
  if (!applicationId) return NextResponse.json({ error: "no_draft" }, { status: 401 });
  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { env } = getCloudflareContext();
  await recordEducatorDocument(db(env.DB), { applicationId, ...parsed });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Append educatorStep3Action to actions.ts**

Add imports:

```ts
import { listEducatorDocuments, setStep3Complete } from "@/lib/db/queries/educators";
import { educatorStep3Schema } from "@/lib/validation/schemas";
```

Append:

```ts
export async function educatorStep3Action(
  _p: WizardActionState,
  _fd: FormData,
): Promise<WizardActionState> {
  const applicationId = await getWizardCookie();
  if (!applicationId) return { ok: false, error: "Your session expired." };

  const env = bindings();
  const docs = await listEducatorDocuments(db(env.DB), applicationId);
  try {
    educatorStep3Schema.parse({
      documents: docs.map((d) => ({
        docType: d.docType,
        r2Key: d.r2Key,
        originalFilename: d.originalFilename,
        mimeType: d.mimeType,
        sizeBytes: d.sizeBytes,
      })),
    });
  } catch {
    return {
      ok: false,
      error:
        "Please upload all three mandatory documents (WWCC, First Aid HLTAID012, Cert III/Diploma).",
    };
  }
  await setStep3Complete(db(env.DB), applicationId);
  redirect("/for-educators/apply/step-4");
}
```

- [ ] **Step 4: Step3Documents component**

```tsx
"use client";
import { useActionState, useState } from "react";
import { educatorStep3Action, type WizardActionState } from "@/app/(marketing)/for-educators/apply/actions";
import { FileUploadField, type UploadedDoc } from "./FileUploadField";

const DOCS = [
  { docType: "wwcc", label: "Working With Children Check (mandatory)" },
  { docType: "first_aid_hltaid012", label: "HLTAID012 First Aid (mandatory)" },
  { docType: "cert3_diploma", label: "Cert III or Diploma certificate (mandatory)" },
  { docType: "id_document", label: "Photo ID (optional but recommended)" },
  { docType: "reference_letter", label: "Reference letter (optional)" },
];

export function Step3Documents() {
  const [uploaded, setUploaded] = useState<UploadedDoc[]>([]);
  const [state, action, pending] = useActionState<WizardActionState, FormData>(
    educatorStep3Action, { ok: true },
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">
        Upload each document below as PDF, JPG, or PNG (max 10MB). Files upload directly to secure
        storage; we only keep a reference.
      </p>
      {DOCS.map((d) => (
        <FileUploadField
          key={d.docType}
          docType={d.docType}
          label={d.label}
          onUploaded={(doc) => setUploaded((prev) => [...prev, doc])}
        />
      ))}
      {uploaded.length > 0 ? (
        <ul className="rounded-md bg-slate-50 p-3 text-sm">
          {uploaded.map((u, i) => (
            <li key={i}>✓ {u.docType} — {u.originalFilename}</li>
          ))}
        </ul>
      ) : null}
      <form action={action}>
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Checking…" : "Continue to review"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: step-3 page**

```tsx
import { redirect } from "next/navigation";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step3Documents } from "@/components/wizard/Step3Documents";

export default async function ApplyStep3Page() {
  if (!(await getWizardCookie())) redirect("/for-educators/apply");
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
        <p className="mt-2 text-slate-700">Step 3 of 4 — documents</p>
        <div className="mt-6"><WizardProgress current={3} /></div>
        <div className="mt-8 rounded-lg border bg-white p-6">
          <Step3Documents />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/FileUploadField.tsx src/components/wizard/Step3Documents.tsx src/app/(marketing)/for-educators/apply/step-3 src/app/(marketing)/for-educators/apply/record-document src/app/(marketing)/for-educators/apply/actions.ts
git commit -m "feat(wizard): add educator step 3 — direct-to-R2 doc uploads"
```

---

## Task 16: Educator Step 4 — review, submit, emails, thank-you

**Files:**
- Create: `src/lib/email/templates/EducatorSubmittedAck.tsx`
- Create: `src/lib/email/templates/EducatorSubmittedNotify.tsx`
- Modify: `src/app/(marketing)/for-educators/apply/actions.ts` (append step 4 action)
- Create: `src/components/wizard/Step4Review.tsx`
- Create: `src/app/(marketing)/for-educators/apply/step-4/page.tsx`
- Create: `src/app/(marketing)/for-educators/apply/thank-you/page.tsx`

- [ ] **Step 1: EducatorSubmittedAck**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EducatorSubmittedAck({ firstName }: { firstName: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your Safe Hands application has been submitted</Preview>
      <Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
        <Container style={{ maxWidth: 560, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 20 }}>Application received, {firstName}.</Heading>
          <Section>
            <Text>
              Thanks for completing your application. Our recruitment team will review it and be in
              touch within 5 business days to arrange a phone screen.
            </Text>
            <Text>— Safe Hands Staffing</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: EducatorSubmittedNotify**

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EducatorSubmittedNotify(p: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  suburb: string;
  qualificationLevel: string;
  yearsExperience: number;
  documents: { docType: string; url: string }[];
  adminLinkUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>New educator application — {p.firstName} {p.lastName}</Preview>
      <Body style={{ fontFamily: "ui-monospace, monospace", color: "#0f172a" }}>
        <Container style={{ maxWidth: 600, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 18 }}>New educator application</Heading>
          <Section>
            <Text>
              <strong>Name:</strong> {p.firstName} {p.lastName}<br />
              <strong>Email:</strong> {p.email}<br />
              <strong>Phone:</strong> {p.phone}<br />
              <strong>Suburb:</strong> {p.suburb}<br />
              <strong>Qualification:</strong> {p.qualificationLevel}<br />
              <strong>Years experience:</strong> {p.yearsExperience}<br />
            </Text>
            <Text><strong>Documents:</strong></Text>
            {p.documents.map((d, i) => (
              <Text key={i}><a href={d.url}>{d.docType}</a></Text>
            ))}
            <Text><a href={p.adminLinkUrl}>Open in admin</a></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 3: Append educatorStep4Action to actions.ts**

Add imports:

```ts
import { finalizeEducatorApplication, getDraftById } from "@/lib/db/queries/educators";
import { presignGetUrl } from "@/lib/storage/r2";
import { clearWizardCookie } from "@/lib/auth/wizard-cookie";
import EducatorSubmittedAck from "@/lib/email/templates/EducatorSubmittedAck";
import EducatorSubmittedNotify from "@/lib/email/templates/EducatorSubmittedNotify";
```

Append:

```ts
export async function educatorStep4Action(
  _p: WizardActionState,
  _fd: FormData,
): Promise<WizardActionState> {
  const applicationId = await getWizardCookie();
  if (!applicationId) return { ok: false, error: "Your session expired." };

  const env = bindings();
  const app = await getDraftById(db(env.DB), applicationId);
  if (!app) return { ok: false, error: "Draft not found." };

  await finalizeEducatorApplication(db(env.DB), applicationId);

  const docs = await listEducatorDocuments(db(env.DB), applicationId);
  const docUrls = await Promise.all(
    docs.map(async (d) => ({
      docType: d.docType,
      url: await presignGetUrl({
        accountId: env.R2_ACCOUNT_ID,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucket: "safe-hands-educator-docs",
        key: d.r2Key,
        expiresInSeconds: 24 * 3600,
      }),
    })),
  );

  const resend = new Resend(env.RESEND_API_KEY);
  const ack = await renderEmail(<EducatorSubmittedAck firstName={app.firstName} />);
  const notify = await renderEmail(
    <EducatorSubmittedNotify
      firstName={app.firstName}
      lastName={app.lastName}
      email={app.email}
      phone={app.phone}
      suburb={app.suburb}
      qualificationLevel={app.qualificationLevel ?? ""}
      yearsExperience={app.yearsExperience ?? 0}
      documents={docUrls}
      adminLinkUrl={`${env.PUBLIC_SITE_URL}/admin/submissions/educator/${applicationId}`}
    />,
  );

  try {
    await sendEmail({
      client: resend,
      from: env.RESEND_FROM_ADDRESS,
      to: app.email,
      subject: "Your Safe Hands application has been submitted",
      ...ack,
    });
    await sendEmail({
      client: resend,
      from: env.RESEND_FROM_ADDRESS,
      to: env.ADMIN_EMAIL,
      subject: `[Safe Hands] Educator application — ${app.firstName} ${app.lastName}`,
      ...notify,
    });
  } catch (err) {
    console.error("educator submit email failed", err);
  }

  await clearWizardCookie();
  redirect("/for-educators/apply/thank-you");
}
```

- [ ] **Step 4: Step4Review (server component)**

```tsx
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { db } from "@/lib/db/client";
import { getDraftById, listEducatorDocuments } from "@/lib/db/queries/educators";
import { educatorStep4Action } from "@/app/(marketing)/for-educators/apply/actions";

export async function Step4Review() {
  const applicationId = await getWizardCookie();
  if (!applicationId) redirect("/for-educators/apply");
  const { env } = getCloudflareContext();
  const app = await getDraftById(db(env.DB), applicationId);
  if (!app) redirect("/for-educators/apply");
  const docs = await listEducatorDocuments(db(env.DB), applicationId);

  return (
    <div className="space-y-6 text-sm">
      <Section title="Identity">
        <Row label="Name" value={`${app.firstName} ${app.lastName}`} />
        <Row label="Email" value={app.email} />
        <Row label="Phone" value={app.phone} />
        <Row label="Suburb" value={`${app.suburb} ${app.postcode}`} />
      </Section>
      <Section title="Qualifications">
        <Row label="Qualification" value={app.qualificationLevel ?? "(not provided)"} />
        <Row label="Years experience" value={String(app.yearsExperience ?? 0)} />
        <Row label="Travel radius (km)" value={String(app.travelRadiusKm ?? 0)} />
        <Row label="Own transport" value={app.hasOwnTransport ? "yes" : "no"} />
        <Row label="Special-needs experience" value={app.specialNeedsExperience ? "yes" : "no"} />
      </Section>
      <Section title="Documents">
        <ul>
          {docs.map((d) => (
            <li key={d.id}>✓ {d.docType} — {d.originalFilename}</li>
          ))}
        </ul>
      </Section>
      <form action={educatorStep4Action}>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white"
        >
          Submit application
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium">{label}:</span> {value}
    </p>
  );
}
```

- [ ] **Step 5: step-4 page**

```tsx
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step4Review } from "@/components/wizard/Step4Review";

export default function ApplyStep4Page() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
        <p className="mt-2 text-slate-700">Step 4 of 4 — review & submit</p>
        <div className="mt-6"><WizardProgress current={4} /></div>
        <div className="mt-8 rounded-lg border bg-white p-6">
          <Step4Review />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: thank-you**

```tsx
export default function EducatorThankYouPage() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Application received.</h1>
        <p className="mt-4 text-slate-700">
          Thanks for applying. Our recruitment team will review your application and be in touch
          within 5 business days.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/email/templates/EducatorSubmitted*.tsx src/components/wizard/Step4Review.tsx src/app/(marketing)/for-educators/apply/step-4 src/app/(marketing)/for-educators/apply/thank-you src/app/(marketing)/for-educators/apply/actions.ts
git commit -m "feat(wizard): add educator step 4 — review, submit, emails, thank-you"
```

---

## Task 17: Resume route

**Files:**
- Create: `src/app/(marketing)/for-educators/apply/resume/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { consumeResumeToken } from "@/lib/db/queries/resume-tokens";
import { getDraftById } from "@/lib/db/queries/educators";
import { setWizardCookie } from "@/lib/auth/wizard-cookie";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/for-educators/apply", req.url));
  const { env } = getCloudflareContext();
  const applicationId = await consumeResumeToken(db(env.DB), token);
  if (!applicationId) {
    return NextResponse.redirect(new URL("/for-educators/apply?resume=invalid", req.url));
  }
  const app = await getDraftById(db(env.DB), applicationId);
  if (!app || app.status !== "draft") {
    return NextResponse.redirect(new URL("/for-educators/apply?resume=expired", req.url));
  }
  await setWizardCookie(applicationId);
  const nextStep = Math.min(app.stepCompleted + 1, 4);
  const target = nextStep === 1 ? "/for-educators/apply" : `/for-educators/apply/step-${nextStep}`;
  return NextResponse.redirect(new URL(target, req.url));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(marketing)/for-educators/apply/resume/route.ts
git commit -m "feat(wizard): add resume route — consume token, route to next step"
```

---

## Task 18: E2E tests for all three intake flows

**Files:**
- Create: `tests/e2e/centre-flow.spec.ts`
- Create: `tests/e2e/family-flow.spec.ts`
- Create: `tests/e2e/educator-wizard.spec.ts`
- Create: `tests/fixtures/sample.pdf`
- Modify: `README.md` (E2E setup notes)

The Playwright suite uses Cloudflare Turnstile **test keys** (always-pass mode) to bypass interactive challenges.

- [ ] **Step 1: Add E2E setup notes to README.md**

Append:

```markdown
### Running E2E tests locally

The Playwright suite uses Cloudflare Turnstile's "always passes" test keys to bypass interactive challenges. For E2E runs set `.dev.vars` to:

- `TURNSTILE_SITE_KEY=1x00000000000000000000AA`
- `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`

Use a Resend "test" API key so no real emails are sent.
```

- [ ] **Step 2: Create fixture file**

Run: `mkdir -p tests/fixtures && printf '%%PDF-1.4\n%%%%EOF\n' > tests/fixtures/sample.pdf`

- [ ] **Step 3: Centre flow test**

```ts
import { test, expect } from "@playwright/test";

test("centre booking — happy path", async ({ page }) => {
  await page.goto("/for-centres/request");
  await page.getByLabel(/centre name/i).fill("Sunny Days ELC");
  await page.getByLabel(/your name/i).fill("Jane Smith");
  await page.getByLabel(/email/i).fill("jane@sunny.example");
  await page.getByLabel(/phone/i).fill("0400123456");
  await page.getByLabel(/suburb/i).fill("Parramatta");
  await page.getByLabel(/postcode/i).fill("2150");
  await page.getByLabel(/role needed/i).selectOption("cert3");
  await page.getByLabel(/shift date/i).fill("2026-07-10");
  await page.getByLabel(/shift start/i).fill("07:30");
  await page.getByLabel(/duration/i).fill("8");
  await page.getByLabel(/privacy policy/i).check();
  await page.waitForTimeout(1500); // Turnstile auto-passes with test key
  await page.getByRole("button", { name: /submit request/i }).click();
  await expect(page).toHaveURL(/\/for-centres\/request\/thank-you/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/thanks/i);
});
```

- [ ] **Step 4: Family flow test**

```ts
import { test, expect } from "@playwright/test";

test("family booking — happy path", async ({ page }) => {
  await page.goto("/for-families/request");
  await page.getByLabel(/parent name/i).fill("Sam Lee");
  await page.getByLabel(/email/i).fill("sam@example.com");
  await page.getByLabel(/phone/i).fill("0400123456");
  await page.getByLabel(/suburb/i).fill("Newtown");
  await page.getByLabel(/postcode/i).fill("2042");
  await page.getByLabel(/children count|number of children/i).fill("2");
  await page.getByLabel(/ages/i).fill("3,7");
  await page.getByLabel(/care type/i).selectOption("after_school");
  await page.getByLabel(/shift date/i).fill("2026-07-10");
  await page.getByLabel(/shift start/i).fill("15:00");
  await page.getByLabel(/duration/i).fill("3");
  await page.getByLabel(/privacy policy/i).check();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /submit request/i }).click();
  await expect(page).toHaveURL(/\/for-families\/request\/thank-you/);
});
```

- [ ] **Step 5: Educator wizard test**

```ts
import { test, expect } from "@playwright/test";

test("educator application — full wizard", async ({ page }) => {
  // step 1
  await page.goto("/for-educators/apply");
  await page.getByLabel(/first name/i).fill("Alex");
  await page.getByLabel(/last name/i).fill("Park");
  await page.getByLabel(/email/i).fill(`alex+${Date.now()}@example.com`);
  await page.getByLabel(/phone/i).fill("0400111222");
  await page.getByLabel(/suburb/i).fill("Marrickville");
  await page.getByLabel(/postcode/i).fill("2204");
  await page.getByLabel(/privacy policy/i).check();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /save and continue/i }).click();
  await expect(page).toHaveURL(/\/step-2$/);

  // step 2
  await page.getByLabel(/highest qualification/i).selectOption("diploma");
  await page.getByLabel(/years of experience/i).fill("4");
  await page.getByLabel(/travel radius/i).fill("10");
  await page.getByRole("checkbox", { name: /own transport/i }).check();
  await page.getByRole("button", { name: /save and continue/i }).click();
  await expect(page).toHaveURL(/\/step-3$/);

  // step 3 — upload three mandatory docs
  const fileInputs = page.locator(`input[type="file"]`);
  await fileInputs.nth(0).setInputFiles("tests/fixtures/sample.pdf"); // wwcc
  await expect(page.getByText(/uploaded/i).first()).toBeVisible({ timeout: 15_000 });
  await fileInputs.nth(1).setInputFiles("tests/fixtures/sample.pdf"); // first aid
  await expect(page.getByText(/uploaded/i).nth(1)).toBeVisible({ timeout: 15_000 });
  await fileInputs.nth(2).setInputFiles("tests/fixtures/sample.pdf"); // cert3
  await expect(page.getByText(/uploaded/i).nth(2)).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /continue to review/i }).click();
  await expect(page).toHaveURL(/\/step-4$/);

  // step 4
  await expect(page.getByText(/Alex Park/i)).toBeVisible();
  await page.getByRole("button", { name: /submit application/i }).click();
  await expect(page).toHaveURL(/\/thank-you$/);
});
```

- [ ] **Step 6: Run all e2e**

Run: `pnpm e2e`
Expected: all flows green.

- [ ] **Step 7: Commit**

```bash
git add tests/e2e/centre-flow.spec.ts tests/e2e/family-flow.spec.ts tests/e2e/educator-wizard.spec.ts tests/fixtures README.md
git commit -m "test(e2e): add happy-path tests for centre, family, and educator wizard"
```

---

## Phase 3 Acceptance

After completing this plan:

- [ ] All 18 tasks committed.
- [ ] `pnpm vitest run` passes.
- [ ] `pnpm e2e` passes (Phase 2 page tests + 3 intake flow tests).
- [ ] All three intake flows submit successfully, persist to D1, and trigger 2 emails each (ack + notify).
- [ ] Educator resume link emailed in Step 1 opens the wizard at the correct step.
- [ ] Single-use resume token cannot be reused after consumption.

**Next phase:** `2026-06-02-spec1-phase4-admin-and-deploy.md` — magic-link admin portal (submissions list/detail/status, FAQ editor, media library), cron cleanup, production deployment.
