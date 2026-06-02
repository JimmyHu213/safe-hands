import { eq, asc } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { faqEntries, type FaqEntry, FAQ_AUDIENCE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export async function listAllFaq(db: Db): Promise<FaqEntry[]> {
	return db.select().from(faqEntries).orderBy(asc(faqEntries.audience), asc(faqEntries.sortOrder));
}

export async function createFaq(
	db: Db,
	input: {
		audience: (typeof FAQ_AUDIENCE)[number];
		question: string;
		answer: string;
	},
): Promise<string> {
	const id = newId();
	const now = Date.now();
	await db.insert(faqEntries).values({
		id,
		audience: input.audience,
		question: input.question,
		answer: input.answer,
		sortOrder: now,
		published: false,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

export async function updateFaq(db: Db, id: string, patch: Partial<FaqEntry>): Promise<void> {
	await db
		.update(faqEntries)
		.set({ ...patch, updatedAt: Date.now() })
		.where(eq(faqEntries.id, id));
}

export async function deleteFaq(db: Db, id: string): Promise<void> {
	await db.delete(faqEntries).where(eq(faqEntries.id, id));
}
