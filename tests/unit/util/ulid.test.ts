import { describe, it, expect } from "vitest";
import { newId } from "@/lib/util/ulid";

describe("newId", () => {
  it("returns a 26-char string", () => {
    const id = newId();
    expect(id).toMatch(/^[0-9A-Za-z_-]{26}$/);
  });

  it("generates unique IDs across 1000 calls", () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) ids.add(newId());
    expect(ids.size).toBe(1000);
  });

  it("returns lexicographically-sortable IDs across time", async () => {
    const a = newId();
    await new Promise((r) => setTimeout(r, 5));
    const b = newId();
    expect(a < b).toBe(true);
  });
});
