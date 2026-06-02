import { test, expect } from "@playwright/test";

const PAGES = [
	{ path: "/", h1: /reliable/i },
	{ path: "/for-centres", h1: /same-day ratio cover/i },
	{ path: "/for-families", h1: /vetted in-home/i },
	{ path: "/for-educators", h1: /flexible shifts/i },
	{ path: "/about", h1: /built by someone/i },
	{ path: "/compliance", h1: /compliance is the product/i },
	{ path: "/contact", h1: /get in touch/i },
	{ path: "/faq", h1: /frequently asked questions/i },
	{ path: "/legal/privacy", h1: /privacy policy/i },
	{ path: "/legal/terms", h1: /terms of use/i },
];

for (const p of PAGES) {
	test(`${p.path} renders with the expected H1`, async ({ page }) => {
		await page.goto(p.path);
		await expect(page.getByRole("heading", { level: 1 })).toContainText(p.h1);
	});
}

test("home page has three audience cards", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("link", { name: /centre/i }).first()).toBeVisible();
	await expect(page.getByRole("link", { name: /family/i }).first()).toBeVisible();
	await expect(page.getByRole("link", { name: /educator/i }).first()).toBeVisible();
});
