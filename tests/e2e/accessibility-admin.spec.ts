import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/admin", "/admin/submissions", "/admin/faq", "/admin/media"];

for (const path of PAGES) {
	test(`${path} has no WCAG AA violations`, async ({ page }) => {
		// dev-only test helper bypasses magic-link email
		const r = await page.request.post("/admin/login/test-session");
		expect(r.ok()).toBe(true);
		await page.goto(path);
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21aa"])
			.analyze();
		expect(results.violations).toEqual([]);
	});
}
