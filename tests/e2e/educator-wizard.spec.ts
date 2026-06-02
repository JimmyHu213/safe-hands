import { test, expect } from "@playwright/test";

test("educator application — full wizard", async ({ page }) => {
	// step 1
	await page.goto("/for-educators/apply");
	await page.getByLabel(/first name/i).fill("Alex");
	await page.getByLabel(/last name/i).fill("Park");
	await page.getByLabel(/email/i).fill(`alex+${Date.now()}@example.com`);
	await page.getByLabel(/phone/i).fill("0400111222");
	await page.getByLabel(/suburb/i).fill("Marrickville");
	await page.getByLabel(/postcode/i).fill("2204");
	await page.getByLabel(/privacy policy/i).check();
	await page.waitForTimeout(1500);
	await page.getByRole("button", { name: /save and continue/i }).click();
	await expect(page).toHaveURL(/\/step-2$/);

	// step 2
	await page.getByLabel(/highest qualification/i).selectOption("diploma");
	await page.getByLabel(/years of experience/i).fill("4");
	await page.getByLabel(/travel radius/i).fill("10");
	await page.getByRole("checkbox", { name: /own transport/i }).check();
	await page.getByRole("button", { name: /save and continue/i }).click();
	await expect(page).toHaveURL(/\/step-3$/);

	// step 3 — upload three mandatory docs
	const fileInputs = page.locator(`input[type="file"]`);
	await fileInputs.nth(0).setInputFiles("tests/fixtures/sample.pdf"); // wwcc
	await expect(page.getByText(/uploaded/i).first()).toBeVisible({ timeout: 15_000 });
	await fileInputs.nth(1).setInputFiles("tests/fixtures/sample.pdf"); // first aid
	await expect(page.getByText(/uploaded/i).nth(1)).toBeVisible({ timeout: 15_000 });
	await fileInputs.nth(2).setInputFiles("tests/fixtures/sample.pdf"); // cert3
	await expect(page.getByText(/uploaded/i).nth(2)).toBeVisible({ timeout: 15_000 });
	await page.getByRole("button", { name: /continue to review/i }).click();
	await expect(page).toHaveURL(/\/step-4$/);

	// step 4
	await expect(page.getByText(/Alex Park/i)).toBeVisible();
	await page.getByRole("button", { name: /submit application/i }).click();
	await expect(page).toHaveURL(/\/thank-you$/);
});
