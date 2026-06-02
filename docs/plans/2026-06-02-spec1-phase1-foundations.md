# Spec 1 — Phase 1: Foundations & Shared Utilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Cloudflare infrastructure (D1, R2, KV), Drizzle ORM schema for all 9 tables, and shared utilities (ULID, IP hashing, Turnstile verification, rate limiting, Resend client, magic-link tokens, R2 signed URLs) that subsequent phases will consume.

**Architecture:** Cloudflare Workers (via OpenNext) + Next.js 16 App Router. D1 is the only persistent store. R2 holds files (private bucket for educator docs, public bucket for marketing media). KV holds short-lived rate-limit counters. Drizzle ORM provides typed queries with versioned SQL migrations.

**Tech Stack:** Next.js 16, React 19, TypeScript, Drizzle ORM with D1 dialect, Zod, Vitest, Resend SDK, `@cloudflare/workers-types`, `nanoid` (for ULID-like IDs).

**Source Spec:** `docs/specs/2026-05-28-spec1-marketing-intake-design.md`

---

## File Structure (created in this phase)

```
src/lib/
  db/
    schema.ts                  Drizzle schema for all 9 tables
    client.ts                  D1 binding accessor
  env.ts                       Zod-validated env vars
  util/
    ulid.ts                    Sortable ID generator (nanoid-based)
    ip-hash.ts                 SHA-256(ip + daily_salt) helper
    turnstile.ts               Server-side Turnstile verification
  rate-limit/
    index.ts                   KV-backed per-IP per-form rate limiter
  email/
    client.ts                  Resend wrapper
  auth/
    tokens.ts                  Magic-link & resume token generation/validation
    session.ts                 Session cookie helpers
  storage/
    r2.ts                      Presigned PUT / GET URL helpers

drizzle/
  drizzle.config.ts            Drizzle Kit config
  migrations/0000_initial.sql  (generated)

tests/unit/
  util/ulid.test.ts
  util/ip-hash.test.ts
  util/turnstile.test.ts
  rate-limit/index.test.ts
  email/client.test.ts
  auth/tokens.test.ts
  auth/session.test.ts
  storage/r2.test.ts

wrangler.jsonc                 (modified — add bindings)
package.json                   (modified — add deps)
.dev.vars.example              (created)
README.md                      (modified — env var docs)
```

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add runtime dependencies**

Run:
```bash
pnpm add drizzle-orm zod resend nanoid
```

- [ ] **Step 2: Add dev dependencies**

Run:
```bash
pnpm add -D drizzle-kit vitest @vitest/coverage-v8 @cloudflare/vitest-pool-workers miniflare
```

- [ ] **Step 3: Verify package.json updated**

Run: `cat package.json | grep -E '(drizzle|zod|resend|nanoid|vitest|miniflare)'`
Expected: All listed packages appear under `dependencies` or `devDependencies`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add Drizzle, Zod, Resend, Vitest deps for Spec 1"
```

---

## Task 2: Provision D1 database

**Files:**
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Create D1 database**

Run:
```bash
npx wrangler d1 create safe-hands-db
```
Expected output: A block of JSON binding configuration including `database_id`.

Copy the `database_id` value — it's needed in the next step.

- [ ] **Step 2: Add binding to wrangler.jsonc**

In `wrangler.jsonc`, add a `d1_databases` array after the `services` array. Replace `<DATABASE_ID>` with the value from Step 1.

```jsonc
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "safe-hands-db",
			"database_id": "<DATABASE_ID>",
			"migrations_dir": "drizzle/migrations"
		}
	],
```

- [ ] **Step 3: Verify wrangler picks up the binding**

Run:
```bash
npx wrangler d1 list
```
Expected: `safe-hands-db` appears in the list.

- [ ] **Step 4: Commit**

```bash
git add wrangler.jsonc
git commit -m "feat(infra): add D1 binding for safe-hands-db"
```

---

## Task 3: Provision R2 buckets

**Files:**
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Create the private educator-docs bucket**

Run:
```bash
npx wrangler r2 bucket create safe-hands-educator-docs
```
Expected: `Created bucket 'safe-hands-educator-docs'`.

- [ ] **Step 2: Create the public media bucket**

Run:
```bash
npx wrangler r2 bucket create safe-hands-public-media
```
Expected: `Created bucket 'safe-hands-public-media'`.

- [ ] **Step 3: Add bindings to wrangler.jsonc**

Add after the `d1_databases` block:

```jsonc
	"r2_buckets": [
		{
			"binding": "EDUCATOR_DOCS",
			"bucket_name": "safe-hands-educator-docs"
		},
		{
			"binding": "PUBLIC_MEDIA",
			"bucket_name": "safe-hands-public-media"
		}
	],
```

- [ ] **Step 4: Commit**

```bash
git add wrangler.jsonc
git commit -m "feat(infra): add R2 bindings for educator-docs (private) and public-media"
```

---

## Task 4: Provision KV namespace for rate limiting

**Files:**
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Create the KV namespace**

Run:
```bash
npx wrangler kv namespace create RATE_LIMITS
```
Expected: A JSON snippet with `id` and `binding`.

- [ ] **Step 2: Add binding to wrangler.jsonc**

Add after the `r2_buckets` block, replacing `<KV_ID>` with the id from Step 1:

```jsonc
	"kv_namespaces": [
		{
			"binding": "RATE_LIMITS",
			"id": "<KV_ID>"
		}
	],
```

- [ ] **Step 3: Verify**

Run: `npx wrangler kv namespace list`
Expected: `RATE_LIMITS` appears.

- [ ] **Step 4: Commit**

```bash
git add wrangler.jsonc
git commit -m "feat(infra): add KV namespace for rate-limit counters"
```

---

## Task 5: Regenerate Cloudflare env types

**Files:**
- Modify: `cloudflare-env.d.ts`

- [ ] **Step 1: Run typegen**

Run:
```bash
pnpm cf-typegen
```
Expected: `cloudflare-env.d.ts` updated; types now include `DB`, `EDUCATOR_DOCS`, `PUBLIC_MEDIA`, `RATE_LIMITS`.

- [ ] **Step 2: Verify**

Run: `grep -E '(DB|EDUCATOR_DOCS|PUBLIC_MEDIA|RATE_LIMITS)' cloudflare-env.d.ts | head -20`
Expected: All four binding names appear as typed properties.

- [ ] **Step 3: Commit**

```bash
git add cloudflare-env.d.ts
git commit -m "chore: regenerate Cloudflare env types after binding additions"
```

---

## Task 6: Create .dev.vars.example and env validator

**Files:**
- Create: `.dev.vars.example`
- Create: `src/lib/env.ts`
- Test: `tests/unit/env.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/env.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { envSchema } from "@/lib/env";

describe("envSchema", () => {
  const validEnv = {
    ADMIN_EMAIL: "founder@safehandsstaffing.com.au",
    RESEND_API_KEY: "re_test_123",
    RESEND_FROM_ADDRESS: "no-reply@mail.safehandsstaffing.com.au",
    TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    SESSION_COOKIE_DOMAIN: "safehandsstaffing.com.au",
    IP_HASH_SALT_ROTATION: "base-salt-value-32-chars-or-more!",
    PUBLIC_SITE_URL: "https://safehandsstaffing.com.au",
  };

  it("accepts a complete env block", () => {
    expect(() => envSchema.parse(validEnv)).not.toThrow();
  });

  it("rejects missing ADMIN_EMAIL", () => {
    const { ADMIN_EMAIL, ...rest } = validEnv;
    expect(() => envSchema.parse(rest)).toThrow();
  });

  it("rejects malformed PUBLIC_SITE_URL", () => {
    expect(() => envSchema.parse({ ...validEnv, PUBLIC_SITE_URL: "not-a-url" })).toThrow();
  });

  it("allows empty APP_LOGIN_URL (optional)", () => {
    expect(() => envSchema.parse(validEnv)).not.toThrow();
  });

  it("rejects IP_HASH_SALT_ROTATION shorter than 32 chars", () => {
    expect(() => envSchema.parse({ ...validEnv, IP_HASH_SALT_ROTATION: "short" })).toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/env.test.ts`
Expected: FAIL — `Cannot find module '@/lib/env'`.

- [ ] **Step 3: Implement env.ts**

Create `src/lib/env.ts`:

```ts
import { z } from "zod";

export const envSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_ADDRESS: z.string().email(),
  TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  APP_LOGIN_URL: z.string().url().optional().or(z.literal("")),
  SESSION_COOKIE_DOMAIN: z.string().min(1),
  IP_HASH_SALT_ROTATION: z.string().min(32),
  PUBLIC_SITE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export function readEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source);
}
```

- [ ] **Step 4: Configure path alias if not present**

Check `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`. If absent, add to `compilerOptions`.

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts` at the repo root:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Run the test, expect PASS**

Run: `pnpm vitest run tests/unit/env.test.ts`
Expected: 5 passing.

- [ ] **Step 7: Create .dev.vars.example**

```bash
cat > .dev.vars.example <<'EOF'
ADMIN_EMAIL=
RESEND_API_KEY=
RESEND_FROM_ADDRESS=no-reply@mail.safehandsstaffing.com.au
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
APP_LOGIN_URL=
SESSION_COOKIE_DOMAIN=safehandsstaffing.com.au
IP_HASH_SALT_ROTATION=
PUBLIC_SITE_URL=http://localhost:3000
EOF
```

- [ ] **Step 8: Commit**

```bash
git add tests/unit/env.test.ts src/lib/env.ts vitest.config.ts tsconfig.json .dev.vars.example
git commit -m "feat(env): add Zod-validated env schema and dev.vars.example"
```

---

## Task 7: ULID generator utility

**Files:**
- Create: `src/lib/util/ulid.ts`
- Test: `tests/unit/util/ulid.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/util/ulid.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { newId } from "@/lib/util/ulid";

describe("newId", () => {
  it("returns a 26-char string", () => {
    const id = newId();
    expect(id).toMatch(/^[0-9A-Za-z_-]{26}$/);
  });

  it("generates unique IDs across 1000 calls", () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) ids.add(newId());
    expect(ids.size).toBe(1000);
  });

  it("returns lexicographically-sortable IDs across time", async () => {
    const a = newId();
    await new Promise((r) => setTimeout(r, 5));
    const b = newId();
    expect(a < b).toBe(true);
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `pnpm vitest run tests/unit/util/ulid.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/util/ulid.ts`:

```ts
import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghijkmnpqrstvwxyz_-";
const RANDOM_LEN = 16;
const TIME_LEN = 10;
const randomPart = customAlphabet(ALPHABET, RANDOM_LEN);

export function newId(): string {
  const ts = Date.now().toString(36).padStart(TIME_LEN, "0");
  return ts + randomPart();
}
```

- [ ] **Step 4: Verify test passes**

Run: `pnpm vitest run tests/unit/util/ulid.test.ts`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/util/ulid.test.ts src/lib/util/ulid.ts
git commit -m "feat(util): add sortable ULID-style ID generator"
```

---

## Task 8: IP hash utility with daily salt rotation

**Files:**
- Create: `src/lib/util/ip-hash.ts`
- Test: `tests/unit/util/ip-hash.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { hashIp, dailySalt } from "@/lib/util/ip-hash";

describe("hashIp", () => {
  const base = "base-salt-of-at-least-32-chars!!";

  it("produces a hex digest", async () => {
    const h = await hashIp("203.0.113.1", new Date("2026-06-02T12:00:00Z"), base);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for same ip+date+base", async () => {
    const d = new Date("2026-06-02T08:00:00Z");
    const a = await hashIp("203.0.113.1", d, base);
    const b = await hashIp("203.0.113.1", d, base);
    expect(a).toBe(b);
  });

  it("differs across days", async () => {
    const a = await hashIp("203.0.113.1", new Date("2026-06-02T00:00:00Z"), base);
    const b = await hashIp("203.0.113.1", new Date("2026-06-03T00:00:00Z"), base);
    expect(a).not.toBe(b);
  });

  it("differs across IPs", async () => {
    const d = new Date("2026-06-02T00:00:00Z");
    expect(await hashIp("203.0.113.1", d, base)).not.toBe(await hashIp("203.0.113.2", d, base));
  });
});

describe("dailySalt", () => {
  it("rotates by UTC day boundary", async () => {
    const base = "test-base-salt";
    const a = await dailySalt(new Date("2026-06-02T23:59:00Z"), base);
    const b = await dailySalt(new Date("2026-06-03T00:00:00Z"), base);
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/util/ip-hash.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/util/ip-hash.ts`:

```ts
const enc = new TextEncoder();

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function dailySalt(date: Date, base: string): Promise<string> {
  const day = date.toISOString().slice(0, 10);
  return sha256Hex(`${base}|${day}`);
}

export async function hashIp(ip: string, date: Date, base: string): Promise<string> {
  const salt = await dailySalt(date, base);
  return sha256Hex(`${salt}|${ip}`);
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/util/ip-hash.test.ts`
Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/util/ip-hash.test.ts src/lib/util/ip-hash.ts
git commit -m "feat(util): add SHA-256 IP hash with daily-rotated salt"
```

---

## Task 9: Drizzle schema — all 9 tables

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `drizzle.config.ts`
- Test: `tests/unit/db/schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import * as schema from "@/lib/db/schema";

describe("schema exports", () => {
  it("exports all 9 expected tables", () => {
    const tables = [
      "centreRequests",
      "familyRequests",
      "educatorApplications",
      "educatorResumeTokens",
      "educatorDocuments",
      "adminMagicLinks",
      "adminSessions",
      "faqEntries",
      "media",
    ];
    for (const t of tables) {
      expect(schema).toHaveProperty(t);
    }
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/db/schema.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement schema.ts**

Create `src/lib/db/schema.ts`:

```ts
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// ---------- enums (string unions enforced in Zod + CHECK constraints) ----------

export const SUBMISSION_STATUS = ["new", "contacted", "qualified", "archived"] as const;
export const EDUCATOR_STATUS = [
  "draft",
  "submitted",
  "shortlisted",
  "interviewed",
  "rejected",
  "archived",
] as const;
export const CENTRE_ROLE = ["cert3", "diploma", "ect", "room_leader", "oshc"] as const;
export const FAMILY_CARE_TYPE = ["after_school", "holiday", "ad_hoc", "overnight"] as const;
export const EDUCATOR_QUALIFICATION = ["cert3", "diploma", "ect", "adv_dip", "other"] as const;
export const EDUCATOR_DOC_TYPE = [
  "wwcc",
  "first_aid_hltaid012",
  "cert3_diploma",
  "id_document",
  "reference_letter",
  "other",
] as const;
export const FAQ_AUDIENCE = ["centre", "family", "educator", "general"] as const;

// ---------- centre requests ----------

export const centreRequests = sqliteTable(
  "centre_requests",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: SUBMISSION_STATUS }).notNull().default("new"),
    centreName: text("centre_name").notNull(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    suburb: text("suburb").notNull(),
    postcode: text("postcode").notNull(),
    roleNeeded: text("role_needed", { enum: CENTRE_ROLE }).notNull(),
    shiftDate: text("shift_date").notNull(),
    shiftStart: text("shift_start").notNull(),
    shiftDurationHrs: real("shift_duration_hrs").notNull(),
    specialNeedsFlag: integer("special_needs_flag", { mode: "boolean" }).notNull().default(false),
    notes: text("notes"),
    source: text("source"),
    ipHash: text("ip_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byStatus: index("centre_requests_status_created").on(t.status, t.createdAt),
    byEmail: index("centre_requests_email").on(t.contactEmail),
  }),
);

// ---------- family requests ----------

export const familyRequests = sqliteTable(
  "family_requests",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: SUBMISSION_STATUS }).notNull().default("new"),
    parentName: text("parent_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    suburb: text("suburb").notNull(),
    postcode: text("postcode").notNull(),
    childrenCount: integer("children_count").notNull(),
    childrenAges: text("children_ages").notNull(),
    careType: text("care_type", { enum: FAMILY_CARE_TYPE }).notNull(),
    shiftDate: text("shift_date").notNull(),
    shiftStart: text("shift_start").notNull(),
    shiftDurationHrs: real("shift_duration_hrs").notNull(),
    specialNeedsFlag: integer("special_needs_flag", { mode: "boolean" }).notNull().default(false),
    specialNeedsNotes: text("special_needs_notes"),
    notes: text("notes"),
    source: text("source"),
    ipHash: text("ip_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byStatus: index("family_requests_status_created").on(t.status, t.createdAt),
    byEmail: index("family_requests_email").on(t.contactEmail),
  }),
);

// ---------- educator applications ----------

export const educatorApplications = sqliteTable(
  "educator_applications",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: EDUCATOR_STATUS }).notNull().default("draft"),
    stepCompleted: integer("step_completed").notNull().default(0),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    suburb: text("suburb").notNull(),
    postcode: text("postcode").notNull(),
    privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull(),
    privacyConsentAt: integer("privacy_consent_at"),
    qualificationLevel: text("qualification_level", { enum: EDUCATOR_QUALIFICATION }),
    qualificationOther: text("qualification_other"),
    yearsExperience: integer("years_experience"),
    specialNeedsExperience: integer("special_needs_experience", { mode: "boolean" }),
    specialNeedsNotes: text("special_needs_notes"),
    availability: text("availability"), // JSON string
    travelRadiusKm: integer("travel_radius_km"),
    hasOwnTransport: integer("has_own_transport", { mode: "boolean" }),
    submittedAt: integer("submitted_at"),
    source: text("source"),
    ipHash: text("ip_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byStatus: index("educator_apps_status_created").on(t.status, t.createdAt),
    byEmail: index("educator_apps_email").on(t.email),
  }),
);

// ---------- educator resume tokens ----------

export const educatorResumeTokens = sqliteTable(
  "educator_resume_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => educatorApplications.id),
    expiresAt: integer("expires_at").notNull(),
    usedAt: integer("used_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    byApp: index("resume_tokens_app").on(t.applicationId),
    byExpiry: index("resume_tokens_expiry").on(t.expiresAt),
  }),
);

// ---------- educator documents ----------

export const educatorDocuments = sqliteTable(
  "educator_documents",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => educatorApplications.id),
    docType: text("doc_type", { enum: EDUCATOR_DOC_TYPE }).notNull(),
    r2Key: text("r2_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    uploadedAt: integer("uploaded_at").notNull(),
  },
  (t) => ({
    byApp: index("documents_app").on(t.applicationId),
  }),
);

// ---------- admin magic links ----------

export const adminMagicLinks = sqliteTable(
  "admin_magic_links",
  {
    tokenHash: text("token_hash").primaryKey(),
    email: text("email").notNull(),
    expiresAt: integer("expires_at").notNull(),
    usedAt: integer("used_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    byExpiry: index("magic_links_expiry").on(t.expiresAt),
  }),
);

// ---------- admin sessions ----------

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    sessionIdHash: text("session_id_hash").primaryKey(),
    email: text("email").notNull(),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
  },
  (t) => ({
    byExpiry: index("sessions_expiry").on(t.expiresAt),
  }),
);

// ---------- faq entries ----------

export const faqEntries = sqliteTable(
  "faq_entries",
  {
    id: text("id").primaryKey(),
    audience: text("audience", { enum: FAQ_AUDIENCE }).notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byAudience: index("faq_audience_sort").on(t.audience, t.sortOrder),
  }),
);

// ---------- media ----------

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  r2Key: text("r2_key").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  altText: text("alt_text"),
  width: integer("width"),
  height: integer("height"),
  createdAt: integer("created_at").notNull(),
});

// ---------- inferred row types ----------

export type CentreRequest = typeof centreRequests.$inferSelect;
export type NewCentreRequest = typeof centreRequests.$inferInsert;
export type FamilyRequest = typeof familyRequests.$inferSelect;
export type NewFamilyRequest = typeof familyRequests.$inferInsert;
export type EducatorApplication = typeof educatorApplications.$inferSelect;
export type NewEducatorApplication = typeof educatorApplications.$inferInsert;
export type EducatorDocument = typeof educatorDocuments.$inferSelect;
export type FaqEntry = typeof faqEntries.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
```

- [ ] **Step 4: Create drizzle.config.ts**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
});
```

- [ ] **Step 5: Run schema test**

Run: `pnpm vitest run tests/unit/db/schema.test.ts`
Expected: 1 passing.

- [ ] **Step 6: Commit**

```bash
git add tests/unit/db/schema.test.ts src/lib/db/schema.ts drizzle.config.ts
git commit -m "feat(db): add Drizzle schema for 9 tables + drizzle-kit config"
```

---

## Task 10: Generate initial migration & apply locally

**Files:**
- Create: `drizzle/migrations/0000_initial.sql` (generated)

- [ ] **Step 1: Generate the migration**

Run:
```bash
pnpm drizzle-kit generate
```
Expected: A new file `drizzle/migrations/0000_<name>.sql` containing `CREATE TABLE` statements for all 9 tables.

- [ ] **Step 2: Inspect the migration**

Run: `head -50 drizzle/migrations/0000_*.sql`
Expected: SQL contains `CREATE TABLE centre_requests`, `CREATE TABLE family_requests`, etc.

- [ ] **Step 3: Apply to local D1**

Run:
```bash
npx wrangler d1 migrations apply safe-hands-db --local
```
Expected: Migration applied locally to the wrangler-managed SQLite file.

- [ ] **Step 4: Verify schema**

Run:
```bash
npx wrangler d1 execute safe-hands-db --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```
Expected: A table listing including `admin_magic_links`, `admin_sessions`, `centre_requests`, `educator_applications`, `educator_documents`, `educator_resume_tokens`, `family_requests`, `faq_entries`, `media`.

- [ ] **Step 5: Commit**

```bash
git add drizzle/migrations/
git commit -m "feat(db): generate initial migration for all 9 tables"
```

---

## Task 11: D1 client accessor

**Files:**
- Create: `src/lib/db/client.ts`

- [ ] **Step 1: Implement**

```ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function db(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Db = ReturnType<typeof db>;
```

- [ ] **Step 2: Smoke-typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/client.ts
git commit -m "feat(db): add D1 client factory"
```

---

## Task 12: Turnstile verification helper

**Files:**
- Create: `src/lib/util/turnstile.ts`
- Test: `tests/unit/util/turnstile.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyTurnstile } from "@/lib/util/turnstile";

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when API responds success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }),
    );
    const ok = await verifyTurnstile({ token: "tok", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(true);
  });

  it("returns false when API responds failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
      }),
    );
    const ok = await verifyTurnstile({ token: "tok", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(false);
  });

  it("returns false on network error (fails closed)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const ok = await verifyTurnstile({ token: "tok", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(false);
  });

  it("returns false when token is missing", async () => {
    const ok = await verifyTurnstile({ token: "", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(false);
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/util/turnstile.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(input: {
  token: string;
  remoteIp: string;
  secret: string;
}): Promise<boolean> {
  if (!input.token) return false;
  try {
    const body = new FormData();
    body.append("secret", input.secret);
    body.append("response", input.token);
    body.append("remoteip", input.remoteIp);
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/util/turnstile.test.ts`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/util/turnstile.test.ts src/lib/util/turnstile.ts
git commit -m "feat(util): add Turnstile server-side verification (fails closed)"
```

---

## Task 13: Rate limiter (KV-backed)

**Files:**
- Create: `src/lib/rate-limit/index.ts`
- Test: `tests/unit/rate-limit/index.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

function fakeKv(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    put: vi.fn(async (k: string, v: string, _opts?: unknown) => {
      store.set(k, v);
    }),
    delete: vi.fn(async (k: string) => {
      store.delete(k);
    }),
  } as unknown as KVNamespace;
}

describe("checkRateLimit", () => {
  it("allows the first N requests within the window", async () => {
    const kv = fakeKv();
    for (let i = 0; i < 10; i++) {
      const r = await checkRateLimit(kv, "centre:hash123", 10, 86400);
      expect(r.allowed).toBe(true);
    }
  });

  it("blocks the (N+1)th request", async () => {
    const kv = fakeKv({ "rl:centre:hash123": "10" });
    const r = await checkRateLimit(kv, "centre:hash123", 10, 86400);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("uses the supplied namespace prefix", async () => {
    const kv = fakeKv();
    await checkRateLimit(kv, "family:hashX", 5, 60);
    expect(kv.put).toHaveBeenCalledWith(
      "rl:family:hashX",
      expect.any(String),
      expect.objectContaining({ expirationTtl: 60 }),
    );
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/rate-limit/index.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/rate-limit/index.ts`:

```ts
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  count: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  bucketKey: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `rl:${bucketKey}`;
  const current = Number((await kv.get(key)) ?? "0");
  if (current >= limit) {
    return { allowed: false, remaining: 0, count: current };
  }
  const next = current + 1;
  await kv.put(key, String(next), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - next, count: next };
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/rate-limit/index.test.ts`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/rate-limit/index.test.ts src/lib/rate-limit/index.ts
git commit -m "feat(rate-limit): add KV-backed per-bucket rate limiter"
```

---

## Task 14: Resend email client wrapper

**Files:**
- Create: `src/lib/email/client.ts`
- Test: `tests/unit/email/client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { sendEmail } from "@/lib/email/client";

describe("sendEmail", () => {
  it("calls Resend with the expected payload", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "msg_1" }, error: null });
    const fakeClient = { emails: { send } } as unknown as Parameters<typeof sendEmail>[0]["client"];
    await sendEmail({
      client: fakeClient,
      from: "no-reply@example.com",
      to: "user@example.com",
      subject: "Hi",
      html: "<p>Hi</p>",
      text: "Hi",
    });
    expect(send).toHaveBeenCalledWith({
      from: "no-reply@example.com",
      to: "user@example.com",
      subject: "Hi",
      html: "<p>Hi</p>",
      text: "Hi",
    });
  });

  it("throws when Resend returns an error", async () => {
    const send = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const fakeClient = { emails: { send } } as unknown as Parameters<typeof sendEmail>[0]["client"];
    await expect(
      sendEmail({
        client: fakeClient,
        from: "no-reply@example.com",
        to: "user@example.com",
        subject: "Hi",
        html: "<p>Hi</p>",
        text: "Hi",
      }),
    ).rejects.toThrow(/boom/);
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/email/client.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
import { Resend } from "resend";

export interface SendEmailInput {
  client: Resend;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const { client, from, to, subject, html, text } = input;
  const { data, error } = await client.emails.send({ from, to, subject, html, text });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
  return { id: data!.id };
}

export function makeResend(apiKey: string): Resend {
  return new Resend(apiKey);
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/email/client.test.ts`
Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/email/client.test.ts src/lib/email/client.ts
git commit -m "feat(email): add Resend client wrapper with strict error handling"
```

---

## Task 15: Magic-link & resume token generation/validation

**Files:**
- Create: `src/lib/auth/tokens.ts`
- Test: `tests/unit/auth/tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { generateToken, hashToken, constantTimeEqual } from "@/lib/auth/tokens";

describe("generateToken", () => {
  it("returns a URL-safe base64 string of expected length", () => {
    const t = generateToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(t.length).toBeGreaterThanOrEqual(40); // 32 bytes -> 43 chars base64url
  });

  it("returns unique tokens across 100 calls", () => {
    const set = new Set();
    for (let i = 0; i < 100; i++) set.add(generateToken());
    expect(set.size).toBe(100);
  });
});

describe("hashToken", () => {
  it("returns a deterministic SHA-256 hex digest", async () => {
    const a = await hashToken("hello");
    const b = await hashToken("hello");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different digests for different inputs", async () => {
    expect(await hashToken("a")).not.toBe(await hashToken("b"));
  });
});

describe("constantTimeEqual", () => {
  it("returns true for equal strings", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
  });
  it("returns false for unequal strings", () => {
    expect(constantTimeEqual("abc", "abd")).toBe(false);
  });
  it("returns false for different lengths", () => {
    expect(constantTimeEqual("abc", "abcd")).toBe(false);
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/auth/tokens.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
const enc = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function hashToken(plaintext: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(plaintext));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/auth/tokens.test.ts`
Expected: 7 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/auth/tokens.test.ts src/lib/auth/tokens.ts
git commit -m "feat(auth): add token generation, SHA-256 hashing, constant-time compare"
```

---

## Task 16: Session helpers (cookie parsing + DB lookup)

**Files:**
- Create: `src/lib/auth/session.ts`
- Test: `tests/unit/auth/session.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { SESSION_COOKIE_NAME, buildSessionCookie, parseSessionCookie } from "@/lib/auth/session";

describe("buildSessionCookie", () => {
  it("returns a Set-Cookie value with HttpOnly, Secure, SameSite=Lax", () => {
    const v = buildSessionCookie({
      token: "abc",
      domain: "safehandsstaffing.com.au",
      maxAgeSeconds: 60,
    });
    expect(v).toContain(`${SESSION_COOKIE_NAME}=abc`);
    expect(v).toContain("HttpOnly");
    expect(v).toContain("Secure");
    expect(v).toContain("SameSite=Lax");
    expect(v).toContain("Domain=safehandsstaffing.com.au");
    expect(v).toContain("Max-Age=60");
    expect(v).toContain("Path=/");
  });

  it("clears the cookie when token is empty", () => {
    const v = buildSessionCookie({ token: "", domain: "example.com", maxAgeSeconds: 0 });
    expect(v).toContain("Max-Age=0");
  });
});

describe("parseSessionCookie", () => {
  it("extracts the session token from a Cookie header", () => {
    const h = `other=foo; ${SESSION_COOKIE_NAME}=tok_value; bar=baz`;
    expect(parseSessionCookie(h)).toBe("tok_value");
  });
  it("returns null when no session cookie present", () => {
    expect(parseSessionCookie("other=foo")).toBeNull();
  });
  it("returns null for empty header", () => {
    expect(parseSessionCookie("")).toBeNull();
    expect(parseSessionCookie(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/auth/session.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
export const SESSION_COOKIE_NAME = "sh_admin_session";

export interface BuildSessionCookieInput {
  token: string;
  domain: string;
  maxAgeSeconds: number;
}

export function buildSessionCookie(input: BuildSessionCookieInput): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${input.token}`,
    `Path=/`,
    `Domain=${input.domain}`,
    `Max-Age=${input.maxAgeSeconds}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ];
  return parts.join("; ");
}

export function parseSessionCookie(header: string | null | undefined): string | null {
  if (!header) return null;
  const parts = header.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return part.slice(SESSION_COOKIE_NAME.length + 1);
    }
  }
  return null;
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/auth/session.test.ts`
Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/auth/session.test.ts src/lib/auth/session.ts
git commit -m "feat(auth): add session cookie builder + parser"
```

---

## Task 17: R2 signed URL helpers

**Files:**
- Create: `src/lib/storage/r2.ts`
- Test: `tests/unit/storage/r2.test.ts`

R2 has two paths for signed URLs:
- The Worker R2 binding exposes `bucket.put` / `bucket.get` directly — for server-side reads/writes we use the binding.
- For browser direct uploads/downloads, we need **presigned URLs via the S3-compatible API**. We implement these with a minimal AWS SigV4 signer (Cloudflare exposes R2 S3 endpoints; credentials come from env vars `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`).

For Phase 1 we add the three env vars + a test that proves the helper assembles a valid signed URL shape. The actual signing logic uses the `aws4fetch` library (small, edge-friendly).

- [ ] **Step 1: Add env vars**

Append to `.dev.vars.example`:

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

Extend `src/lib/env.ts` schema:

```ts
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
```

Add matching entries to `tests/unit/env.test.ts` `validEnv`. Re-run `pnpm vitest run tests/unit/env.test.ts` and confirm green.

- [ ] **Step 2: Install aws4fetch**

```bash
pnpm add aws4fetch
```

- [ ] **Step 3: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { presignPutUrl, presignGetUrl } from "@/lib/storage/r2";

describe("presignPutUrl", () => {
  it("returns a URL string pointing at the bucket+key", async () => {
    const url = await presignPutUrl({
      accountId: "acct123",
      accessKeyId: "k",
      secretAccessKey: "s",
      bucket: "safe-hands-educator-docs",
      key: "educator-docs/app_1/wwcc-x.pdf",
      contentType: "application/pdf",
      expiresInSeconds: 300,
    });
    expect(url).toContain("safe-hands-educator-docs");
    expect(url).toContain("educator-docs/app_1/wwcc-x.pdf");
    expect(url).toMatch(/X-Amz-(Signature|Expires|Credential)/);
  });

  it("rejects expires > 7 days", async () => {
    await expect(
      presignPutUrl({
        accountId: "a",
        accessKeyId: "k",
        secretAccessKey: "s",
        bucket: "b",
        key: "k",
        contentType: "application/pdf",
        expiresInSeconds: 8 * 86400,
      }),
    ).rejects.toThrow();
  });
});

describe("presignGetUrl", () => {
  it("returns a signed GET URL", async () => {
    const url = await presignGetUrl({
      accountId: "acct123",
      accessKeyId: "k",
      secretAccessKey: "s",
      bucket: "safe-hands-educator-docs",
      key: "educator-docs/app_1/wwcc-x.pdf",
      expiresInSeconds: 3600,
    });
    expect(url).toContain("safe-hands-educator-docs");
    expect(url).toMatch(/X-Amz-Signature/);
  });
});
```

- [ ] **Step 4: Verify FAIL**

Run: `pnpm vitest run tests/unit/storage/r2.test.ts`
Expected: FAIL.

- [ ] **Step 5: Implement**

```ts
import { AwsClient } from "aws4fetch";

const MAX_EXPIRES = 7 * 86400;

function r2Endpoint(accountId: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

function client(input: { accessKeyId: string; secretAccessKey: string }) {
  return new AwsClient({
    accessKeyId: input.accessKeyId,
    secretAccessKey: input.secretAccessKey,
    service: "s3",
    region: "auto",
  });
}

export interface PresignPutInput {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  contentType: string;
  expiresInSeconds: number;
}

export async function presignPutUrl(input: PresignPutInput): Promise<string> {
  if (input.expiresInSeconds > MAX_EXPIRES) {
    throw new Error("expiresInSeconds exceeds R2 maximum of 7 days");
  }
  const url = `${r2Endpoint(input.accountId)}/${input.bucket}/${input.key}?X-Amz-Expires=${input.expiresInSeconds}`;
  const req = await client(input).sign(
    new Request(url, {
      method: "PUT",
      headers: { "Content-Type": input.contentType },
    }),
    { aws: { signQuery: true } },
  );
  return req.url;
}

export interface PresignGetInput {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  expiresInSeconds: number;
}

export async function presignGetUrl(input: PresignGetInput): Promise<string> {
  if (input.expiresInSeconds > MAX_EXPIRES) {
    throw new Error("expiresInSeconds exceeds R2 maximum of 7 days");
  }
  const url = `${r2Endpoint(input.accountId)}/${input.bucket}/${input.key}?X-Amz-Expires=${input.expiresInSeconds}`;
  const req = await client(input).sign(new Request(url, { method: "GET" }), {
    aws: { signQuery: true },
  });
  return req.url;
}
```

- [ ] **Step 6: Run, expect PASS**

Run: `pnpm vitest run tests/unit/storage/r2.test.ts`
Expected: 3 passing.

- [ ] **Step 7: Commit**

```bash
git add tests/unit/storage/r2.test.ts src/lib/storage/r2.ts src/lib/env.ts tests/unit/env.test.ts .dev.vars.example package.json pnpm-lock.yaml
git commit -m "feat(storage): add R2 presigned PUT/GET URL helpers via aws4fetch"
```

---

## Task 18: Update README with env-var documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read existing README**

Run: `cat README.md`

- [ ] **Step 2: Append env section**

Append to `README.md`:

```markdown
## Environment Variables

All env vars are validated via `src/lib/env.ts`. Copy `.dev.vars.example` to `.dev.vars` for local development.

| Var | Required | Purpose |
|:---|:---|:---|
| `ADMIN_EMAIL` | yes | Only email allowed to log in to `/admin` |
| `RESEND_API_KEY` | yes | Resend API key (transactional email) |
| `RESEND_FROM_ADDRESS` | yes | Verified Resend sender (e.g. `no-reply@mail.safehandsstaffing.com.au`) |
| `TURNSTILE_SITE_KEY` | yes | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | yes | Cloudflare Turnstile secret key |
| `APP_LOGIN_URL` | no | If set, the marketing nav shows a LOG IN button pointing here |
| `SESSION_COOKIE_DOMAIN` | yes | Cookie `Domain=` attribute for `sh_admin_session` |
| `IP_HASH_SALT_ROTATION` | yes | Base salt (≥32 chars) — daily-rotated for IP hashing |
| `PUBLIC_SITE_URL` | yes | Public base URL used in transactional emails |
| `R2_ACCOUNT_ID` | yes | Cloudflare account ID for R2 S3 endpoint |
| `R2_ACCESS_KEY_ID` | yes | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | yes | R2 API token secret |

## Cloudflare Bindings

Defined in `wrangler.jsonc`. Names match what the application code expects.

| Binding | Type | Purpose |
|:---|:---|:---|
| `DB` | D1 | Primary application database |
| `EDUCATOR_DOCS` | R2 | Private bucket for educator document uploads |
| `PUBLIC_MEDIA` | R2 | Public bucket for marketing media |
| `RATE_LIMITS` | KV | Per-IP per-form rate-limit counters |
| `IMAGES` | Images | Cloudflare Image optimisation |

## Database Migrations

```bash
pnpm drizzle-kit generate              # generate SQL from src/lib/db/schema.ts
npx wrangler d1 migrations apply safe-hands-db --local    # apply to local D1
npx wrangler d1 migrations apply safe-hands-db --remote   # apply to production D1
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document Spec 1 env vars, bindings, migration commands"
```

---

## Phase 1 Acceptance

After completing this plan:

- [ ] All 18 tasks committed.
- [ ] `pnpm vitest run` passes (all unit tests).
- [ ] `pnpm tsc --noEmit` passes.
- [ ] `pnpm lint` passes.
- [ ] `npx wrangler d1 execute safe-hands-db --local --command "SELECT count(*) FROM sqlite_master WHERE type='table';"` returns 9.
- [ ] No code from `src/app/**` was modified (Phase 1 is library-only).

**Next phase:** `2026-06-02-spec1-phase2-marketing-pages.md` (to be written) — public marketing pages, Header/Footer, Cookie banner, FAQ.
