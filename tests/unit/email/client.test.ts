import { describe, it, expect, vi } from "vitest";
import { sendEmail } from "@/lib/email/client";

describe("sendEmail", () => {
  it("calls Resend with the expected payload", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "msg_1" }, error: null });
    const fakeClient = { emails: { send } } as unknown as Parameters<typeof sendEmail>[0]["client"];
    await sendEmail({
      client: fakeClient,
      from: "no-reply@example.com",
      to: "user@example.com",
      subject: "Hi",
      html: "<p>Hi</p>",
      text: "Hi",
    });
    expect(send).toHaveBeenCalledWith({
      from: "no-reply@example.com",
      to: "user@example.com",
      subject: "Hi",
      html: "<p>Hi</p>",
      text: "Hi",
    });
  });

  it("throws when Resend returns an error", async () => {
    const send = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const fakeClient = { emails: { send } } as unknown as Parameters<typeof sendEmail>[0]["client"];
    await expect(
      sendEmail({
        client: fakeClient,
        from: "no-reply@example.com",
        to: "user@example.com",
        subject: "Hi",
        html: "<p>Hi</p>",
        text: "Hi",
      }),
    ).rejects.toThrow(/boom/);
  });
});
