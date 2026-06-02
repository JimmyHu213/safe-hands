import { test, expect } from "@playwright/test";

test("centre booking — happy path", async ({ page }) => {
	await page.goto("/for-centres/request");
	await page.getByLabel(/centre name/i).fill("Sunny Days ELC");
	await page.getByLabel(/your name/i).fill("Jane Smith");
	await page.getByLabel(/email/i).fill("jane@sunny.example");
	await page.getByLabel(/phone/i).fill("0400123456");
	await page.getByLabel(/suburb/i).fill("Parramatta");
	await page.getByLabel(/postcode/i).fill("2150");
	await page.getByLabel(/role needed/i).selectOption("cert3");
	await page.getByLabel(/shift date/i).fill("2026-07-10");
	await page.getByLabel(/shift start/i).fill("07:30");
	await page.getByLabel(/duration/i).fill("8");
	await page.getByLabel(/privacy policy/i).check();
	// Turnstile test key auto-passes — give the widget a moment to mount and stamp the hidden token field.
	await page.waitForTimeout(1500);
	await page.getByRole("button", { name: /submit request/i }).click();
	await expect(page).toHaveURL(/\/for-centres\/request\/thank-you/);
	await expect(page.getByRole("heading", { level: 1 })).toContainText(/thanks/i);
});
