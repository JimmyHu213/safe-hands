import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import {
	insertMagicLink,
	consumeMagicLink,
	insertAdminSession,
	getValidSession,
	deleteSession,
	pruneExpired,
} from "@/lib/db/queries/admin";

describe("admin queries", () => {
	it("magic-link lifecycle", async () => {
		const db = makeTestDb();
		await insertMagicLink(db as any, "hash1", "founder@example.com", Date.now() + 15 * 60_000);
		const email = await consumeMagicLink(db as any, "hash1");
		expect(email).toBe("founder@example.com");
		expect(await consumeMagicLink(db as any, "hash1")).toBeNull(); // single-use
	});

	it("session lifecycle", async () => {
		const db = makeTestDb();
		const future = Date.now() + 30 * 86400 * 1000;
		await insertAdminSession(db as any, "shash1", "founder@example.com", future);
		const sess = await getValidSession(db as any, "shash1");
		expect(sess?.email).toBe("founder@example.com");
		await deleteSession(db as any, "shash1");
		expect(await getValidSession(db as any, "shash1")).toBeUndefined();
	});

	it("pruneExpired removes only expired rows", async () => {
		const db = makeTestDb();
		await insertMagicLink(db as any, "expired", "x@y.com", Date.now() - 1000);
		await insertMagicLink(db as any, "current", "x@y.com", Date.now() + 60_000);
		await insertAdminSession(db as any, "old-sess", "x@y.com", Date.now() - 1000);
		await insertAdminSession(db as any, "new-sess", "x@y.com", Date.now() + 60_000);
		const counts = await pruneExpired(db as any);
		expect(counts.magicLinks).toBeGreaterThanOrEqual(1);
		expect(counts.sessions).toBeGreaterThanOrEqual(1);
		expect(await getValidSession(db as any, "new-sess")).toBeDefined();
	});
});
