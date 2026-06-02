import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/marketing/Footer";

describe("Footer", () => {
	it("renders the current year in copyright", () => {
		render(<Footer />);
		const year = new Date().getFullYear();
		expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
	});

	it("renders the Acknowledgement of Country", () => {
		render(<Footer />);
		expect(
			screen.getByLabelText(/Acknowledgement of Country/i),
		).toBeInTheDocument();
	});

	it("renders Privacy and Terms links", () => {
		render(<Footer />);
		expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute(
			"href",
			"/legal/privacy",
		);
		expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute(
			"href",
			"/legal/terms",
		);
	});
});
