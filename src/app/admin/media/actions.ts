"use server";
import { revalidatePath } from "next/cache";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { insertMedia, updateMediaAlt, deleteMedia } from "@/lib/db/queries/media";

export async function recordMediaAction(fd: FormData): Promise<void> {
	const env = bindings();
	await insertMedia(db(env.DB), {
		r2Key: String(fd.get("r2Key")),
		originalFilename: String(fd.get("originalFilename")),
		mimeType: String(fd.get("mimeType")),
		sizeBytes: Number(fd.get("sizeBytes")),
	});
	revalidatePath("/admin/media");
}

export async function updateAltAction(fd: FormData): Promise<void> {
	const env = bindings();
	await updateMediaAlt(db(env.DB), String(fd.get("id")), String(fd.get("alt")));
	revalidatePath("/admin/media");
}

export async function deleteMediaAction(fd: FormData): Promise<void> {
	const env = bindings();
	await deleteMedia(db(env.DB), String(fd.get("id")));
	revalidatePath("/admin/media");
}
