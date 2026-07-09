import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/marketing/Header";

describe("Header", () => {
	it("renders the brand name", () => {
		render(<Header appLoginUrl="" />);
		// Home/brand link — distinguish from phone link by href
		const links = screen.getAllByRole("link", { name: /safe hands/i });
		const brand = links.find((l) => l.getAttribute("href") === "/");
		expect(brand).toBeDefined();
		expect(brand).toHaveTextContent(/safe hands/i);
	});

	it("renders the phone CTA with tel: href", () => {
		render(<Header appLoginUrl="" />);
		const link = screen.getByRole("link", { name: /1300/ });
		expect(link).toHaveAttribute("href", expect.stringMatching(/^tel:/));
	});

	it("renders the Access the app button when appLoginUrl is set", () => {
		render(<Header appLoginUrl="https://app.safehandsstaffing.com.au" />);
		expect(screen.getByRole("link", { name: /access the app/i })).toHaveAttribute(
			"href",
			"https://app.safehandsstaffing.com.au",
		);
	});

	it("hides the Access the app button when appLoginUrl is empty", () => {
		render(<Header appLoginUrl="" />);
		expect(screen.queryByRole("link", { name: /access the app/i })).toBeNull();
	});

	it("renders the three audience nav links", () => {
		render(<Header appLoginUrl="" />);
		expect(screen.getByRole("link", { name: /for centres/i })).toHaveAttribute(
			"href",
			"/for-centres",
		);
		expect(screen.getByRole("link", { name: /for families/i })).toHaveAttribute(
			"href",
			"/for-families",
		);
		expect(screen.getByRole("link", { name: /for educators/i })).toHaveAttribute(
			"href",
			"/for-educators",
		);
	});
});
