import { desc, eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { media, type MediaItem } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export async function listMedia(db: Db): Promise<MediaItem[]> {
	return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function insertMedia(db: Db, input: {
	r2Key: string; originalFilename: string; mimeType: string; sizeBytes: number;
}): Promise<string> {
	const id = newId();
	await db.insert(media).values({
		id,
		r2Key: input.r2Key,
		originalFilename: input.originalFilename,
		mimeType: input.mimeType,
		sizeBytes: input.sizeBytes,
		createdAt: Date.now(),
	});
	return id;
}

export async function updateMediaAlt(db: Db, id: string, altText: string): Promise<void> {
	await db.update(media).set({ altText }).where(eq(media.id, id));
}

export async function deleteMedia(db: Db, id: string): Promise<void> {
	await db.delete(media).where(eq(media.id, id));
}
