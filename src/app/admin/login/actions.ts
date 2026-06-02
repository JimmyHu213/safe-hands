"use server";

import { Resend } from "resend";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { sendMagicLink } from "@/lib/auth/admin";

export type LoginActionState = { ok: boolean; message?: string };

export async function requestMagicLink(
	_p: LoginActionState,
	fd: FormData,
): Promise<LoginActionState> {
	const email = String(fd.get("email") ?? "").trim().toLowerCase();
	if (!email || email.length > 200) {
		return { ok: false, message: "Please enter a valid email." };
	}
	const env = bindings();
	const resend = new Resend(env.RESEND_API_KEY);
	await sendMagicLink({
		db: db(env.DB),
		resend,
		adminEmail: env.ADMIN_EMAIL,
		submittedEmail: email,
		publicSiteUrl: env.PUBLIC_SITE_URL,
		from: env.RESEND_FROM_ADDRESS,
	});
	return { ok: true, message: "If that address has access, a sign-in link is on its way." };
}
