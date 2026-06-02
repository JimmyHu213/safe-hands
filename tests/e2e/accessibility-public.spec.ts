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
