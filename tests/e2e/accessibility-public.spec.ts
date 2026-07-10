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
			// Decorative step-number watermark (e.g. "01") behind the HowItWorks
			// card icons: aria-hidden, redundant with the visible heading/order,
			// and intentionally low-contrast per the reference design. WCAG 1.4.3
			// exempts purely decorative/incidental text; axe can't infer that
			// automatically, so it's excluded explicitly here.
			.exclude(".sh-decorative-numeral")
			.analyze();
		expect(results.violations).toEqual([]);
	});
}
