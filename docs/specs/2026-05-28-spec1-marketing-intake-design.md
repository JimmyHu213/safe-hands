# Spec 1 — Marketing & Intake Website

**Status:** Draft for review
**Date:** 2026-05-28
**Owner:** Founder
**Stack:** Next.js 16 (App Router) on Cloudflare Workers via OpenNext

---

## 1. Goal

Ship a public marketing website for Safe Hands Staffing Agency with three audience-specific intake flows (centres, families, educators) backed by a Cloudflare D1 database, transactional email via Resend, and a magic-link-gated admin portal at `/admin` for the founder to view submissions and manage FAQ content.

This project is intentionally self-contained. It does not depend on, and does not assume the existence of, any other system.

## 2. Success Criteria

A visitor can:

1. Land on the home page and identify themselves as a **centre**, **family**, or **educator** within one click.
2. Submit a centre booking request, family booking request, or multi-step educator application that persists to D1 and triggers email notifications.
3. Receive a confirmation email acknowledging their submission with expectation-setting copy.
4. (Educator only) Resume a partially-completed application via a signed link emailed after Step 1.

The founder can:

5. Log in at `/admin/login` via emailed magic link (no password).
6. View all submissions across the three intake types with filter, search, and status transitions (`new → contacted → qualified → archived`).
7. Add, edit, reorder, publish, and delete FAQ entries grouped by audience.
8. Upload, view, and delete media assets for use on public pages.

The system must:

9. Block bot submissions via Cloudflare Turnstile on every public form.
10. Render all marketing pages within 1.5s LCP on a 4G connection (RSC + Cloudflare edge).
11. Be deployable to Cloudflare Workers via `pnpm deploy` (existing OpenNext setup).

## 3. Scope

### In scope

- 10 public pages: `/`, `/for-centres`, `/for-families`, `/for-educators`, `/about`, `/compliance`, `/faq`, `/contact`, `/legal/privacy`, `/legal/terms`.
- 3 intake forms: centre request, family request, educator application (4-step wizard with resume-by-email).
- Admin portal at `/admin` with login, submissions list/detail, FAQ editor, media library.
- Cloudflare D1 schema with Drizzle ORM and versioned migrations.
- Cloudflare R2 buckets for educator documents (private) and public media.
- Resend integration for transactional email.
- Cloudflare Turnstile on all public forms.
- Magic-link authentication for the admin portal, scoped to a single founder email (configured via env var).
- Accessibility: WCAG AA target (semantic HTML, keyboard navigation, visible focus, alt text).
- Australian privacy/cookie compliance: cookie consent banner, privacy policy, terms.
- Acknowledgement of Country in the footer.

### Out of scope

- Any concept of "platform accounts," worker portals, centre portals, or family portals. A public `LOG IN` button may appear in the marketing nav and link to an external URL (configured via env var), but **no login functionality is built in this project**. If the external URL is empty, the LOG IN button is hidden.
- Blog/news, video embeds, live chat, mobile app badges. Defer until there is content or product to point to.
- General-purpose contact form. `/contact` shows phone, email, hours, and a map embed only.
- Multi-region or multi-tenant support. Safe Hands is NSW-only in Y1.
- Any CMS beyond FAQ + media. All other page copy lives in code (TSX components).
- E-signature, payments, payroll, scheduling integrations.

## 4. Information Architecture

### Public pages

| Path | Purpose | Content surface |
|:---|:---|:---|
| `/` | Home | Hero with H1, three audience cards, two value-prop sections, trust band, footer CTA |
| `/for-centres` | B2B landing | Why Safe Hands for centres, compliance promise, rate transparency, **prominent phone/email CTAs**, link to request form |
| `/for-centres/request` | Centre booking request form | See Section 6.1 |
| `/for-centres/request/thank-you` | Confirmation | Static; reached after submit |
| `/for-families` | B2C landing | In-home care explainer, pricing anchor, link to request form |
| `/for-families/request` | Family booking request form | See Section 6.2 |
| `/for-families/request/thank-you` | Confirmation | Static; reached after submit |
| `/for-educators` | Educator landing | Why work with Safe Hands, pay anchors, CTA to `/for-educators/apply` |
| `/for-educators/apply` | 4-step apply wizard | See Section 6.3 |
| `/for-educators/apply/resume` | Resume wizard via token | Validates token, loads draft, drops user at last incomplete step |
| `/for-educators/apply/thank-you` | Confirmation | Static page; reached after final submit |
| `/about` | Founder + company | Founder bio, mission, vision, values |
| `/compliance` | Differentiator | Compliance backbone explained — WWCC, Police, HLTAID012, expiry alerts |
| `/faq` | FAQ | Server-rendered from `faq_entries` table; grouped tabs by audience |
| `/contact` | Info | Phone, email, hours, service area, Google Map embed. **No form.** |
| `/legal/privacy` | Privacy policy | Markdown content in repo |
| `/legal/terms` | Terms of use | Markdown content in repo |

### Admin pages (magic-link gated)

| Path | Purpose |
|:---|:---|
| `/admin/login` | Email-only form; sends magic link |
| `/admin/login/verify` | Token exchange endpoint; sets session cookie; redirects to `/admin` |
| `/admin` | Dashboard: counts by submission type and status; latest 10 activity items |
| `/admin/submissions` | Unified list across all three intake types; filter by type + status; search by email/name |
| `/admin/submissions/centre/{id}` | Detail view; status transitions |
| `/admin/submissions/family/{id}` | Detail view; status transitions |
| `/admin/submissions/educator/{id}` | Detail view; document downloads via signed R2 URLs; status transitions |
| `/admin/faq` | List, add, edit, delete, reorder, publish/unpublish FAQ entries |
| `/admin/media` | Upload, list, copy URL, delete media |
| `/admin/logout` | Clears session cookie |

### Global elements

- Sticky top navigation with logo, phone CTA, `LOG IN` (conditional on env var), `For Centres`, `For Families`, `For Educators`, `About`, `Contact`.
- Footer with: company info, sitemap, social links (placeholders), Acknowledgement of Country, ASIC/ABN, privacy/terms links, copyright.
- Cookie consent banner (dismissable, persisted in localStorage).
- Mobile-first responsive layout; phone CTA prominent on small screens.

## 5. Tech Architecture

### Stack

| Layer | Choice |
|:---|:---|
| Framework | Next.js 16 (App Router, React 19) |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Cloudflare D1 (SQLite at edge) |
| ORM | Drizzle ORM with D1 dialect; migrations versioned in `/drizzle/` |
| File storage | Cloudflare R2 (private bucket: `educator-docs`; public bucket: `public-media`) |
| Image optimisation | Cloudflare Images binding (already configured) |
| Email | Resend with React Email templates |
| Auth | Custom magic-link, single-user (env-configured email), signed HMAC tokens |
| Form validation | Zod (shared client + server schemas) |
| Spam protection | Cloudflare Turnstile |
| Styling | Tailwind CSS v4 (already configured) |
| Component primitives | shadcn/ui where useful |

### Repository layout (additive to current scaffold)

```
src/
  app/
    (marketing)/                       # grouped layout; shared header/footer
      page.tsx                         # /
      for-centres/page.tsx
      for-centres/request/page.tsx
      for-families/page.tsx
      for-families/request/page.tsx
      for-educators/page.tsx
      for-educators/apply/page.tsx     # wizard step 1
      for-educators/apply/[step]/page.tsx   # wizard steps 2-4
      for-educators/apply/resume/page.tsx
      for-educators/apply/thank-you/page.tsx
      about/page.tsx
      compliance/page.tsx
      faq/page.tsx
      contact/page.tsx
      legal/privacy/page.tsx
      legal/terms/page.tsx
    admin/
      login/page.tsx
      login/verify/route.ts
      layout.tsx                       # auth-gated layout
      page.tsx
      submissions/page.tsx
      submissions/[type]/[id]/page.tsx
      faq/page.tsx
      media/page.tsx
      logout/route.ts
    api/
      uploads/presign/route.ts         # presigned R2 PUT URLs for educator docs
      uploads/media/route.ts           # admin media uploads (direct-to-R2)
  lib/
    db/
      schema.ts                        # Drizzle schema
      client.ts                        # D1 client factory
      queries/                         # typed query helpers
    email/
      client.ts                        # Resend client
      templates/                       # React Email templates
    auth/
      magic-link.ts                    # token generation, validation, session
      middleware.ts
    storage/
      r2.ts                            # signed URL helpers
    cms/
      faq.ts                           # typed accessors
      content.ts                       # hardcoded copy modules
    validation/
      schemas.ts                       # Zod schemas
  components/
    marketing/                         # Hero, AudienceCards, TrustBand, CtaBand, Footer
    forms/                             # CentreRequestForm, FamilyRequestForm
    wizard/                            # EducatorWizard, Step1, Step2, Step3, Step4, Progress
    admin/                             # SubmissionsTable, FaqEditor, MediaLibrary
    ui/                                # shadcn primitives
drizzle/                               # migration files
public/                                # static assets
```

### Request handling patterns

| Operation | Mechanism | Rationale |
|:---|:---|:---|
| Centre request submit | Server Action | Text only; typed end-to-end |
| Family request submit | Server Action | Text only; typed end-to-end |
| Educator wizard step submit (1, 2) | Server Action | Persists draft; typed |
| Educator wizard step submit (3 — documents) | API route returning presigned R2 PUT URL + Server Action recording the key | Worker never handles file bytes; avoids body-size limits |
| Educator wizard final submit (step 4) | Server Action | Marks `status='submitted'`; sends emails |
| Resume wizard | Server Component validates token in URL, loads draft from D1 |  |
| Admin login | Server Action sends magic link via Resend |  |
| Admin login verify | API route; exchanges token for session cookie |  |
| Admin media upload | API route returning presigned R2 PUT URL | Same pattern as educator docs, public bucket |
| FAQ CRUD | Server Actions | Text only |

## 6. Intake Flows

### 6.1 Centre booking request

`/for-centres/request` is a single-page form. Fields:

- Centre name, contact name, email, phone (required)
- Suburb, postcode (required)
- Role needed: Cert III / Diploma / ECT / Room Leader / OSHC (required)
- Shift date, start time, duration in hours (required)
- Special-needs flag (boolean)
- Free-text notes (optional)
- Privacy consent (required checkbox)
- Turnstile token (required)

On submit:

1. Validate via Zod.
2. Verify Turnstile token via server-side API call.
3. Insert row into `centre_requests` with `status='new'`.
4. Send Resend email to founder with submission summary.
5. Send Resend acknowledgement to submitter ("We'll be in touch within 48 hours").
6. Redirect to `/for-centres/request/thank-you`.

### 6.2 Family booking request

`/for-families/request` follows the same pattern. Fields:

- Parent name, email, phone (required)
- Suburb, postcode (required)
- Children: count and ages (required)
- Care type: after-school / holiday / ad-hoc / overnight (required)
- Shift date, start time, duration (required)
- Special-needs flag + free-text notes (optional)
- General notes (optional)
- Privacy consent (required)
- Turnstile token (required)

On submit: same six-step flow as 6.1, against the `family_requests` table.

### 6.3 Educator application — 4-step wizard

Modeled on the YNA "Join Us" pattern (ACCOUNT → APPLICATION → DOCUMENTS → SUBMIT).

**Step 1 — Identity & consent**

Fields: first name, last name, email, phone, suburb, postcode, privacy consent checkbox, Turnstile token.

On Step 1 submit:

1. Validate.
2. Insert row into `educator_applications` with `status='draft'`, `step_completed=1`.
3. Generate a single-use resume token (random 32-byte URL-safe string); store SHA-256 hash in `educator_resume_tokens` with 30-day expiry.
4. Send "save & resume" email containing the resume link.
5. Redirect to Step 2.

**Step 2 — Qualifications**

Fields: qualification level (cert3 / diploma / ect / adv_dip / other + free-text if other), years experience, special-needs experience boolean + notes, availability (per-day checkboxes for AM/PM), travel radius in km, has-own-transport boolean.

On Step 2 submit:

1. Validate.
2. Update row; set `step_completed=2`.
3. Redirect to Step 3.

**Step 3 — Documents**

Up to 5 file uploads, each typed: WWCC, HLTAID012 First Aid, Cert III/Diploma certificate, ID document, reference letter (×2). Max 10MB per file. Accepted: PDF, JPG, PNG.

Upload flow per file:

1. Client POSTs `{filename, mimeType, docType}` to `/api/uploads/presign`.
2. Server validates: applicant has active draft, docType is allowed, mimeType is allowed.
3. Server generates R2 key `educator-docs/{application_id}/{docType}-{ulid}.{ext}`.
4. Server returns presigned R2 PUT URL valid for 5 minutes.
5. Client PUTs file bytes directly to R2.
6. Client calls Server Action `recordEducatorDocument({applicationId, docType, r2Key, mimeType, size})`.
7. Server inserts row into `educator_documents`.

On Step 3 "Next": validate at least the mandatory docs are present (WWCC, HLTAID012, qualification cert); set `step_completed=3`; redirect to Step 4.

**Step 4 — Review & submit**

Server Component renders all data the user has entered. User clicks "Submit application".

On submit:

1. Validate all required fields are present.
2. Update row: `status='submitted'`, `submitted_at=now`, `step_completed=4`.
3. Mark all resume tokens for this application as used.
4. Send Resend email to founder with submission summary + document links (signed R2 URLs, 24-hour expiry).
5. Send Resend acknowledgement to applicant.
6. Redirect to `/for-educators/apply/thank-you`.

**Resume flow**

User clicks resume link from email. URL: `/for-educators/apply/resume?token={plaintext}`.

1. Server hashes the plaintext token, looks up `educator_resume_tokens`.
2. Validates: token exists, `used_at IS NULL`, `expires_at > now`, parent application status is `'draft'`.
3. Sets a short-lived session cookie identifying the application.
4. Redirects to the step matching `step_completed + 1`.

If validation fails: redirect to Step 1 with a message explaining the link is invalid or expired.

### 6.4 Anti-spam & rate limiting

- Cloudflare Turnstile on every public form. Token verified server-side before any DB write.
- Per-IP rate limit: 10 submissions per 24h per form across the public site, using `ip_hash` (SHA-256 of client IP + daily-rotated salt) as the bucket key. Implemented via Cloudflare Worker KV namespace `rate_limits` (separate from D1).
- All inputs validated via Zod with explicit length limits (no free-text field over 2000 chars).

## 7. Admin Portal

### 7.1 Authentication

Magic-link only. Single-user.

- `ADMIN_EMAIL` env var defines the only address allowed to log in.
- `/admin/login` form accepts an email; if it matches `ADMIN_EMAIL` (constant-time comparison), generates a magic-link token (32 random bytes, URL-safe), stores SHA-256 hash in `admin_magic_links` with 15-minute expiry, and emails the link via Resend. If it does not match, returns the same "check your email" message (no enumeration).
- `/admin/login/verify?token={plaintext}` hashes the token, looks it up, validates expiry and `used_at IS NULL`, marks `used_at=now`, issues a session.
- Session token: 32 random bytes, stored as `session_id_hash` (SHA-256) in `admin_sessions` with 30-day expiry. Client receives plaintext as an `HttpOnly`, `Secure`, `SameSite=Lax` cookie named `sh_admin_session`.
- Middleware on `/admin/**` (except `/admin/login` and `/admin/login/verify`) validates the session cookie. Invalid or missing → redirect to `/admin/login`.
- `/admin/logout` deletes the session row and clears the cookie.

### 7.2 Submissions view

`/admin/submissions` lists submissions across all three intake tables, sorted by `created_at DESC`.

- Filters: type (all / centre / family / educator), status (all / new / contacted / qualified / archived).
- Search: matches against email and contact/parent/first/last names.
- Pagination: 50 per page.
- Detail view shows all submission fields. For educators, shows document list with signed R2 download URLs (24-hour expiry).
- Status transitions: dropdown with the enum values; saving updates `status` and `updated_at`.

### 7.3 FAQ editor

`/admin/faq` lists FAQ entries grouped by audience tab (centre / family / educator / general).

- Each entry: question (plain text), answer (markdown, rendered with `react-markdown` on the public page), audience, sort_order, published flag.
- Reorder by drag-and-drop within an audience tab.
- Publish/unpublish without delete.

### 7.4 Media library

`/admin/media` lists items in the public media bucket.

- Upload via direct-to-R2 presigned URL pattern (same as educator docs but writing to the public bucket).
- Each item: thumbnail (via Cloudflare Images), original filename, size, copyable public URL, alt text editor, delete button.

## 8. Data Model

See `/drizzle/0000_initial.sql` (to be generated from `src/lib/db/schema.ts`).

### Tables

```
centre_requests           — see Section 6.1 fields, plus id, status, source, ip_hash, created_at, updated_at
family_requests           — see Section 6.2 fields, plus same metadata
educator_applications     — see Section 6.3 fields, plus status, step_completed, source, ip_hash, created_at, updated_at, submitted_at
educator_resume_tokens    — token_hash PK, application_id FK, expires_at, used_at, created_at
educator_documents        — id, application_id FK, doc_type, r2_key, original_filename, mime_type, size_bytes, uploaded_at
admin_magic_links         — token_hash PK, email, expires_at, used_at, created_at
admin_sessions            — session_id_hash PK, email, expires_at, created_at, last_seen_at
faq_entries               — id, audience, question, answer (markdown), sort_order, published, created_at, updated_at
media                     — id, r2_key, original_filename, mime_type, size_bytes, alt_text, width, height, created_at
```

### Indexes

- `centre_requests`: `(status, created_at DESC)`, `(contact_email)`
- `family_requests`: `(status, created_at DESC)`, `(contact_email)`
- `educator_applications`: `(status, created_at DESC)`, `(email)`
- `educator_resume_tokens`: `(application_id)`, `(expires_at)`
- `educator_documents`: `(application_id)`
- `admin_magic_links`: `(expires_at)`
- `admin_sessions`: `(expires_at)`
- `faq_entries`: `(audience, sort_order)`

### Enums (TypeScript unions enforced in Zod + Drizzle CHECK constraints)

- `submission_status`: `'new' | 'contacted' | 'qualified' | 'archived'`
- `educator_status`: `'draft' | 'submitted' | 'shortlisted' | 'interviewed' | 'rejected' | 'archived'`
- `centre_role`: `'cert3' | 'diploma' | 'ect' | 'room_leader' | 'oshc'`
- `family_care_type`: `'after_school' | 'holiday' | 'ad_hoc' | 'overnight'`
- `educator_qualification`: `'cert3' | 'diploma' | 'ect' | 'adv_dip' | 'other'`
- `educator_doc_type`: `'wwcc' | 'first_aid_hltaid012' | 'cert3_diploma' | 'id_document' | 'reference_letter' | 'other'`
- `faq_audience`: `'centre' | 'family' | 'educator' | 'general'`

## 9. Email

Transactional only. Provider: Resend. Templates in `src/lib/email/templates/` as React Email components.

### Templates

| Template | Trigger | Recipient |
|:---|:---|:---|
| `centre-request-ack` | Centre form submit | Submitter |
| `centre-request-notify` | Centre form submit | Founder (`ADMIN_EMAIL`) |
| `family-request-ack` | Family form submit | Submitter |
| `family-request-notify` | Family form submit | Founder |
| `educator-step1-resume` | Educator wizard Step 1 submit | Applicant |
| `educator-submitted-ack` | Educator Step 4 submit | Applicant |
| `educator-submitted-notify` | Educator Step 4 submit | Founder (with signed doc URLs) |
| `admin-magic-link` | Admin login request | Founder |

All emails: plain accessible HTML; brand-consistent header; clear unsubscribe-free transactional footer; reply-to set to founder.

### Sending domain

`mail.safehandsstaffing.com.au` (Resend-verified subdomain). SPF, DKIM, DMARC records configured during deployment. Hard fail on send errors should be logged but must not block the user's flow — the DB row persists either way.

## 10. Security & Privacy

- All public form inputs validated via Zod with strict length and type constraints. No HTML rendered from user input (markdown rendering applies only to FAQ answers entered by founder).
- Educator R2 bucket is private; access only via signed URLs from authenticated admin context (24-hour expiry).
- Public media R2 bucket is publicly readable; uploads gated to admin only.
- IP addresses are hashed with a daily-rotated salt before storage. Raw IPs are never persisted.
- Cookies: only `sh_admin_session` (HttpOnly, Secure, SameSite=Lax) for admin auth, and a `sh_cookie_consent` localStorage flag for the consent banner. No analytics/tracking cookies in v1.
- Privacy policy explicitly lists: what is collected, where it is stored (Cloudflare AU region), retention period (24 months for unactioned submissions, then automatic purge via scheduled Worker), the right to access/delete data, contact details.
- Cron job (Cloudflare Worker cron): nightly at 02:00 AEST — purge expired magic-link tokens, expired resume tokens, expired sessions, and submissions older than 24 months in `archived` status.
- Magic-link tokens and session tokens use cryptographically secure random bytes (`crypto.getRandomValues`).
- Constant-time comparison for email matching in admin login.

## 11. Accessibility

- Target: WCAG 2.2 AA.
- Semantic HTML5 landmarks (`header`, `nav`, `main`, `footer`, `section`).
- All interactive elements keyboard-accessible with visible focus rings.
- All images have meaningful `alt` text or `alt=""` if decorative.
- Forms: every input has an associated `<label>`; errors announced via `aria-live="polite"`.
- Colour contrast minimum 4.5:1 for body text, 3:1 for large text.
- Skip-to-main-content link at top of `<body>`.
- Tested with axe-core via Playwright in CI.

## 12. Deployment & Environment

### Required env vars

```
ADMIN_EMAIL                  # founder email; only address allowed to log in
RESEND_API_KEY               # Resend API key
RESEND_FROM_ADDRESS          # e.g. "no-reply@mail.safehandsstaffing.com.au"
TURNSTILE_SITE_KEY           # public
TURNSTILE_SECRET_KEY         # server-side verification
APP_LOGIN_URL                # optional; if empty, LOG IN button is hidden
SESSION_COOKIE_DOMAIN        # e.g. "safehandsstaffing.com.au"
IP_HASH_SALT_ROTATION        # base salt; daily-rotated salt = HMAC(base, YYYY-MM-DD)
PUBLIC_SITE_URL              # e.g. "https://safehandsstaffing.com.au"
```

### Bindings (wrangler.jsonc)

```
D1:        DB                 → safe-hands-db
R2:        EDUCATOR_DOCS      → safe-hands-educator-docs (private)
R2:        PUBLIC_MEDIA       → safe-hands-public-media (public)
KV:        RATE_LIMITS        → safe-hands-rate-limits
Images:    IMAGES             → (already configured)
Cron:      "0 16 * * *"       → /api/cron/cleanup (16:00 UTC = 02:00 AEST)
```

### CI

- Lint: `pnpm lint`
- Typecheck: `tsc --noEmit`
- Drizzle migration check: `drizzle-kit check`
- Build: `pnpm build`
- Tests: Vitest unit tests for validation schemas + auth utilities; Playwright e2e for the three intake flows
- Deploy: `pnpm deploy` (existing OpenNext setup) on merge to `main`

## 13. Performance Budgets

| Metric | Target |
|:---|:---|
| LCP (home page, 4G) | < 1.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| JS bundle (initial route) | < 100KB gzipped |
| Total transfer (home page) | < 500KB |

Marketing pages are static-first (RSC) and cached at the Cloudflare edge. Hero images served via Cloudflare Images with appropriate `srcset` and `loading` strategies.

## 14. Testing Strategy

- **Unit (Vitest):** Zod schemas; magic-link token generation/validation; rate-limit logic; signed R2 URL helpers.
- **Integration (Vitest with miniflare):** D1 queries; Server Actions with mocked Resend and Turnstile.
- **E2E (Playwright):** the three intake flows happy paths; educator wizard resume; admin login → submission view → status transition; accessibility scans on all public pages.
- **Manual:** copy review by founder before launch; visual regression via screenshot comparison on key pages.

## 15. Visual Design

Design language is deliberately distinct from YNA's blue-grey institutional look. To be defined in a follow-up brainstorm focused on visual design (palette, typography, imagery). Functional structure in this spec is design-agnostic — all layouts use semantic HTML and Tailwind so a design pass can change appearance without touching logic.

## 16. Open Questions

None at spec-completion time. All previously-open architectural questions resolved during brainstorming:

- ~~CMS scope~~ → No CMS for page copy; FAQ + media only.
- ~~Email provider~~ → Resend.
- ~~Admin auth~~ → Magic link.
- ~~File upload mechanism~~ → Direct-to-R2 via presigned URLs.
- ~~Submission redirect to platform~~ → No redirect; manual qualification via `/admin`.
- ~~Schema relations to other systems~~ → None; this project is self-contained.

## 17. Acceptance Checklist

Spec 1 ships when:

- [ ] All 10 public pages render with the documented content.
- [ ] All 3 intake forms persist to D1 and trigger the documented emails.
- [ ] Educator wizard works end-to-end including resume-by-email.
- [ ] Admin portal accessible only via magic link; all three submission types listable with status transitions.
- [ ] FAQ editor functional; published entries appear on `/faq`.
- [ ] Media library functional; uploaded images usable on public pages.
- [ ] Turnstile gates every public form.
- [ ] All env vars documented in `README.md` and `.dev.vars.example`.
- [ ] Drizzle migrations apply cleanly to a fresh D1 instance.
- [ ] Performance budgets in Section 13 met on a Lighthouse run.
- [ ] WCAG AA scan passes on all public pages.
- [ ] Privacy policy, terms, cookie banner present and accurate.
- [ ] Deployed to production Cloudflare account with custom domain.
