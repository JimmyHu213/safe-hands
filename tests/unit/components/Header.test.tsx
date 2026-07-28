import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Header } from "@/components/marketing/Header";

function setViewportWidth(width: number) {
	Object.defineProperty(window, "innerWidth", {
		writable: true,
		configurable: true,
		value: width,
	});
}

describe("Header", () => {
	afterEach(() => {
		cleanup();
		setViewportWidth(1024);
	});

	it("renders the brand name", () => {
		render(<Header appLoginUrl="" />);
		// Home/brand link — distinguish from other links by href
		const links = screen.getAllByRole("link", { name: /bee bright/i });
		const brand = links.find((l) => l.getAttribute("href") === "/");
		expect(brand).toBeDefined();
		expect(brand).toHaveTextContent(/bee bright/i);
	});

	it("renders the Request an Educator CTA", () => {
		render(<Header appLoginUrl="" />);
		expect(screen.getByRole("link", { name: /request an educator/i })).toHaveAttribute(
			"href",
			"/for-families/request",
		);
	});

	it("renders the Access the app link when appLoginUrl is set", () => {
		render(<Header appLoginUrl="https://app.beebrightstaffing.com" />);
		expect(screen.getByRole("link", { name: /access the app/i })).toHaveAttribute(
			"href",
			"https://app.beebrightstaffing.com",
		);
	});

	it("hides the Access the app link when appLoginUrl is empty", () => {
		render(<Header appLoginUrl="" />);
		expect(screen.queryByRole("link", { name: /access the app/i })).toBeNull();
	});

	it("renders the three audience nav links", () => {
		render(<Header appLoginUrl="" />);
		expect(screen.getByRole("link", { name: /childcare centres/i })).toHaveAttribute(
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

	it("renders the How it works and About nav links", () => {
		render(<Header appLoginUrl="" />);
		expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute(
			"href",
			"/#how",
		);
		expect(screen.getByRole("link", { name: /^about$/i })).toHaveAttribute("href", "/about");
	});

	it("does not render the mobile menu button on desktop widths", () => {
		setViewportWidth(1024);
		render(<Header appLoginUrl="" />);
		expect(screen.queryByRole("button", { name: /open menu/i })).toBeNull();
	});

	it("renders the mobile menu button below the mobile breakpoint and toggles the menu", () => {
		setViewportWidth(500);
		render(<Header appLoginUrl="" />);

		const menuButton = screen.getByRole("button", { name: /open menu/i });

		// Menu is closed initially — nav links not present.
		expect(screen.queryByRole("link", { name: /how it works/i })).toBeNull();

		fireEvent.click(menuButton);

		// Menu is open — nav links + CTA appear.
		expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute(
			"href",
			"/#how",
		);
		expect(screen.getByRole("link", { name: /request an educator/i })).toHaveAttribute(
			"href",
			"/for-families/request",
		);

		// Clicking a nav link closes the menu.
		fireEvent.click(screen.getByRole("link", { name: /how it works/i }));
		expect(screen.queryByRole("link", { name: /how it works/i })).toBeNull();
	});
});
