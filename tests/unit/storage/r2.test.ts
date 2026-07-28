import { describe, it, expect } from "vitest";
import { presignPutUrl, presignGetUrl } from "@/lib/storage/r2";

describe("presignPutUrl", () => {
  it("returns a URL string pointing at the bucket+key", async () => {
    const url = await presignPutUrl({
      accountId: "acct123",
      accessKeyId: "k",
      secretAccessKey: "s",
      bucket: "beebrightstaffing-educator-docs",
      key: "educator-docs/app_1/wwcc-x.pdf",
      contentType: "application/pdf",
      expiresInSeconds: 300,
    });
    expect(url).toContain("beebrightstaffing-educator-docs");
    expect(url).toContain("educator-docs/app_1/wwcc-x.pdf");
    expect(url).toMatch(/X-Amz-(Signature|Expires|Credential)/);
  });

  it("rejects expires > 7 days", async () => {
    await expect(
      presignPutUrl({
        accountId: "a",
        accessKeyId: "k",
        secretAccessKey: "s",
        bucket: "b",
        key: "k",
        contentType: "application/pdf",
        expiresInSeconds: 8 * 86400,
      }),
    ).rejects.toThrow();
  });
});

describe("presignGetUrl", () => {
  it("returns a signed GET URL", async () => {
    const url = await presignGetUrl({
      accountId: "acct123",
      accessKeyId: "k",
      secretAccessKey: "s",
      bucket: "beebrightstaffing-educator-docs",
      key: "educator-docs/app_1/wwcc-x.pdf",
      expiresInSeconds: 3600,
    });
    expect(url).toContain("beebrightstaffing-educator-docs");
    expect(url).toMatch(/X-Amz-Signature/);
  });
});
