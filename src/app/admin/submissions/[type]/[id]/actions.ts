"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { updateStatus } from "@/lib/db/queries/submissions";

export type StatusActionState = { ok: boolean; error?: string };

const schema = z.object({
	type: z.enum(["centre", "family", "educator"]),
	id: z.string().min(1).max(64),
	status: z.string().min(1).max(32),
});

export async function changeStatus(_p: StatusActionState, fd: FormData): Promise<StatusActionState> {
	let parsed;
	try {
		parsed = schema.parse({ type: fd.get("type"), id: fd.get("id"), status: fd.get("status") });
	} catch {
		return { ok: false, error: "Invalid input" };
	}
	const env = bindings();
	await updateStatus(db(env.DB), parsed.type, parsed.id, parsed.status);
	revalidatePath(`/admin/submissions/${parsed.type}/${parsed.id}`);
	revalidatePath("/admin/submissions");
	return { ok: true };
}
