import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHero } from "@/components/marketing/PageHero";

describe("PageHero", () => {
	it("renders the eyebrow, title, and lede", () => {
		render(<PageHero eyebrow="About" title="Our story" lede="A short lede." />);
		expect(screen.getByText("About")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "Our story" })).toBeInTheDocument();
		expect(screen.getByText("A short lede.")).toBeInTheDocument();
	});

	it("renders without eyebrow or lede", () => {
		render(<PageHero title="Just a title" />);
		expect(screen.getByRole("heading", { level: 1, name: "Just a title" })).toBeInTheDocument();
	});
});
