import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hero } from "@/components/marketing/Hero";
import { LANDING } from "@/lib/cms/content";

describe("Hero", () => {
	it("renders the H1 from content module", () => {
		render(<Hero />);
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/trusted childcare staff/i);
	});

	it("renders the hero image", () => {
		render(<Hero />);
		expect(screen.getByRole("img")).toBeInTheDocument();
	});

	it("renders three tabs in a tablist", () => {
		render(<Hero />);
		expect(screen.getByRole("tablist", { name: /i am a/i })).toBeInTheDocument();
		expect(screen.getAllByRole("tab")).toHaveLength(3);
		for (const chip of LANDING.hero.chips) {
			expect(screen.getByRole("tab", { name: chip.label })).toBeInTheDocument();
		}
	});

	it("shows the family CTA by default", () => {
		render(<Hero />);
		expect(screen.getByRole("link", { name: /request an educator/i })).toHaveAttribute(
			"href",
			"/for-families/request",
		);
	});

	it("swaps hint and CTA when a tab is clicked", async () => {
		const user = userEvent.setup();
		render(<Hero />);
		await user.click(screen.getByRole("tab", { name: "Educator Professional" }));
		expect(screen.getByRole("link", { name: /join as an educator/i })).toHaveAttribute(
			"href",
			"/for-educators/apply",
		);
	});
});
