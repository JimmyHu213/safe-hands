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
```

## Deploy

```bash
npm run deploy            # opennextjs-cloudflare build + deploy
```

See the Phase 4 plan for the full production deployment runbook.
