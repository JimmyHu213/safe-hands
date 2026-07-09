import { test } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";

/**
 * Lighthouse perf audit on the home page.
 *
 * Skipped by default — Lighthouse requires Chromium launched with
 * --remote-debugging-port and a single worker, which conflicts with the
 * parallel page-render suite. Run on demand:
 *
 *   PERF=1 PLAYWRIGHT_PORT=3100 npx playwright test tests/e2e/perf-public.spec.ts --workers=1
 *
 * Thresholds are intentionally conservative against the spec's targets:
 *   performance ≥ 80, accessibility ≥ 95, best-practices ≥ 90, SEO ≥ 90
 */

const PERF_ENABLED = process.env.PERF === "1";

test.describe("Lighthouse perf budgets", () => {
	test.skip(!PERF_ENABLED, "Set PERF=1 to run Lighthouse audit");

	test("home page meets perf budget", async ({ page, browserName }) => {
		test.skip(browserName !== "chromium", "Lighthouse runs in Chromium only");
		await page.goto("/");
		await playAudit({
			page,
			thresholds: {
				performance: 80,
				accessibility: 95,
				"best-practices": 90,
				seo: 90,
			},
			port: 9222,
		});
	});
});
