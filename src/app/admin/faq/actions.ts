"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { FAQ_AUDIENCE } from "@/lib/db/schema";
import { createFaq, updateFaq, deleteFaq } from "@/lib/db/queries/faq";

const createSchema = z.object({
	audience: z.enum(FAQ_AUDIENCE),
	question: z.string().trim().min(1).max(500),
	answer: z.string().trim().min(1).max(10000),
});

export type CreateFaqState = { ok: boolean; error?: string };

export async function createFaqAction(_p: CreateFaqState, fd: FormData): Promise<CreateFaqState> {
	const parsed = createSchema.safeParse({
		audience: fd.get("audience"),
		question: fd.get("question"),
		answer: fd.get("answer"),
	});
	if (!parsed.success) return { ok: false, error: "Invalid input" };
	const env = bindings();
	await createFaq(db(env.DB), parsed.data);
	revalidatePath("/admin/faq");
	revalidatePath("/faq");
	return { ok: true };
}

export async function togglePublishedAction(fd: FormData): Promise<void> {
	const id = String(fd.get("id"));
	const published = fd.get("published") === "true";
	const env = bindings();
	await updateFaq(db(env.DB), id, { published });
	revalidatePath("/admin/faq");
	revalidatePath("/faq");
}

export async function deleteFaqAction(fd: FormData): Promise<void> {
	const id = String(fd.get("id"));
	const env = bindings();
	await deleteFaq(db(env.DB), id);
	revalidatePath("/admin/faq");
	revalidatePath("/faq");
}
