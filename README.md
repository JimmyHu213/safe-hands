# Safe Hands Staffing Agency

Marketing and intake website for Safe Hands Staffing Agency Pty Ltd — built on Next.js 16 + Cloudflare Workers via OpenNext.

The current scope (Spec 1) ships a public marketing site, three audience-specific intake flows (centre booking, family booking, educator multi-step application), and a magic-link-gated `/admin` portal for the founder.

Source documents:

- Spec: [`docs/specs/2026-05-28-spec1-marketing-intake-design.md`](docs/specs/2026-05-28-spec1-marketing-intake-design.md)
- Phase plans: [`docs/plans/`](docs/plans/)

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars  # fill in values
npm run dev
```

Visit <http://localhost:3000>.

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
npx drizzle-kit generate                                        # generate SQL from src/lib/db/schema.ts
npx wrangler d1 migrations apply safe-hands-db --local          # apply to local D1
npx wrangler d1 migrations apply safe-hands-db --remote         # apply to production D1
```

## Tests

```bash
npx vitest run            # unit + integration tests
npx tsc --noEmit          # typecheck
npx playwright test       # end-to-end (page-render, a11y, intake flows)
```

### Running E2E tests locally

The Playwright intake-flow suite uses Cloudflare Turnstile's "always passes" **test keys** to bypass interactive challenges. Set these in your `.dev.vars` before running `npx playwright test`:

```
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
RESEND_API_KEY=re_test_<your_resend_test_key>
RESEND_FROM_ADDRESS=onboarding@resend.dev
ADMIN_EMAIL=<your-real-inbox-for-receiving-test-notifies>
PUBLIC_SITE_URL=http://localhost:3100
```

The Resend test API key sends real emails to a sandbox — no production emails are dispatched. The page-render and a11y suites (Phase 2) do not require these.

The educator wizard E2E test also requires the R2 bindings (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) and an actual `EDUCATOR_DOCS` bucket — without them, the document-upload step will fail.

## Deploy

```bash
npm run deploy            # opennextjs-cloudflare build + deploy
```

See the Phase 4 plan for the full production deployment runbook.
