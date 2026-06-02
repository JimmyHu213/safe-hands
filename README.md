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

### First-time production setup

1. **Enable R2** in the [Cloudflare dashboard](https://dash.cloudflare.com/) (one-time ToS acceptance), then create the two buckets:
   ```bash
   npx wrangler r2 bucket create safe-hands-educator-docs
   npx wrangler r2 bucket create safe-hands-public-media
   ```
   Add them to `wrangler.jsonc` under `r2_buckets` with bindings `EDUCATOR_DOCS` and `PUBLIC_MEDIA`.

2. **Apply migrations** to the production D1:
   ```bash
   npx wrangler d1 migrations apply safe-hands-db --remote
   ```

3. **Provision an R2 API token** (Cloudflare dashboard → R2 → Manage R2 API Tokens). Grants needed: Object Read & Write on both buckets. Capture the Access Key ID and Secret Access Key.

4. **Verify Resend sending domain**: in the [Resend dashboard](https://resend.com/domains), add `mail.safehandsstaffing.com.au`. Add the SPF, DKIM, and DMARC DNS records Resend generates to Cloudflare DNS. Wait for verification.

5. **Configure Turnstile**: in the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile), create a site for `safehandsstaffing.com.au`. Capture the site key (public) and secret key.

6. **Set all Worker secrets** (paste values when prompted):
   ```bash
   npx wrangler secret put ADMIN_EMAIL
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put RESEND_FROM_ADDRESS
   npx wrangler secret put TURNSTILE_SITE_KEY
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put APP_LOGIN_URL          # leave empty to hide nav LOG IN
   npx wrangler secret put SESSION_COOKIE_DOMAIN  # e.g. safehandsstaffing.com.au
   npx wrangler secret put IP_HASH_SALT_ROTATION  # any 32+ char random string
   npx wrangler secret put PUBLIC_SITE_URL        # https://safehandsstaffing.com.au
   npx wrangler secret put R2_ACCOUNT_ID
   npx wrangler secret put R2_ACCESS_KEY_ID
   npx wrangler secret put R2_SECRET_ACCESS_KEY
   npx wrangler secret put CRON_SECRET            # any 32+ char random string
   ```

7. **Deploy**:
   ```bash
   npm run deploy
   ```

8. **Add custom domain**: in the Worker overview → Custom Domains → add `safehandsstaffing.com.au` (Cloudflare proxy enabled).

9. **Smoke test**: visit `https://safehandsstaffing.com.au/`. Submit a centre booking with your own email; confirm the founder receives the notify and the submitter receives the ack. Then visit `/admin/login`, enter `ADMIN_EMAIL`, follow the magic link, and verify the submission appears in the dashboard.

### Subsequent deploys

```bash
# Generate + apply migration if the Drizzle schema changed:
npx drizzle-kit generate
npx wrangler d1 migrations apply safe-hands-db --remote

# Then ship:
npm run deploy
```

### Rollback

```bash
npx wrangler deployments list
npx wrangler rollback <deployment-id>
```

## Performance audit

Run on demand (skipped by default — Lighthouse requires Chromium with a remote-debugging port and breaks parallelism):

```bash
PERF=1 PLAYWRIGHT_PORT=3100 npx playwright test tests/e2e/perf-public.spec.ts --workers=1
```

Thresholds: performance ≥ 80, accessibility ≥ 95, best-practices ≥ 90, SEO ≥ 90.
