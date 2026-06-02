import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { issueResumeToken, consumeResumeToken } from "@/lib/db/queries/resume-tokens";
import { createDraftEducator } from "@/lib/db/queries/educators";

describe("resume tokens", () => {
	it("issues and consumes a valid token", async () => {
		const db = makeTestDb();
		const appId = await createDraftEducator(db as any, {
			firstName: "A", lastName: "B", email: "a@b.example", phone: "0400000000",
			suburb: "X", postcode: "2000", privacyConsent: true, ipHash: "h",
		});
		const plain = await issueResumeToken(db as any, appId, 30 * 86400);
		expect(plain).toMatch(/^[A-Za-z0-9_-]{30,}$/);
		const consumed = await consumeResumeToken(db as any, plain);
		expect(consumed).toBe(appId);
		const again = await consumeResumeToken(db as any, plain);
		expect(again).toBeNull(); // single-use
	});

	it("rejects expired tokens", async () => {
		const db = makeTestDb();
		const appId = await createDraftEducator(db as any, {
			firstName: "A", lastName: "B", email: "a@b.example", phone: "0400000000",
			suburb: "X", postcode: "2000", privacyConsent: true, ipHash: "h",
		});
		const plain = await issueResumeToken(db as any, appId, -1);
		expect(await consumeResumeToken(db as any, plain)).toBeNull();
	});
});
