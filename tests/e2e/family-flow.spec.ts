import { test, expect } from "@playwright/test";

test("family booking — happy path", async ({ page }) => {
	await page.goto("/for-families/request");
	await page.getByLabel(/your name/i).fill("Sam Lee");
	await page.getByLabel(/email/i).fill("sam@example.com");
	await page.getByLabel(/phone/i).fill("0400123456");
	await page.getByLabel(/suburb/i).fill("Newtown");
	await page.getByLabel(/postcode/i).fill("2042");
	await page.getByLabel(/number of children/i).fill("2");
	await page.getByLabel(/children.*ages/i).fill("3,7");
	await page.getByLabel(/care type/i).selectOption("after_school");
	await page.getByLabel(/shift date/i).fill("2026-07-10");
	await page.getByLabel(/shift start/i).fill("15:00");
	await page.getByLabel(/duration/i).fill("3");
	await page.getByLabel(/privacy policy/i).check();
	await page.waitForTimeout(1500);
	await page.getByRole("button", { name: /submit request/i }).click();
	await expect(page).toHaveURL(/\/for-families\/request\/thank-you/);
});
