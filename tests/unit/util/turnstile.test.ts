import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyTurnstile } from "@/lib/util/turnstile";

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when API responds success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }),
    );
    const ok = await verifyTurnstile({ token: "tok", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(true);
  });

  it("returns false when API responds failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
      }),
    );
    const ok = await verifyTurnstile({ token: "tok", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(false);
  });

  it("returns false on network error (fails closed)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const ok = await verifyTurnstile({ token: "tok", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(false);
  });

  it("returns false when token is missing", async () => {
    const ok = await verifyTurnstile({ token: "", remoteIp: "1.2.3.4", secret: "s" });
    expect(ok).toBe(false);
  });
});
