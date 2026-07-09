import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
		// Remote-debugging port lets the Lighthouse perf audit attach to Chromium.
		// Harmless for normal Playwright runs.
		launchOptions: { args: ["--remote-debugging-port=9222"] },
	},
	webServer: {
		command: `npm run dev -- --port ${PORT}`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
