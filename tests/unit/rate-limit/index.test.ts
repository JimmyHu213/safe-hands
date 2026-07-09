import { describe, it, expect, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

function fakeKv(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    put: vi.fn(async (k: string, v: string, _opts?: unknown) => {
      store.set(k, v);
    }),
    delete: vi.fn(async (k: string) => {
      store.delete(k);
    }),
  } as unknown as KVNamespace;
}

describe("checkRateLimit", () => {
  it("allows the first N requests within the window", async () => {
    const kv = fakeKv();
    for (let i = 0; i < 10; i++) {
      const r = await checkRateLimit(kv, "centre:hash123", 10, 86400);
      expect(r.allowed).toBe(true);
    }
  });

  it("blocks the (N+1)th request", async () => {
    const kv = fakeKv({ "rl:centre:hash123": "10" });
    const r = await checkRateLimit(kv, "centre:hash123", 10, 86400);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("uses the supplied namespace prefix", async () => {
    const kv = fakeKv();
    await checkRateLimit(kv, "family:hashX", 5, 60);
    expect(kv.put).toHaveBeenCalledWith(
      "rl:family:hashX",
      expect.any(String),
      expect.objectContaining({ expirationTtl: 60 }),
    );
  });
});
