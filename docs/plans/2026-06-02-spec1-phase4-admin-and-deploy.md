# Spec 1 — Phase 4: Admin Portal, Cron, and Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the magic-link-gated `/admin` portal (dashboard, submissions browser, status transitions, FAQ editor, media library, logout), add the nightly cron job that purges expired tokens and old submissions, ship the final accessibility and performance polish, and deploy to production Cloudflare.

**Architecture:** A single auth middleware protects `/admin/**`. Magic-link tokens (15-min TTL, single-use) generate sessions stored in D1 with cookie identifiers. All admin pages are React Server Components reading directly from D1; mutations use Server Actions or small API routes. Files are uploaded directly to R2 via presigned PUT URLs. A scheduled Cloudflare Worker cron triggers nightly cleanup at 02:00 AEST (16:00 UTC).

**Tech Stack:** Next.js 16 middleware + Server Actions, Drizzle, Resend, Cloudflare Workers cron triggers, OpenNext for build.

**Source Spec:** `docs/specs/2026-05-28-spec1-marketing-intake-design.md` (§7, §10, §12)
**Depends on:** Phases 1, 2, 3 plans completed.

---

## File Structure (created in this phase)

```
src/middleware.ts                      Gates /admin/** against admin session

src/lib/auth/admin.ts                  send magic link, verify token, issue/validate session
src/lib/db/queries/admin.ts            magic-link CRUD, session CRUD
src/lib/db/queries/submissions.ts      unified list/search across the 3 submission tables
src/lib/db/queries/faq.ts              admin CRUD on faq_entries
src/lib/db/queries/media.ts            list/add/delete media rows
src/lib/email/templates/AdminMagicLink.tsx

src/app/admin/
  login/page.tsx
  login/actions.ts
  login/verify/route.ts
  layout.tsx                           reads session, renders nav, redirects to /admin/login if absent
  page.tsx                             dashboard (counts)
  submissions/page.tsx                 unified list (centre/family/educator) + filters
  submissions/[type]/[id]/page.tsx     detail + status transition action
  submissions/[type]/[id]/actions.ts
  faq/page.tsx                         list + editor
  faq/actions.ts
  media/page.tsx                       list + upload + delete
  media/actions.ts
  logout/route.ts

src/app/api/uploads/media/route.ts     Presigned PUT URL for public media uploads
src/app/api/cron/cleanup/route.ts      Scheduled cleanup endpoint

src/components/admin/
  AdminNav.tsx
  SubmissionsTable.tsx
  SubmissionFilters.tsx
  StatusBadge.tsx
  StatusTransition.tsx
  FaqEditor.tsx
  MediaLibrary.tsx
  MediaUploader.tsx

tests/unit/auth/admin.test.ts
tests/unit/db/queries/admin.test.ts
tests/unit/db/queries/submissions.test.ts
tests/unit/db/queries/faq.test.ts
tests/e2e/admin-flow.spec.ts
tests/e2e/accessibility-admin.spec.ts
tests/e2e/cron-cleanup.spec.ts

wrangler.jsonc                         (modified — cron trigger)
README.md                              (deployment section)
```

---

## Task 1: Admin auth queries (magic links + sessions)

**Files:**
- Create: `src/lib/db/queries/admin.ts`
- Test: `tests/unit/db/queries/admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import {
  insertMagicLink,
  consumeMagicLink,
  insertAdminSession,
  getValidSession,
  deleteSession,
  pruneExpired,
} from "@/lib/db/queries/admin";

describe("admin queries", () => {
  it("magic-link lifecycle", async () => {
    const db = makeTestDb();
    await insertMagicLink(db as any, "hash1", "founder@example.com", Date.now() + 15 * 60_000);
    const email = await consumeMagicLink(db as any, "hash1");
    expect(email).toBe("founder@example.com");
    expect(await consumeMagicLink(db as any, "hash1")).toBeNull(); // single-use
  });

  it("session lifecycle", async () => {
    const db = makeTestDb();
    const future = Date.now() + 30 * 86400 * 1000;
    await insertAdminSession(db as any, "shash1", "founder@example.com", future);
    const sess = await getValidSession(db as any, "shash1");
    expect(sess?.email).toBe("founder@example.com");
    await deleteSession(db as any, "shash1");
    expect(await getValidSession(db as any, "shash1")).toBeUndefined();
  });

  it("pruneExpired removes only expired rows", async () => {
    const db = makeTestDb();
    await insertMagicLink(db as any, "expired", "x@y.com", Date.now() - 1000);
    await insertMagicLink(db as any, "current", "x@y.com", Date.now() + 60_000);
    await insertAdminSession(db as any, "old-sess", "x@y.com", Date.now() - 1000);
    await insertAdminSession(db as any, "new-sess", "x@y.com", Date.now() + 60_000);
    const counts = await pruneExpired(db as any);
    expect(counts.magicLinks).toBeGreaterThanOrEqual(1);
    expect(counts.sessions).toBeGreaterThanOrEqual(1);
    expect(await getValidSession(db as any, "new-sess")).toBeDefined();
  });
});
```

- [ ] **Step 2: Verify FAIL**

Run: `pnpm vitest run tests/unit/db/queries/admin.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
import { and, eq, gte, isNull, lt } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { adminMagicLinks, adminSessions } from "@/lib/db/schema";

export async function insertMagicLink(
  db: Db,
  tokenHash: string,
  email: string,
  expiresAt: number,
): Promise<void> {
  await db.insert(adminMagicLinks).values({
    tokenHash,
    email,
    expiresAt,
    createdAt: Date.now(),
  });
}

export async function consumeMagicLink(db: Db, tokenHash: string): Promise<string | null> {
  const now = Date.now();
  const rows = await db.select().from(adminMagicLinks).where(
    and(
      eq(adminMagicLinks.tokenHash, tokenHash),
      isNull(adminMagicLinks.usedAt),
      gte(adminMagicLinks.expiresAt, now),
    ),
  ).limit(1);
  if (!rows[0]) return null;
  await db.update(adminMagicLinks).set({ usedAt: now }).where(eq(adminMagicLinks.tokenHash, tokenHash));
  return rows[0].email;
}

export async function insertAdminSession(
  db: Db,
  sessionIdHash: string,
  email: string,
  expiresAt: number,
): Promise<void> {
  const now = Date.now();
  await db.insert(adminSessions).values({
    sessionIdHash,
    email,
    expiresAt,
    createdAt: now,
    lastSeenAt: now,
  });
}

export async function getValidSession(
  db: Db,
  sessionIdHash: string,
): Promise<{ email: string; expiresAt: number } | undefined> {
  const now = Date.now();
  const rows = await db.select().from(adminSessions).where(
    and(eq(adminSessions.sessionIdHash, sessionIdHash), gte(adminSessions.expiresAt, now)),
  ).limit(1);
  if (!rows[0]) return undefined;
  await db.update(adminSessions).set({ lastSeenAt: now }).where(eq(adminSessions.sessionIdHash, sessionIdHash));
  return { email: rows[0].email, expiresAt: rows[0].expiresAt };
}

export async function deleteSession(db: Db, sessionIdHash: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.sessionIdHash, sessionIdHash));
}

export async function pruneExpired(db: Db): Promise<{ magicLinks: number; sessions: number }> {
  const now = Date.now();
  const ml = await db.delete(adminMagicLinks).where(lt(adminMagicLinks.expiresAt, now)).returning();
  const ss = await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now)).returning();
  return { magicLinks: ml.length, sessions: ss.length };
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/db/queries/admin.test.ts`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/db/queries/admin.test.ts src/lib/db/queries/admin.ts
git commit -m "feat(db): add admin magic-link + session queries"
```

---

## Task 2: Admin auth service

**Files:**
- Create: `src/lib/auth/admin.ts`
- Test: `tests/unit/auth/admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../helpers/test-db";
import { sendMagicLink, verifyMagicLinkAndIssueSession, validateSessionToken } from "@/lib/auth/admin";
import { generateToken } from "@/lib/auth/tokens";
import { Resend } from "resend";

const fakeResend = { emails: { send: async () => ({ data: { id: "x" }, error: null }) } } as unknown as Resend;

describe("admin auth", () => {
  it("only allows the configured admin email", async () => {
    const db = makeTestDb();
    const r = await sendMagicLink({
      db: db as any,
      resend: fakeResend,
      adminEmail: "founder@example.com",
      submittedEmail: "attacker@example.com",
      publicSiteUrl: "https://example.com",
      from: "no-reply@example.com",
    });
    expect(r.silentlyIgnored).toBe(true); // no error, no link, but pretend success
  });

  it("end-to-end: send link → verify → session", async () => {
    const db = makeTestDb();
    const r = await sendMagicLink({
      db: db as any,
      resend: fakeResend,
      adminEmail: "founder@example.com",
      submittedEmail: "founder@example.com",
      publicSiteUrl: "https://example.com",
      from: "no-reply@example.com",
    });
    expect(r.silentlyIgnored).toBe(false);
    expect(r.plainToken).toBeTruthy();

    const session = await verifyMagicLinkAndIssueSession({
      db: db as any,
      plainToken: r.plainToken!,
      sessionTtlSeconds: 60 * 60 * 24 * 30,
    });
    expect(session.email).toBe("founder@example.com");
    expect(session.plainSessionToken).toBeTruthy();

    const ok = await validateSessionToken(db as any, session.plainSessionToken);
    expect(ok?.email).toBe("founder@example.com");
  });
});
```

- [ ] **Step 2: Implement**

```ts
import type { Resend } from "resend";
import type { Db } from "@/lib/db/client";
import { generateToken, hashToken, constantTimeEqual } from "./tokens";
import {
  insertMagicLink,
  consumeMagicLink,
  insertAdminSession,
  getValidSession,
} from "@/lib/db/queries/admin";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import AdminMagicLink from "@/lib/email/templates/AdminMagicLink";

const MAGIC_TTL_SECONDS = 15 * 60;

export interface SendMagicLinkInput {
  db: Db;
  resend: Resend;
  adminEmail: string;
  submittedEmail: string;
  publicSiteUrl: string;
  from: string;
}

export interface SendMagicLinkResult {
  silentlyIgnored: boolean;
  plainToken: string | null;
}

export async function sendMagicLink(input: SendMagicLinkInput): Promise<SendMagicLinkResult> {
  if (!constantTimeEqual(input.submittedEmail.toLowerCase(), input.adminEmail.toLowerCase())) {
    return { silentlyIgnored: true, plainToken: null };
  }

  const plainToken = generateToken();
  const tokenHash = await hashToken(plainToken);
  const expiresAt = Date.now() + MAGIC_TTL_SECONDS * 1000;
  await insertMagicLink(input.db, tokenHash, input.adminEmail, expiresAt);

  const url = `${input.publicSiteUrl}/admin/login/verify?token=${encodeURIComponent(plainToken)}`;
  const email = await renderEmail(<AdminMagicLink url={url} />);
  await sendEmail({
    client: input.resend,
    from: input.from,
    to: input.adminEmail,
    subject: "Sign in to Safe Hands admin",
    ...email,
  });
  return { silentlyIgnored: false, plainToken };
}

export interface VerifyInput {
  db: Db;
  plainToken: string;
  sessionTtlSeconds: number;
}

export interface VerifyResult {
  email: string;
  plainSessionToken: string;
}

export async function verifyMagicLinkAndIssueSession(input: VerifyInput): Promise<VerifyResult> {
  const tokenHash = await hashToken(input.plainToken);
  const email = await consumeMagicLink(input.db, tokenHash);
  if (!email) throw new Error("invalid_or_expired_token");

  const plainSessionToken = generateToken();
  const sessionIdHash = await hashToken(plainSessionToken);
  const expiresAt = Date.now() + input.sessionTtlSeconds * 1000;
  await insertAdminSession(input.db, sessionIdHash, email, expiresAt);
  return { email, plainSessionToken };
}

export async function validateSessionToken(
  db: Db,
  plainSessionToken: string,
): Promise<{ email: string } | null> {
  if (!plainSessionToken) return null;
  const sessionIdHash = await hashToken(plainSessionToken);
  const valid = await getValidSession(db, sessionIdHash);
  return valid ? { email: valid.email } : null;
}
```

- [ ] **Step 3: AdminMagicLink template**

`src/lib/email/templates/AdminMagicLink.tsx`:

```tsx
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function AdminMagicLink({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to Safe Hands admin</Preview>
      <Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
        <Container style={{ maxWidth: 560, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 20 }}>Sign in</Heading>
          <Section>
            <Text>Click the link below to sign in to the Safe Hands admin portal.</Text>
            <Text><a href={url}>Sign in →</a></Text>
            <Text style={{ fontSize: 12, color: "#475569" }}>
              This link is valid for 15 minutes and can only be used once. If you did not request it,
              ignore this email — no action is needed.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `pnpm vitest run tests/unit/auth/admin.test.ts`
Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/auth/admin.test.ts src/lib/auth/admin.ts src/lib/email/templates/AdminMagicLink.tsx
git commit -m "feat(auth): add admin magic-link send + verify + session validation"
```

---

## Task 3: Middleware — guard /admin/**

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { parseSessionCookie } from "@/lib/auth/session";

export const config = {
  matcher: ["/admin/:path*"],
};

const ALLOW = ["/admin/login", "/admin/login/verify"];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (ALLOW.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  const sessionToken = parseSessionCookie(req.headers.get("cookie"));
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  // Full session validation happens server-side in the layout;
  // middleware only checks cookie presence (cheap).
  return NextResponse.next();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): gate /admin/** behind session cookie presence"
```

---

## Task 4: Admin layout (session validation + nav)

**Files:**
- Create: `src/components/admin/AdminNav.tsx`
- Create: `src/app/admin/layout.tsx`

- [ ] **Step 1: AdminNav**

```tsx
import Link from "next/link";

export function AdminNav({ email }: { email: string }) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/admin" className="text-sm font-semibold">Safe Hands · Admin</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/submissions" className="hover:underline">Submissions</Link>
          <Link href="/admin/faq" className="hover:underline">FAQ</Link>
          <Link href="/admin/media" className="hover:underline">Media</Link>
          <span className="text-slate-500">{email}</span>
          <Link href="/admin/logout" className="text-slate-500 hover:underline">Sign out</Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Admin layout**

```tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { validateSessionToken } from "@/lib/auth/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const path = (await headers()).get("x-pathname") ?? "";
  const allowList = ["/admin/login", "/admin/login/verify"];
  if (allowList.some((p) => path === p || path.startsWith(p + "/"))) {
    return <>{children}</>;
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value ?? null;
  if (!token) redirect("/admin/login");
  const { env } = getCloudflareContext();
  const session = await validateSessionToken(db(env.DB), token);
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav email={session.email} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
```

Note: Next.js does not auto-expose `x-pathname`; the allow-list pattern in the layout is a defence-in-depth check. Most public/admin path routing is handled by the middleware in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminNav.tsx src/app/admin/layout.tsx
git commit -m "feat(admin): add auth-gated layout with nav"
```

---

## Task 5: /admin/login page + action

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/login/actions.ts`

- [ ] **Step 1: Implement action**

```ts
"use server";

import { Resend } from "resend";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { sendMagicLink } from "@/lib/auth/admin";

export type LoginActionState = { ok: boolean; message?: string };

export async function requestMagicLink(_p: LoginActionState, fd: FormData): Promise<LoginActionState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email || email.length > 200) {
    return { ok: false, message: "Please enter a valid email." };
  }
  const env = bindings();
  const resend = new Resend(env.RESEND_API_KEY);
  await sendMagicLink({
    db: db(env.DB),
    resend,
    adminEmail: env.ADMIN_EMAIL,
    submittedEmail: email,
    publicSiteUrl: env.PUBLIC_SITE_URL,
    from: env.RESEND_FROM_ADDRESS,
  });
  return { ok: true, message: "If that address has access, a sign-in link is on its way." };
}
```

- [ ] **Step 2: Implement page**

```tsx
"use client";
import { useActionState } from "react";
import { requestMagicLink, type LoginActionState } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginActionState, FormData>(
    requestMagicLink, { ok: false },
  );
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Safe Hands admin</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your admin email and we will send you a sign-in link.
        </p>
        <form action={action} className="mt-8 space-y-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send sign-in link"}
          </button>
          {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/login/page.tsx src/app/admin/login/actions.ts
git commit -m "feat(admin): add /admin/login page + magic-link request action"
```

---

## Task 6: /admin/login/verify route — exchange token for session cookie

**Files:**
- Create: `src/app/admin/login/verify/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { verifyMagicLinkAndIssueSession } from "@/lib/auth/admin";
import { buildSessionCookie } from "@/lib/auth/session";

const SESSION_TTL_SECONDS = 30 * 86400;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

  const { env } = getCloudflareContext();
  try {
    const { plainSessionToken } = await verifyMagicLinkAndIssueSession({
      db: db(env.DB),
      plainToken: token,
      sessionTtlSeconds: SESSION_TTL_SECONDS,
    });
    const cookie = buildSessionCookie({
      token: plainSessionToken,
      domain: env.SESSION_COOKIE_DOMAIN,
      maxAgeSeconds: SESSION_TTL_SECONDS,
    });
    const res = NextResponse.redirect(new URL("/admin", req.url));
    res.headers.append("Set-Cookie", cookie);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/login/verify/route.ts
git commit -m "feat(admin): add login/verify route — token → session cookie"
```

---

## Task 7: /admin/logout route

**Files:**
- Create: `src/app/admin/logout/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { deleteSession } from "@/lib/db/queries/admin";
import { buildSessionCookie, SESSION_COOKIE_NAME, parseSessionCookie } from "@/lib/auth/session";
import { hashToken } from "@/lib/auth/tokens";

export async function GET(req: NextRequest) {
  const token = parseSessionCookie(req.headers.get("cookie"));
  if (token) {
    const { env } = getCloudflareContext();
    const sessionIdHash = await hashToken(token);
    await deleteSession(db(env.DB), sessionIdHash);
  }
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  const { env } = getCloudflareContext();
  res.headers.append(
    "Set-Cookie",
    buildSessionCookie({ token: "", domain: env.SESSION_COOKIE_DOMAIN, maxAgeSeconds: 0 }),
  );
  return res;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/logout/route.ts
git commit -m "feat(admin): add logout route — delete session + clear cookie"
```

---

## Task 8: Submissions query (unified across 3 tables)

**Files:**
- Create: `src/lib/db/queries/submissions.ts`
- Test: `tests/unit/db/queries/submissions.test.ts`

The unified list runs 3 SELECTs and merges in memory. The data volume is small (Y1 target is ~1,800 educator applications) so this is fine.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { listSubmissions, getSubmission, updateStatus, getCounts } from "@/lib/db/queries/submissions";
import { insertCentreRequest } from "@/lib/db/queries/centres";
import { insertFamilyRequest } from "@/lib/db/queries/families";
import { createDraftEducator, finalizeEducatorApplication } from "@/lib/db/queries/educators";

describe("submissions", () => {
  it("lists across all 3 types, newest first", async () => {
    const db = makeTestDb();
    const c = await insertCentreRequest(db as any, {
      centreName: "C", contactName: "X", contactEmail: "x@x.example", contactPhone: "0",
      suburb: "S", postcode: "2000", roleNeeded: "cert3", shiftDate: "2026-07-01",
      shiftStart: "08:00", shiftDurationHrs: 6, specialNeedsFlag: false, notes: "",
      ipHash: "h", source: null,
    });
    const f = await insertFamilyRequest(db as any, {
      parentName: "P", contactEmail: "p@p.example", contactPhone: "0", suburb: "S",
      postcode: "2000", childrenCount: 1, childrenAges: "5", careType: "after_school",
      shiftDate: "2026-07-02", shiftStart: "15:00", shiftDurationHrs: 3,
      specialNeedsFlag: false, specialNeedsNotes: "", notes: "", ipHash: "h", source: null,
    });
    const e = await createDraftEducator(db as any, {
      firstName: "E", lastName: "D", email: "e@d.example", phone: "0",
      suburb: "S", postcode: "2000", privacyConsent: true, ipHash: "h",
    });
    await finalizeEducatorApplication(db as any, e);

    const list = await listSubmissions(db as any, { type: "all", status: "all", q: "", limit: 50, offset: 0 });
    expect(list.length).toBeGreaterThanOrEqual(3);

    const counts = await getCounts(db as any);
    expect(counts.centre).toBe(1);
    expect(counts.family).toBe(1);
    expect(counts.educator).toBe(1);

    expect((await getSubmission(db as any, "centre", c))?.contactEmail).toBe("x@x.example");
    await updateStatus(db as any, "centre", c, "contacted");
    expect((await getSubmission(db as any, "centre", c))?.status).toBe("contacted");
  });
});
```

- [ ] **Step 2: Implement**

```ts
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { centreRequests, familyRequests, educatorApplications, SUBMISSION_STATUS } from "@/lib/db/schema";

export type SubmissionType = "centre" | "family" | "educator";

export interface UnifiedRow {
  type: SubmissionType;
  id: string;
  status: string;
  primaryName: string;
  contactEmail: string;
  createdAt: number;
}

export interface ListOpts {
  type: SubmissionType | "all";
  status: (typeof SUBMISSION_STATUS)[number] | "all";
  q: string;
  limit: number;
  offset: number;
}

export async function listSubmissions(db: Db, opts: ListOpts): Promise<UnifiedRow[]> {
  const rows: UnifiedRow[] = [];

  if (opts.type === "all" || opts.type === "centre") {
    const conds = [];
    if (opts.status !== "all") conds.push(eq(centreRequests.status, opts.status));
    if (opts.q)
      conds.push(
        or(
          like(centreRequests.contactEmail, `%${opts.q}%`),
          like(centreRequests.contactName, `%${opts.q}%`),
          like(centreRequests.centreName, `%${opts.q}%`),
        ),
      );
    const r = await db.select().from(centreRequests).where(conds.length ? and(...conds) : undefined);
    r.forEach((row) =>
      rows.push({
        type: "centre",
        id: row.id,
        status: row.status,
        primaryName: row.centreName,
        contactEmail: row.contactEmail,
        createdAt: row.createdAt,
      }),
    );
  }

  if (opts.type === "all" || opts.type === "family") {
    const conds = [];
    if (opts.status !== "all") conds.push(eq(familyRequests.status, opts.status));
    if (opts.q)
      conds.push(
        or(
          like(familyRequests.contactEmail, `%${opts.q}%`),
          like(familyRequests.parentName, `%${opts.q}%`),
        ),
      );
    const r = await db.select().from(familyRequests).where(conds.length ? and(...conds) : undefined);
    r.forEach((row) =>
      rows.push({
        type: "family",
        id: row.id,
        status: row.status,
        primaryName: row.parentName,
        contactEmail: row.contactEmail,
        createdAt: row.createdAt,
      }),
    );
  }

  if (opts.type === "all" || opts.type === "educator") {
    const conds = [];
    if (opts.status !== "all") conds.push(eq(educatorApplications.status, opts.status as any));
    if (opts.q)
      conds.push(
        or(
          like(educatorApplications.email, `%${opts.q}%`),
          like(educatorApplications.firstName, `%${opts.q}%`),
          like(educatorApplications.lastName, `%${opts.q}%`),
        ),
      );
    const r = await db.select().from(educatorApplications).where(conds.length ? and(...conds) : undefined);
    r.forEach((row) =>
      rows.push({
        type: "educator",
        id: row.id,
        status: row.status,
        primaryName: `${row.firstName} ${row.lastName}`,
        contactEmail: row.email,
        createdAt: row.createdAt,
      }),
    );
  }

  rows.sort((a, b) => b.createdAt - a.createdAt);
  return rows.slice(opts.offset, opts.offset + opts.limit);
}

export async function getCounts(db: Db) {
  const [c] = await db.select({ n: sql<number>`count(*)` }).from(centreRequests);
  const [f] = await db.select({ n: sql<number>`count(*)` }).from(familyRequests);
  const [e] = await db.select({ n: sql<number>`count(*)` }).from(educatorApplications);
  return { centre: Number(c.n), family: Number(f.n), educator: Number(e.n) };
}

export async function getSubmission(db: Db, type: SubmissionType, id: string) {
  if (type === "centre") {
    const rows = await db.select().from(centreRequests).where(eq(centreRequests.id, id)).limit(1);
    return rows[0];
  }
  if (type === "family") {
    const rows = await db.select().from(familyRequests).where(eq(familyRequests.id, id)).limit(1);
    return rows[0];
  }
  const rows = await db.select().from(educatorApplications).where(eq(educatorApplications.id, id)).limit(1);
  return rows[0];
}

export async function updateStatus(db: Db, type: SubmissionType, id: string, status: string) {
  const now = Date.now();
  if (type === "centre") {
    await db.update(centreRequests).set({ status, updatedAt: now }).where(eq(centreRequests.id, id));
    return;
  }
  if (type === "family") {
    await db.update(familyRequests).set({ status, updatedAt: now }).where(eq(familyRequests.id, id));
    return;
  }
  await db.update(educatorApplications).set({ status: status as any, updatedAt: now }).where(eq(educatorApplications.id, id));
}
```

- [ ] **Step 3: Run, expect PASS**

Run: `pnpm vitest run tests/unit/db/queries/submissions.test.ts`
Expected: 1 passing.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/db/queries/submissions.test.ts src/lib/db/queries/submissions.ts
git commit -m "feat(db): add unified submissions list/get/update + counts"
```

---

## Task 9: /admin dashboard

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { getCounts, listSubmissions } from "@/lib/db/queries/submissions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { env } = getCloudflareContext();
  const counts = await getCounts(db(env.DB));
  const recent = await listSubmissions(db(env.DB), {
    type: "all", status: "all", q: "", limit: 10, offset: 0,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card title="Centre requests" value={counts.centre} href="/admin/submissions?type=centre" />
        <Card title="Family requests" value={counts.family} href="/admin/submissions?type=family" />
        <Card title="Educator applications" value={counts.educator} href="/admin/submissions?type=educator" />
      </div>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Latest activity</h2>
        <div className="rounded-md border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-slate-600">
              <tr><th className="p-3">Type</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={`${r.type}-${r.id}`} className="border-b last:border-0">
                  <td className="p-3 capitalize">{r.type}</td>
                  <td className="p-3">
                    <Link href={`/admin/submissions/${r.type}/${r.id}`} className="hover:underline">
                      {r.primaryName}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-600">{r.contactEmail}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3 text-slate-500">{new Date(r.createdAt).toLocaleString("en-AU")}</td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No submissions yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-md border bg-white p-4 hover:border-slate-400">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin): add dashboard with counts + latest 10 activity"
```

---

## Task 10: /admin/submissions list + filters

**Files:**
- Create: `src/components/admin/SubmissionFilters.tsx`
- Create: `src/components/admin/SubmissionsTable.tsx`
- Create: `src/app/admin/submissions/page.tsx`

- [ ] **Step 1: SubmissionFilters**

```tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function SubmissionFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const update = (k: string, v: string) => {
    const next = new URLSearchParams(sp.toString());
    if (v) next.set(k, v); else next.delete(k);
    next.delete("offset");
    router.push(`/admin/submissions?${next.toString()}`);
  };
  return (
    <form className="flex flex-wrap gap-2 text-sm" role="search">
      <select
        defaultValue={sp.get("type") ?? "all"}
        onChange={(e) => update("type", e.target.value === "all" ? "" : e.target.value)}
        className="rounded-md border px-2 py-1"
      >
        <option value="all">All types</option>
        <option value="centre">Centre</option>
        <option value="family">Family</option>
        <option value="educator">Educator</option>
      </select>
      <select
        defaultValue={sp.get("status") ?? "all"}
        onChange={(e) => update("status", e.target.value === "all" ? "" : e.target.value)}
        className="rounded-md border px-2 py-1"
      >
        <option value="all">All statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="archived">Archived</option>
      </select>
      <input
        type="search"
        placeholder="Search name or email"
        defaultValue={sp.get("q") ?? ""}
        onBlur={(e) => update("q", e.target.value)}
        className="flex-1 rounded-md border px-2 py-1"
      />
    </form>
  );
}
```

- [ ] **Step 2: SubmissionsTable (server component, reads from query)**

```tsx
import Link from "next/link";
import type { UnifiedRow } from "@/lib/db/queries/submissions";

export function SubmissionsTable({ rows }: { rows: UnifiedRow[] }) {
  if (rows.length === 0) {
    return <p className="rounded-md border bg-white p-6 text-center text-sm text-slate-500">No submissions match these filters.</p>;
  }
  return (
    <div className="rounded-md border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b text-left text-slate-600">
          <tr><th className="p-3">Type</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.type}-${r.id}`} className="border-b last:border-0">
              <td className="p-3 capitalize">{r.type}</td>
              <td className="p-3">
                <Link href={`/admin/submissions/${r.type}/${r.id}`} className="hover:underline">
                  {r.primaryName}
                </Link>
              </td>
              <td className="p-3 text-slate-600">{r.contactEmail}</td>
              <td className="p-3 capitalize">{r.status}</td>
              <td className="p-3 text-slate-500">{new Date(r.createdAt).toLocaleString("en-AU")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: submissions/page.tsx**

```tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { listSubmissions } from "@/lib/db/queries/submissions";
import { SubmissionFilters } from "@/components/admin/SubmissionFilters";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ type?: string; status?: string; q?: string; offset?: string }>;
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const type = (sp.type as any) || "all";
  const status = (sp.status as any) || "all";
  const q = sp.q ?? "";
  const offset = Number(sp.offset ?? 0);
  const limit = 50;

  const { env } = getCloudflareContext();
  const rows = await listSubmissions(db(env.DB), { type, status, q, limit, offset });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Submissions</h1>
      <SubmissionFilters />
      <SubmissionsTable rows={rows} />
      <nav className="flex justify-between text-sm">
        {offset > 0 ? (
          <a className="underline" href={`?${new URLSearchParams({ type, status, q, offset: String(Math.max(0, offset - limit)) })}`}>← Previous</a>
        ) : <span />}
        {rows.length === limit ? (
          <a className="underline" href={`?${new URLSearchParams({ type, status, q, offset: String(offset + limit) })}`}>Next →</a>
        ) : <span />}
      </nav>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/submissions/page.tsx src/components/admin/SubmissionFilters.tsx src/components/admin/SubmissionsTable.tsx
git commit -m "feat(admin): add submissions list with filters, search, pagination"
```

---

## Task 11: /admin/submissions/[type]/[id] detail + status transition

**Files:**
- Create: `src/components/admin/StatusTransition.tsx`
- Create: `src/app/admin/submissions/[type]/[id]/actions.ts`
- Create: `src/app/admin/submissions/[type]/[id]/page.tsx`

- [ ] **Step 1: StatusTransition client component**

```tsx
"use client";
import { useActionState } from "react";
import { changeStatus, type StatusActionState } from "@/app/admin/submissions/[type]/[id]/actions";

const OPTIONS_DEFAULT = ["new", "contacted", "qualified", "archived"];
const OPTIONS_EDUCATOR = ["draft", "submitted", "shortlisted", "interviewed", "rejected", "archived"];

export function StatusTransition({
  type,
  id,
  current,
}: {
  type: "centre" | "family" | "educator";
  id: string;
  current: string;
}) {
  const [state, action, pending] = useActionState<StatusActionState, FormData>(
    changeStatus, { ok: true },
  );
  const opts = type === "educator" ? OPTIONS_EDUCATOR : OPTIONS_DEFAULT;
  return (
    <form action={action} className="flex items-center gap-2 text-sm">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <label className="flex items-center gap-2">
        <span>Status:</span>
        <select name="status" defaultValue={current} className="rounded-md border px-2 py-1">
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-3 py-1 text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update"}
      </button>
      {state.error ? <span className="text-red-700">{state.error}</span> : null}
    </form>
  );
}
```

- [ ] **Step 2: actions.ts**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { updateStatus } from "@/lib/db/queries/submissions";

export type StatusActionState = { ok: boolean; error?: string };

const schema = z.object({
  type: z.enum(["centre", "family", "educator"]),
  id: z.string().min(1).max(64),
  status: z.string().min(1).max(32),
});

export async function changeStatus(_p: StatusActionState, fd: FormData): Promise<StatusActionState> {
  let parsed;
  try {
    parsed = schema.parse({ type: fd.get("type"), id: fd.get("id"), status: fd.get("status") });
  } catch {
    return { ok: false, error: "Invalid input" };
  }
  const env = bindings();
  await updateStatus(db(env.DB), parsed.type, parsed.id, parsed.status);
  revalidatePath(`/admin/submissions/${parsed.type}/${parsed.id}`);
  revalidatePath("/admin/submissions");
  return { ok: true };
}
```

- [ ] **Step 3: detail page**

```tsx
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { getSubmission } from "@/lib/db/queries/submissions";
import { listEducatorDocuments } from "@/lib/db/queries/educators";
import { presignGetUrl } from "@/lib/storage/r2";
import { StatusTransition } from "@/components/admin/StatusTransition";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ type: "centre" | "family" | "educator"; id: string }>;
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { type, id } = await params;
  const { env } = getCloudflareContext();
  const row = await getSubmission(db(env.DB), type, id);
  if (!row) notFound();

  let docs: { docType: string; originalFilename: string; url: string }[] = [];
  if (type === "educator") {
    const rows = await listEducatorDocuments(db(env.DB), id);
    docs = await Promise.all(
      rows.map(async (d) => ({
        docType: d.docType,
        originalFilename: d.originalFilename,
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
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold capitalize">{type} submission</h1>
      <StatusTransition type={type} id={id} current={(row as any).status} />
      <pre className="overflow-auto rounded-md border bg-white p-4 text-xs">{JSON.stringify(row, null, 2)}</pre>
      {type === "educator" && docs.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">Documents</h2>
          <ul className="mt-2 space-y-1">
            {docs.map((d) => (
              <li key={d.url}><a className="underline" href={d.url} target="_blank" rel="noopener noreferrer">{d.docType} — {d.originalFilename}</a></li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/StatusTransition.tsx src/app/admin/submissions/[type]/[id]/
git commit -m "feat(admin): add submission detail page with status transitions + signed doc URLs"
```

---

## Task 12: FAQ admin (queries + page + actions)

**Files:**
- Create: `src/lib/db/queries/faq.ts`
- Create: `src/app/admin/faq/actions.ts`
- Create: `src/components/admin/FaqEditor.tsx`
- Create: `src/app/admin/faq/page.tsx`
- Test: `tests/unit/db/queries/faq.test.ts`

- [ ] **Step 1: Implement queries**

```ts
import { eq, asc } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { faqEntries, type FaqEntry, FAQ_AUDIENCE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export async function listAllFaq(db: Db): Promise<FaqEntry[]> {
  return db.select().from(faqEntries).orderBy(asc(faqEntries.audience), asc(faqEntries.sortOrder));
}

export async function createFaq(db: Db, input: {
  audience: (typeof FAQ_AUDIENCE)[number];
  question: string;
  answer: string;
}): Promise<string> {
  const id = newId();
  const now = Date.now();
  await db.insert(faqEntries).values({
    id, audience: input.audience, question: input.question, answer: input.answer,
    sortOrder: now, published: false, createdAt: now, updatedAt: now,
  });
  return id;
}

export async function updateFaq(db: Db, id: string, patch: Partial<FaqEntry>): Promise<void> {
  await db.update(faqEntries).set({ ...patch, updatedAt: Date.now() }).where(eq(faqEntries.id, id));
}

export async function deleteFaq(db: Db, id: string): Promise<void> {
  await db.delete(faqEntries).where(eq(faqEntries.id, id));
}
```

- [ ] **Step 2: Write test**

```ts
import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { createFaq, updateFaq, deleteFaq, listAllFaq } from "@/lib/db/queries/faq";

describe("faq queries", () => {
  it("creates, updates, deletes", async () => {
    const db = makeTestDb();
    const id = await createFaq(db as any, { audience: "centre", question: "Q?", answer: "A" });
    expect((await listAllFaq(db as any))).toHaveLength(1);
    await updateFaq(db as any, id, { published: true, sortOrder: 5 });
    const after = await listAllFaq(db as any);
    expect(after[0].published).toBe(true);
    expect(after[0].sortOrder).toBe(5);
    await deleteFaq(db as any, id);
    expect((await listAllFaq(db as any))).toHaveLength(0);
  });
});
```

Run: `pnpm vitest run tests/unit/db/queries/faq.test.ts`. Expected: 1 passing.

- [ ] **Step 3: FAQ actions**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { FAQ_AUDIENCE } from "@/lib/db/schema";
import { createFaq, updateFaq, deleteFaq } from "@/lib/db/queries/faq";

const createSchema = z.object({
  audience: z.enum(FAQ_AUDIENCE),
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(10000),
});

export async function createFaqAction(_p: unknown, fd: FormData) {
  const parsed = createSchema.safeParse({
    audience: fd.get("audience"),
    question: fd.get("question"),
    answer: fd.get("answer"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const env = bindings();
  await createFaq(db(env.DB), parsed.data);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  return { ok: true };
}

export async function togglePublishedAction(fd: FormData) {
  const id = String(fd.get("id"));
  const published = fd.get("published") === "true";
  const env = bindings();
  await updateFaq(db(env.DB), id, { published });
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function deleteFaqAction(fd: FormData) {
  const id = String(fd.get("id"));
  const env = bindings();
  await deleteFaq(db(env.DB), id);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}
```

- [ ] **Step 4: FaqEditor (server component with inline create form)**

```tsx
import { createFaqAction, togglePublishedAction, deleteFaqAction } from "@/app/admin/faq/actions";
import type { FaqEntry } from "@/lib/db/schema";

export function FaqEditor({ entries }: { entries: FaqEntry[] }) {
  return (
    <div className="space-y-8">
      <section className="rounded-md border bg-white p-4">
        <h2 className="text-lg font-semibold">Add an entry</h2>
        <form action={createFaqAction as any} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Audience</span>
            <select name="audience" required className="rounded-md border px-2 py-1">
              <option value="general">General</option>
              <option value="centre">Centre</option>
              <option value="family">Family</option>
              <option value="educator">Educator</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium">Question</span>
            <input name="question" required maxLength={500} className="rounded-md border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium">Answer (markdown)</span>
            <textarea name="answer" required rows={4} maxLength={10000} className="rounded-md border px-3 py-2" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white">Add</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Entries</h2>
        <ul className="mt-3 space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-md border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{e.audience}</p>
              <p className="mt-1 font-medium">{e.question}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{e.answer}</p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <form action={togglePublishedAction as any}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="published" value={String(!e.published)} />
                  <button type="submit" className="rounded-md border px-2 py-1">
                    {e.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deleteFaqAction as any}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="rounded-md border border-red-300 px-2 py-1 text-red-700">
                    Delete
                  </button>
                </form>
                <span className="text-slate-500">sort: {e.sortOrder}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: faq/page.tsx**

```tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { listAllFaq } from "@/lib/db/queries/faq";
import { FaqEditor } from "@/components/admin/FaqEditor";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const { env } = getCloudflareContext();
  const entries = await listAllFaq(db(env.DB));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">FAQ</h1>
      <FaqEditor entries={entries} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add tests/unit/db/queries/faq.test.ts src/lib/db/queries/faq.ts src/app/admin/faq/ src/components/admin/FaqEditor.tsx
git commit -m "feat(admin): add FAQ editor (create, publish, delete)"
```

---

## Task 13: Media library (queries + upload route + page)

**Files:**
- Create: `src/lib/db/queries/media.ts`
- Create: `src/app/api/uploads/media/route.ts`
- Create: `src/app/admin/media/actions.ts`
- Create: `src/components/admin/MediaLibrary.tsx`
- Create: `src/app/admin/media/page.tsx`

- [ ] **Step 1: Media queries**

```ts
import { desc, eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { media, type MediaItem } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export async function listMedia(db: Db): Promise<MediaItem[]> {
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function insertMedia(db: Db, input: {
  r2Key: string; originalFilename: string; mimeType: string; sizeBytes: number;
}): Promise<string> {
  const id = newId();
  await db.insert(media).values({
    id,
    r2Key: input.r2Key,
    originalFilename: input.originalFilename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    createdAt: Date.now(),
  });
  return id;
}

export async function updateMediaAlt(db: Db, id: string, altText: string): Promise<void> {
  await db.update(media).set({ altText }).where(eq(media.id, id));
}

export async function deleteMedia(db: Db, id: string): Promise<void> {
  await db.delete(media).where(eq(media.id, id));
}
```

- [ ] **Step 2: /api/uploads/media route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { validateSessionToken } from "@/lib/auth/admin";
import { parseSessionCookie } from "@/lib/auth/session";
import { presignPutUrl } from "@/lib/storage/r2";
import { newId } from "@/lib/util/ulid";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 10 * 1024 * 1024;

const schema = z.object({
  filename: z.string().min(1).max(300),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().min(1).max(MAX_BYTES),
});

export async function POST(req: NextRequest) {
  const token = parseSessionCookie(req.headers.get("cookie"));
  const { env } = getCloudflareContext();
  if (!token || !(await validateSessionToken(db(env.DB), token))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(parsed.mimeType)) {
    return NextResponse.json({ error: "unsupported_mime" }, { status: 415 });
  }
  const ext = parsed.mimeType.split("/")[1].replace("svg+xml", "svg").replace("jpeg", "jpg");
  const r2Key = `media/${newId()}.${ext}`;
  const url = await presignPutUrl({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: "safe-hands-public-media",
    key: r2Key,
    contentType: parsed.mimeType,
    expiresInSeconds: 300,
  });
  return NextResponse.json({ uploadUrl: url, r2Key });
}
```

- [ ] **Step 3: Media actions**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { insertMedia, updateMediaAlt, deleteMedia } from "@/lib/db/queries/media";

export async function recordMediaAction(fd: FormData) {
  const env = bindings();
  await insertMedia(db(env.DB), {
    r2Key: String(fd.get("r2Key")),
    originalFilename: String(fd.get("originalFilename")),
    mimeType: String(fd.get("mimeType")),
    sizeBytes: Number(fd.get("sizeBytes")),
  });
  revalidatePath("/admin/media");
}

export async function updateAltAction(fd: FormData) {
  const env = bindings();
  await updateMediaAlt(db(env.DB), String(fd.get("id")), String(fd.get("alt")));
  revalidatePath("/admin/media");
}

export async function deleteMediaAction(fd: FormData) {
  const env = bindings();
  await deleteMedia(db(env.DB), String(fd.get("id")));
  revalidatePath("/admin/media");
}
```

- [ ] **Step 4: MediaLibrary (client uploader + server-rendered list)**

`src/components/admin/MediaUploader.tsx`:

```tsx
"use client";
import { useState } from "react";
import { recordMediaAction } from "@/app/admin/media/actions";

export function MediaUploader() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    try {
      const presignRes = await fetch("/api/uploads/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size }),
      });
      if (!presignRes.ok) throw new Error("presign failed");
      const { uploadUrl, r2Key } = (await presignRes.json()) as { uploadUrl: string; r2Key: string };
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("put failed");
      const fd = new FormData();
      fd.append("r2Key", r2Key);
      fd.append("originalFilename", file.name);
      fd.append("mimeType", file.type);
      fd.append("sizeBytes", String(file.size));
      await recordMediaAction(fd);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Upload image</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleChange}
        className="rounded-md border px-3 py-2"
      />
      {status === "uploading" ? <span className="text-xs text-slate-500">Uploading…</span> : null}
      {status === "done" ? <span className="text-xs text-green-700">Uploaded ✓</span> : null}
      {status === "error" ? <span className="text-xs text-red-700">Upload failed</span> : null}
    </label>
  );
}
```

`src/components/admin/MediaLibrary.tsx`:

```tsx
import { updateAltAction, deleteMediaAction } from "@/app/admin/media/actions";
import type { MediaItem } from "@/lib/db/schema";

export function MediaLibrary({ items, publicBaseUrl }: { items: MediaItem[]; publicBaseUrl: string }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((m) => {
        const url = `${publicBaseUrl}/${m.r2Key}`;
        return (
          <li key={m.id} className="rounded-md border bg-white p-3">
            {m.mimeType.startsWith("image/") ? (
              <img src={url} alt={m.altText ?? ""} className="aspect-video w-full rounded object-cover" />
            ) : null}
            <p className="mt-2 text-xs text-slate-500">{m.originalFilename}</p>
            <p className="mt-1 break-all text-xs"><code>{url}</code></p>
            <form action={updateAltAction as any} className="mt-2 flex gap-2 text-xs">
              <input type="hidden" name="id" value={m.id} />
              <input
                name="alt"
                defaultValue={m.altText ?? ""}
                placeholder="alt text"
                className="flex-1 rounded-md border px-2 py-1"
              />
              <button type="submit" className="rounded-md border px-2 py-1">Save</button>
            </form>
            <form action={deleteMediaAction as any} className="mt-2">
              <input type="hidden" name="id" value={m.id} />
              <button type="submit" className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700">Delete</button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 5: media/page.tsx**

```tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { listMedia } from "@/lib/db/queries/media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { MediaUploader } from "@/components/admin/MediaUploader";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const { env } = getCloudflareContext();
  const items = await listMedia(db(env.DB));
  const publicBaseUrl = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/safe-hands-public-media`;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Media</h1>
      <MediaUploader />
      <MediaLibrary items={items} publicBaseUrl={publicBaseUrl} />
    </div>
  );
}
```

Note: For production, you'd configure a custom-domain or a Worker route to serve `safe-hands-public-media` rather than the raw R2 hostname. Keep this for v1; the Phase 4 deploy task documents the follow-up.

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/queries/media.ts src/app/api/uploads/media src/app/admin/media src/components/admin/MediaLibrary.tsx src/components/admin/MediaUploader.tsx
git commit -m "feat(admin): add media library (presigned upload + list + alt + delete)"
```

---

## Task 14: Cron cleanup endpoint

**Files:**
- Create: `src/app/api/cron/cleanup/route.ts`
- Modify: `wrangler.jsonc` (add cron trigger)

The spec retains submissions for 24 months in `archived` status. Educator drafts that are never finalised are removed after 60 days. Expired tokens and sessions are removed every night.

- [ ] **Step 1: Implement cleanup route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { lt, and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pruneExpired } from "@/lib/db/queries/admin";
import {
  centreRequests,
  familyRequests,
  educatorApplications,
  educatorResumeTokens,
} from "@/lib/db/schema";

const ARCHIVE_RETENTION_MS = 24 * 30 * 86400 * 1000;
const ABANDONED_DRAFT_MS = 60 * 86400 * 1000;

export async function GET(req: NextRequest) {
  // Cron triggers are unauthenticated from the Worker runtime perspective,
  // but Cloudflare guarantees only its scheduler can call them. As an extra
  // belt-and-braces check, require a shared secret in production.
  const secret = req.nextUrl.searchParams.get("secret");
  const { env } = getCloudflareContext();
  if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dbi = db(env.DB);
  const now = Date.now();

  // 1. expired magic-link tokens + sessions
  const auth = await pruneExpired(dbi);

  // 2. expired resume tokens
  const tokens = await dbi.delete(educatorResumeTokens).where(lt(educatorResumeTokens.expiresAt, now)).returning();

  // 3. abandoned educator drafts older than 60 days
  const drafts = await dbi.delete(educatorApplications).where(
    and(eq(educatorApplications.status, "draft"), lt(educatorApplications.updatedAt, now - ABANDONED_DRAFT_MS)),
  ).returning();

  // 4. archived submissions older than 24 months
  const archivedCentres = await dbi.delete(centreRequests).where(
    and(eq(centreRequests.status, "archived"), lt(centreRequests.updatedAt, now - ARCHIVE_RETENTION_MS)),
  ).returning();
  const archivedFamilies = await dbi.delete(familyRequests).where(
    and(eq(familyRequests.status, "archived"), lt(familyRequests.updatedAt, now - ARCHIVE_RETENTION_MS)),
  ).returning();
  const archivedEducators = await dbi.delete(educatorApplications).where(
    and(eq(educatorApplications.status, "archived" as any), lt(educatorApplications.updatedAt, now - ARCHIVE_RETENTION_MS)),
  ).returning();

  return NextResponse.json({
    auth,
    resumeTokens: tokens.length,
    abandonedDrafts: drafts.length,
    archived: {
      centre: archivedCentres.length,
      family: archivedFamilies.length,
      educator: archivedEducators.length,
    },
  });
}
```

- [ ] **Step 2: Add cron trigger to wrangler.jsonc**

```jsonc
	"triggers": {
		"crons": ["0 16 * * *"]
	},
```

16:00 UTC = 02:00 AEST. Cloudflare will GET the `/api/cron/cleanup` endpoint via scheduled invocations. Add `CRON_SECRET` as a Worker secret (`npx wrangler secret put CRON_SECRET`) and append the value to your cron URL configuration in Cloudflare dashboard. For dev, leave `CRON_SECRET` unset and the endpoint is unauthenticated locally.

- [ ] **Step 3: Update env schema**

In `src/lib/env.ts`, add:

```ts
  CRON_SECRET: z.string().optional(),
```

Add the matching key to `tests/unit/env.test.ts validEnv`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/cleanup/route.ts src/lib/env.ts tests/unit/env.test.ts wrangler.jsonc
git commit -m "feat(cron): add nightly cleanup (tokens, sessions, abandoned drafts, archived)"
```

---

## Task 15: Admin E2E test

**Files:**
- Create: `tests/e2e/admin-flow.spec.ts`

The admin flow E2E test bypasses the magic-link email by intercepting the action and directly hitting the `/admin/login/verify` URL using a token issued via a test helper endpoint OR by reading the token from the DB. The simpler path: provide a dev-only helper endpoint that issues a session cookie directly when called with a known shared secret. This is gated by `process.env.NODE_ENV === "development"`.

- [ ] **Step 1: Add dev-only test login helper**

`src/app/admin/login/test-session/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { insertAdminSession } from "@/lib/db/queries/admin";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { buildSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }
  const { env } = getCloudflareContext();
  const token = generateToken();
  const hash = await hashToken(token);
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1h for tests
  await insertAdminSession(db(env.DB), hash, env.ADMIN_EMAIL, expiresAt);
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", buildSessionCookie({
    token,
    domain: env.SESSION_COOKIE_DOMAIN,
    maxAgeSeconds: 3600,
  }));
  return res;
}
```

- [ ] **Step 2: E2E test**

```ts
import { test, expect } from "@playwright/test";

test("admin login → dashboard → submissions detail → status change", async ({ page, request }) => {
  // dev-only test helper to bypass magic-link email
  await request.post("/admin/login/test-session");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

  await page.getByRole("link", { name: /submissions/i }).click();
  await expect(page).toHaveURL(/\/admin\/submissions/);

  // submit one centre request first so we have data
  await page.goto("/for-centres/request");
  await page.getByLabel(/centre name/i).fill("Test Centre");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/phone/i).fill("0400000000");
  await page.getByLabel(/suburb/i).fill("Sydney");
  await page.getByLabel(/postcode/i).fill("2000");
  await page.getByLabel(/role needed/i).selectOption("cert3");
  await page.getByLabel(/shift date/i).fill("2026-07-10");
  await page.getByLabel(/shift start/i).fill("08:00");
  await page.getByLabel(/duration/i).fill("4");
  await page.getByLabel(/privacy policy/i).check();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /submit request/i }).click();
  await expect(page).toHaveURL(/thank-you/);

  // back to admin to find it
  await page.goto("/admin/submissions");
  await page.getByRole("link", { name: /test centre/i }).click();
  await expect(page).toHaveURL(/\/admin\/submissions\/centre\//);

  // change status
  await page.getByLabel(/status:/i).selectOption("contacted");
  await page.getByRole("button", { name: /update/i }).click();
  await expect(page.getByLabel(/status:/i)).toHaveValue("contacted");
});
```

- [ ] **Step 3: Run, expect PASS**

Run: `pnpm e2e tests/e2e/admin-flow.spec.ts`
Expected: passing.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/test-session tests/e2e/admin-flow.spec.ts
git commit -m "test(e2e): add admin flow test with dev-only session bypass"
```

---

## Task 16: Accessibility scan on admin pages

**Files:**
- Create: `tests/e2e/accessibility-admin.spec.ts`

- [ ] **Step 1: Write tests**

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/admin", "/admin/submissions", "/admin/faq", "/admin/media"];

test.beforeEach(async ({ request }) => {
  await request.post("/admin/login/test-session");
});

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

- [ ] **Step 2: Run, fix any failures**

Run: `pnpm e2e tests/e2e/accessibility-admin.spec.ts`. Address any violations found.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/accessibility-admin.spec.ts
git commit -m "test(a11y): add axe-core scan on admin pages"
```

---

## Task 17: Performance audit (Lighthouse via Playwright)

**Files:**
- Create: `tests/e2e/perf-public.spec.ts`

- [ ] **Step 1: Install Lighthouse**

```bash
pnpm add -D playwright-lighthouse
```

- [ ] **Step 2: Write tests**

```ts
import { test } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";

test("home page meets performance budget", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Lighthouse runs in Chromium only");
  await page.goto("/");
  await playAudit({
    page,
    thresholds: { performance: 80, accessibility: 95, "best-practices": 90, seo: 90 },
    port: 9222,
  });
});
```

To run with a launched-with-debugging-port Chromium, add to `playwright.config.ts`:

```ts
use: { launchOptions: { args: ["--remote-debugging-port=9222"] } }
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/perf-public.spec.ts package.json pnpm-lock.yaml playwright.config.ts
git commit -m "test(perf): add Lighthouse audit on home page with budgets"
```

---

## Task 18: Deployment — env, secrets, migrations, custom domain

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Apply production migrations**

Run:
```bash
npx wrangler d1 migrations apply safe-hands-db --remote
```
Expected: All migrations applied to the production D1 instance.

- [ ] **Step 2: Set Worker secrets**

For each secret env var, run `npx wrangler secret put <NAME>` and paste the value:

```bash
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_ADDRESS
npx wrangler secret put TURNSTILE_SITE_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put APP_LOGIN_URL          # optional, can be empty
npx wrangler secret put SESSION_COOKIE_DOMAIN
npx wrangler secret put IP_HASH_SALT_ROTATION
npx wrangler secret put PUBLIC_SITE_URL
npx wrangler secret put R2_ACCOUNT_ID
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put CRON_SECRET
```

- [ ] **Step 3: Configure Resend domain**

In the Resend dashboard, add `mail.safehandsstaffing.com.au` as a verified sending domain. Cloudflare DNS — add the SPF, DKIM, and DMARC records Resend generates. Wait for verification (usually < 1 hour).

- [ ] **Step 4: Configure Turnstile**

Create a site in the Cloudflare Turnstile dashboard at `safehandsstaffing.com.au`. Use the production site key and secret (not the test keys) and update the Worker secrets accordingly.

- [ ] **Step 5: Add custom domain to the Worker**

In the Cloudflare dashboard, add `safehandsstaffing.com.au` as a custom domain on the `safe-hands` Worker. DNS proxy enabled.

- [ ] **Step 6: Deploy**

Run:
```bash
pnpm deploy
```
Expected: OpenNext build succeeds; Wrangler uploads to Cloudflare. Output URL: `https://safe-hands.<account>.workers.dev` and the custom domain.

- [ ] **Step 7: Smoke test production**

Visit `https://safehandsstaffing.com.au/`. Confirm:
- Home page renders.
- Cookie banner appears (or is dismissed after one click).
- Submit a real centre request with your own email. Confirm the founder receives the notify email and the submitter receives the ack email.
- Visit `/admin/login`. Enter the admin email. Confirm the magic-link email arrives and signs you in.
- Confirm `/admin/submissions` shows the test submission.

- [ ] **Step 8: Update README with deployment runbook**

Append to `README.md`:

```markdown
## Deployment

### First-time setup

1. Run `npx wrangler d1 migrations apply safe-hands-db --remote`.
2. Run each `npx wrangler secret put <NAME>` in Task 18 Step 2 of `2026-06-02-spec1-phase4-admin-and-deploy.md`.
3. Verify Resend sending domain (`mail.safehandsstaffing.com.au`).
4. Configure Turnstile production site keys.
5. Add custom domain in the Cloudflare Worker dashboard.

### Regular deploys

```bash
pnpm deploy
```

Builds via OpenNext and uploads to Cloudflare. Migrations are not run automatically — generate and apply them explicitly when the Drizzle schema changes:

```bash
pnpm drizzle-kit generate
npx wrangler d1 migrations apply safe-hands-db --remote
```

### Rollback

```bash
npx wrangler deployments list
npx wrangler rollback <DEPLOYMENT_ID>
```
```

- [ ] **Step 9: Commit**

```bash
git add README.md
git commit -m "docs: add Spec 1 production deployment runbook"
```

---

## Phase 4 Acceptance

After completing this plan:

- [ ] All 18 tasks committed.
- [ ] `pnpm vitest run` passes.
- [ ] `pnpm e2e` passes (all earlier tests + admin flow + admin a11y + perf audit).
- [ ] Production site at `https://safehandsstaffing.com.au/` renders all marketing pages.
- [ ] Magic-link login works in production; only `ADMIN_EMAIL` receives the link.
- [ ] All three intake flows submit, persist, and email in production.
- [ ] Cron trigger fires once and the cleanup endpoint returns expected counts.
- [ ] R2 buckets, D1 database, KV namespace, and Worker custom domain all visible in Cloudflare dashboard.

Spec 1 is shipped.
