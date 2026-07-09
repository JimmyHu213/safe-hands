import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../helpers/test-db";
import { sendMagicLink, verifyMagicLinkAndIssueSession, validateSessionToken } from "@/lib/auth/admin";
import type { Resend } from "resend";

const fakeResend = { emails: { send: async () => ({ data: { id: "x" }, error: null }) } } as unknown as Resend;

describe("admin auth", () => {
	it("only allows the configured admin email", async () => {
		const db = makeTestDb();
		const r = await sendMagicLink({
			db: db as any,
			resend: fakeResend,
			adminEmail: "founder@example.com",
			submittedEmail: "attacker@example.com",
			publicSiteUrl: "https://example.com",
			from: "no-reply@example.com",
		});
		expect(r.silentlyIgnored).toBe(true);
	});

	it("end-to-end: send link → verify → session", async () => {
		const db = makeTestDb();
		const r = await sendMagicLink({
			db: db as any,
			resend: fakeResend,
			adminEmail: "founder@example.com",
			submittedEmail: "founder@example.com",
			publicSiteUrl: "https://example.com",
			from: "no-reply@example.com",
		});
		expect(r.silentlyIgnored).toBe(false);
		expect(r.plainToken).toBeTruthy();

		const session = await verifyMagicLinkAndIssueSession({
			db: db as any,
			plainToken: r.plainToken!,
			sessionTtlSeconds: 60 * 60 * 24 * 30,
		});
		expect(session.email).toBe("founder@example.com");
		expect(session.plainSessionToken).toBeTruthy();

		const ok = await validateSessionToken(db as any, session.plainSessionToken);
		expect(ok?.email).toBe("founder@example.com");
	});
});
