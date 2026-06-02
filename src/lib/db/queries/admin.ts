import { and, eq, gte, isNull, lt } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { adminMagicLinks, adminSessions } from "@/lib/db/schema";

export async function insertMagicLink(
	db: Db,
	tokenHash: string,
	email: string,
	expiresAt: number,
): Promise<void> {
	await db.insert(adminMagicLinks).values({
		tokenHash,
		email,
		expiresAt,
		createdAt: Date.now(),
	});
}

export async function consumeMagicLink(db: Db, tokenHash: string): Promise<string | null> {
	const now = Date.now();
	const rows = await db.select().from(adminMagicLinks).where(
		and(
			eq(adminMagicLinks.tokenHash, tokenHash),
			isNull(adminMagicLinks.usedAt),
			gte(adminMagicLinks.expiresAt, now),
		),
	).limit(1);
	if (!rows[0]) return null;
	await db.update(adminMagicLinks).set({ usedAt: now }).where(eq(adminMagicLinks.tokenHash, tokenHash));
	return rows[0].email;
}

export async function insertAdminSession(
	db: Db,
	sessionIdHash: string,
	email: string,
	expiresAt: number,
): Promise<void> {
	const now = Date.now();
	await db.insert(adminSessions).values({
		sessionIdHash,
		email,
		expiresAt,
		createdAt: now,
		lastSeenAt: now,
	});
}

export async function getValidSession(
	db: Db,
	sessionIdHash: string,
): Promise<{ email: string; expiresAt: number } | undefined> {
	const now = Date.now();
	const rows = await db.select().from(adminSessions).where(
		and(eq(adminSessions.sessionIdHash, sessionIdHash), gte(adminSessions.expiresAt, now)),
	).limit(1);
	if (!rows[0]) return undefined;
	await db.update(adminSessions).set({ lastSeenAt: now }).where(eq(adminSessions.sessionIdHash, sessionIdHash));
	return { email: rows[0].email, expiresAt: rows[0].expiresAt };
}

export async function deleteSession(db: Db, sessionIdHash: string): Promise<void> {
	await db.delete(adminSessions).where(eq(adminSessions.sessionIdHash, sessionIdHash));
}

export async function pruneExpired(db: Db): Promise<{ magicLinks: number; sessions: number }> {
	const now = Date.now();
	const ml = await db.delete(adminMagicLinks).where(lt(adminMagicLinks.expiresAt, now)).returning();
	const ss = await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now)).returning();
	return { magicLinks: ml.length, sessions: ss.length };
}
