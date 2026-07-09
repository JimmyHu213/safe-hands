import { test, expect } from "@playwright/test";

test("admin login bypass → dashboard → submissions list", async ({ page }) => {
	// dev-only test helper bypasses magic-link email. Use page.request so the
	// Set-Cookie response is stored in the page's browser context.
	const sessionRes = await page.request.post("/admin/login/test-session");
	expect(sessionRes.ok()).toBe(true);

	await page.goto("/admin");
	await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

	// nav reachable
	await page.getByRole("link", { name: /submissions/i }).click();
	await expect(page).toHaveURL(/\/admin\/submissions/);
	await expect(page.getByRole("heading", { name: /^submissions$/i })).toBeVisible();

	await page.getByRole("link", { name: /faq/i }).click();
	await expect(page).toHaveURL(/\/admin\/faq/);
	await expect(page.getByRole("heading", { name: /^faq$/i })).toBeVisible();

	await page.getByRole("link", { name: /media/i }).click();
	await expect(page).toHaveURL(/\/admin\/media/);
	await expect(page.getByRole("heading", { name: /^media$/i })).toBeVisible();
});

test("admin without session redirects to /admin/login", async ({ page, context }) => {
	// clear any sessions from previous tests
	await context.clearCookies();
	await page.goto("/admin");
	await expect(page).toHaveURL(/\/admin\/login/);
});
