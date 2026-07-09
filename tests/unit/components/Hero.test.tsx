import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/marketing/Hero";

describe("Hero", () => {
  it("renders the H1 from content module", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders the hero banner image", () => {
    render(<Hero />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders three audience cards as links", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /centre/i })).toHaveAttribute("href", "/for-centres");
    expect(screen.getByRole("link", { name: /family/i })).toHaveAttribute("href", "/for-families");
    expect(screen.getByRole("link", { name: /educator/i })).toHaveAttribute("href", "/for-educators");
  });

  it("renders the Access the app CTA when appLoginUrl is set", () => {
    render(<Hero appLoginUrl="https://app.safehandsstaffing.com.au" />);
    expect(screen.getByRole("link", { name: /access the app/i })).toHaveAttribute(
      "href",
      "https://app.safehandsstaffing.com.au",
    );
  });

  it("hides the Access the app CTA when appLoginUrl is empty", () => {
    render(<Hero />);
    expect(screen.queryByRole("link", { name: /access the app/i })).toBeNull();
  });
});
