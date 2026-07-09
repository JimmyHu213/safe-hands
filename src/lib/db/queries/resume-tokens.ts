import { and, eq, gte, isNull } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { educatorResumeTokens } from "@/lib/db/schema";
import { generateToken, hashToken } from "@/lib/auth/tokens";

export async function issueResumeToken(db: Db, applicationId: string, ttlSeconds: number): Promise<string> {
	const plain = generateToken();
	const tokenHash = await hashToken(plain);
	const now = Date.now();
	await db.insert(educatorResumeTokens).values({
		tokenHash,
		applicationId,
		expiresAt: now + ttlSeconds * 1000,
		createdAt: now,
	});
	return plain;
}

export async function consumeResumeToken(db: Db, plainToken: string): Promise<string | null> {
	const tokenHash = await hashToken(plainToken);
	const now = Date.now();
	const rows = await db.select().from(educatorResumeTokens).where(
		and(
			eq(educatorResumeTokens.tokenHash, tokenHash),
			isNull(educatorResumeTokens.usedAt),
			gte(educatorResumeTokens.expiresAt, now),
		),
	).limit(1);
	const row = rows[0];
	if (!row) return null;
	await db.update(educatorResumeTokens)
		.set({ usedAt: now })
		.where(eq(educatorResumeTokens.tokenHash, tokenHash));
	return row.applicationId;
}
