import { describe, it, expect } from "vitest";
import { hashIp, dailySalt } from "@/lib/util/ip-hash";

describe("hashIp", () => {
  const base = "base-salt-of-at-least-32-chars!!";

  it("produces a hex digest", async () => {
    const h = await hashIp("203.0.113.1", new Date("2026-06-02T12:00:00Z"), base);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for same ip+date+base", async () => {
    const d = new Date("2026-06-02T08:00:00Z");
    const a = await hashIp("203.0.113.1", d, base);
    const b = await hashIp("203.0.113.1", d, base);
    expect(a).toBe(b);
  });

  it("differs across days", async () => {
    const a = await hashIp("203.0.113.1", new Date("2026-06-02T00:00:00Z"), base);
    const b = await hashIp("203.0.113.1", new Date("2026-06-03T00:00:00Z"), base);
    expect(a).not.toBe(b);
  });

  it("differs across IPs", async () => {
    const d = new Date("2026-06-02T00:00:00Z");
    expect(await hashIp("203.0.113.1", d, base)).not.toBe(await hashIp("203.0.113.2", d, base));
  });
});

describe("dailySalt", () => {
  it("rotates by UTC day boundary", async () => {
    const base = "test-base-salt";
    const a = await dailySalt(new Date("2026-06-02T23:59:00Z"), base);
    const b = await dailySalt(new Date("2026-06-03T00:00:00Z"), base);
    expect(a).not.toBe(b);
  });
});
