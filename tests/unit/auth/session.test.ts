import { describe, it, expect } from "vitest";
import { SESSION_COOKIE_NAME, buildSessionCookie, parseSessionCookie } from "@/lib/auth/session";

describe("buildSessionCookie", () => {
  it("returns a Set-Cookie value with HttpOnly, Secure, SameSite=Lax", () => {
    const v = buildSessionCookie({
      token: "abc",
      domain: "beebrightstaffing.com",
      maxAgeSeconds: 60,
    });
    expect(v).toContain(`${SESSION_COOKIE_NAME}=abc`);
    expect(v).toContain("HttpOnly");
    expect(v).toContain("Secure");
    expect(v).toContain("SameSite=Lax");
    expect(v).toContain("Domain=beebrightstaffing.com");
    expect(v).toContain("Max-Age=60");
    expect(v).toContain("Path=/");
  });

  it("clears the cookie when token is empty", () => {
    const v = buildSessionCookie({ token: "", domain: "example.com", maxAgeSeconds: 0 });
    expect(v).toContain("Max-Age=0");
  });
});

describe("parseSessionCookie", () => {
  it("extracts the session token from a Cookie header", () => {
    const h = `other=foo; ${SESSION_COOKIE_NAME}=tok_value; bar=baz`;
    expect(parseSessionCookie(h)).toBe("tok_value");
  });
  it("returns null when no session cookie present", () => {
    expect(parseSessionCookie("other=foo")).toBeNull();
  });
  it("returns null for empty header", () => {
    expect(parseSessionCookie("")).toBeNull();
    expect(parseSessionCookie(null)).toBeNull();
  });
});
