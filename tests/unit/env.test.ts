import { describe, it, expect } from "vitest";
import { envSchema } from "@/lib/env";

describe("envSchema", () => {
  const validEnv = {
    ADMIN_EMAIL: "founder@safehandsstaffing.com.au",
    RESEND_API_KEY: "re_test_123",
    RESEND_FROM_ADDRESS: "no-reply@mail.safehandsstaffing.com.au",
    TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    SESSION_COOKIE_DOMAIN: "safehandsstaffing.com.au",
    IP_HASH_SALT_ROTATION: "base-salt-value-32-chars-or-more!",
    PUBLIC_SITE_URL: "https://safehandsstaffing.com.au",
    R2_ACCOUNT_ID: "test_account_id",
    R2_ACCESS_KEY_ID: "test_access_key",
    R2_SECRET_ACCESS_KEY: "test_secret_key",
  };

  it("accepts a complete env block", () => {
    expect(() => envSchema.parse(validEnv)).not.toThrow();
  });

  it("rejects missing ADMIN_EMAIL", () => {
    const { ADMIN_EMAIL, ...rest } = validEnv;
    expect(() => envSchema.parse(rest)).toThrow();
  });

  it("rejects malformed PUBLIC_SITE_URL", () => {
    expect(() => envSchema.parse({ ...validEnv, PUBLIC_SITE_URL: "not-a-url" })).toThrow();
  });

  it("allows empty APP_LOGIN_URL (optional)", () => {
    expect(() => envSchema.parse(validEnv)).not.toThrow();
  });

  it("rejects IP_HASH_SALT_ROTATION shorter than 32 chars", () => {
    expect(() => envSchema.parse({ ...validEnv, IP_HASH_SALT_ROTATION: "short" })).toThrow();
  });
});
