import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieBanner } from "@/components/marketing/CookieBanner";

describe("CookieBanner", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("renders when no consent is stored", () => {
		render(<CookieBanner />);
		expect(
			screen.getByRole("button", { name: /accept/i }),
		).toBeInTheDocument();
	});

	it("does not render when consent is already stored", () => {
		localStorage.setItem("bb_cookie_consent", "1");
		render(<CookieBanner />);
		expect(screen.queryByRole("button", { name: /accept/i })).toBeNull();
	});

	it("dismisses and persists consent on Accept", async () => {
		const user = userEvent.setup();
		render(<CookieBanner />);
		await user.click(screen.getByRole("button", { name: /accept/i }));
		expect(localStorage.getItem("bb_cookie_consent")).toBe("1");
		expect(screen.queryByRole("button", { name: /accept/i })).toBeNull();
	});
});
