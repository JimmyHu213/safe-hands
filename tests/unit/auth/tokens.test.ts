import { describe, it, expect } from "vitest";
import { generateToken, hashToken, constantTimeEqual } from "@/lib/auth/tokens";

describe("generateToken", () => {
  it("returns a URL-safe base64 string of expected length", () => {
    const t = generateToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(t.length).toBeGreaterThanOrEqual(40); // 32 bytes -> 43 chars base64url
  });

  it("returns unique tokens across 100 calls", () => {
    const set = new Set();
    for (let i = 0; i < 100; i++) set.add(generateToken());
    expect(set.size).toBe(100);
  });
});

describe("hashToken", () => {
  it("returns a deterministic SHA-256 hex digest", async () => {
    const a = await hashToken("hello");
    const b = await hashToken("hello");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different digests for different inputs", async () => {
    expect(await hashToken("a")).not.toBe(await hashToken("b"));
  });
});

describe("constantTimeEqual", () => {
  it("returns true for equal strings", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
  });
  it("returns false for unequal strings", () => {
    expect(constantTimeEqual("abc", "abd")).toBe(false);
  });
  it("returns false for different lengths", () => {
    expect(constantTimeEqual("abc", "abcd")).toBe(false);
  });
});
