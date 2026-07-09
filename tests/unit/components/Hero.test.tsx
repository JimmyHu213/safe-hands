import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hero } from "@/components/marketing/Hero";
import { LANDING } from "@/lib/cms/content";

describe("Hero", () => {
	it("renders the H1 from content module", () => {
		render(<Hero />);
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(LANDING.hero.h1);
	});

	it("renders the hero image", () => {
		render(<Hero />);
		expect(screen.getByRole("img")).toBeInTheDocument();
	});

	it("renders the three audience chips", () => {
		render(<Hero />);
		for (const chip of LANDING.hero.chips) {
			expect(screen.getByRole("button", { name: chip.label })).toBeInTheDocument();
		}
	});

	it("shows the family CTA by default", () => {
		render(<Hero />);
		expect(screen.getByRole("link", { name: /request an educator/i })).toHaveAttribute(
			"href",
			"/for-families/request",
		);
	});

	it("switches hint and CTA when a chip is clicked", async () => {
		const user = userEvent.setup();
		render(<Hero />);
		await user.click(screen.getByRole("button", { name: "Educator Professional" }));
		expect(screen.getByRole("link", { name: /join as an educator/i })).toHaveAttribute(
			"href",
			"/for-educators/apply",
		);
	});
});
