"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { familyRequestSchema, type FamilyRequestInput } from "@/lib/validation/schemas";
import { bindings } from "@/lib/server/request-context";
import { rateGuard } from "@/lib/server/rate-guard";
import { db } from "@/lib/db/client";
import { insertFamilyRequest } from "@/lib/db/queries/families";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import FamilyRequestAck from "@/lib/email/templates/FamilyRequestAck";
import FamilyRequestNotify from "@/lib/email/templates/FamilyRequestNotify";

export type ActionState = { ok: boolean; error?: string };

export async function submitFamilyRequest(_p: ActionState, fd: FormData): Promise<ActionState> {
	const raw = {
		parentName: fd.get("parentName"),
		contactEmail: fd.get("contactEmail"),
		contactPhone: fd.get("contactPhone"),
		suburb: fd.get("suburb"),
		postcode: fd.get("postcode"),
		childrenCount: Number(fd.get("childrenCount")),
		childrenAges: fd.get("childrenAges") ?? "",
		careType: fd.get("careType"),
		shiftDate: fd.get("shiftDate"),
		shiftStart: fd.get("shiftStart"),
		shiftDurationHrs: Number(fd.get("shiftDurationHrs")),
		specialNeedsFlag: fd.get("specialNeedsFlag") === "on",
		specialNeedsNotes: fd.get("specialNeedsNotes") ?? "",
		notes: fd.get("notes") ?? "",
		privacyConsent: fd.get("privacyConsent") === "on",
		turnstileToken: fd.get("cf-turnstile-response") ?? "",
	};
	let parsed: FamilyRequestInput;
	try {
		parsed = familyRequestSchema.parse(raw);
	} catch {
		return { ok: false, error: "Please check the required fields and try again." };
	}

	const guard = await rateGuard({ bucket: "family", turnstileToken: parsed.turnstileToken });
	if (!guard.ok) return { ok: false, error: "Verification failed." };

	const env = bindings();
	const id = await insertFamilyRequest(db(env.DB), { ...parsed, ipHash: guard.ipHash, source: null });

	const resend = new Resend(env.RESEND_API_KEY);
	const ack = await renderEmail(
		<FamilyRequestAck parentName={parsed.parentName} shiftDate={parsed.shiftDate} shiftStart={parsed.shiftStart} />,
	);
	const notify = await renderEmail(
		<FamilyRequestNotify {...parsed} adminLinkUrl={`${env.PUBLIC_SITE_URL}/admin/submissions/family/${id}`} />,
	);

	try {
		await sendEmail({
			client: resend,
			from: env.RESEND_FROM_ADDRESS,
			to: parsed.contactEmail,
			subject: "We have received your care request",
			...ack,
		});
		await sendEmail({
			client: resend,
			from: env.RESEND_FROM_ADDRESS,
			to: env.ADMIN_EMAIL,
			subject: `[Safe Hands] Family request — ${parsed.parentName}`,
			...notify,
		});
	} catch (err) {
		console.error("family email send failed", err);
	}
	redirect("/for-families/request/thank-you");
}
