import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/marketing/Hero";

describe("Hero", () => {
  it("renders the H1 from content module", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders three audience cards as links", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /centre/i })).toHaveAttribute("href", "/for-centres");
    expect(screen.getByRole("link", { name: /family/i })).toHaveAttribute("href", "/for-families");
    expect(screen.getByRole("link", { name: /educator/i })).toHaveAttribute("href", "/for-educators");
  });
});
