import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageBanner } from "@/components/marketing/PageBanner";

describe("PageBanner", () => {
  it("renders an image with the given alt text", () => {
    render(
      <PageBanner
        src="https://images.unsplash.com/photo-test"
        alt="A bright early-learning room"
      />,
    );
    const img = screen.getByRole("img", { name: /bright early-learning room/i });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("unsplash");
  });
});
