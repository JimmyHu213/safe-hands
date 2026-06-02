"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { educatorStep1Schema } from "@/lib/validation/schemas";
import { bindings } from "@/lib/server/request-context";
import { rateGuard } from "@/lib/server/rate-guard";
import { db } from "@/lib/db/client";
import { createDraftEducator } from "@/lib/db/queries/educators";
import { issueResumeToken } from "@/lib/db/queries/resume-tokens";
import { setWizardCookie } from "@/lib/auth/wizard-cookie";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import EducatorStep1Resume from "@/lib/email/templates/EducatorStep1Resume";

export type WizardActionState = { ok: boolean; error?: string };

export async function educatorStep1Action(
	_p: WizardActionState,
	fd: FormData,
): Promise<WizardActionState> {
	const raw = {
		firstName: fd.get("firstName"),
		lastName: fd.get("lastName"),
		email: fd.get("email"),
		phone: fd.get("phone"),
		suburb: fd.get("suburb"),
		postcode: fd.get("postcode"),
		privacyConsent: fd.get("privacyConsent") === "on",
		turnstileToken: fd.get("cf-turnstile-response") ?? "",
	};
	let parsed;
	try {
		parsed = educatorStep1Schema.parse(raw);
	} catch {
		return { ok: false, error: "Please check the required fields and try again." };
	}

	const guard = await rateGuard({ bucket: "educator", turnstileToken: parsed.turnstileToken });
	if (!guard.ok) return { ok: false, error: "Verification failed." };

	const env = bindings();
	const applicationId = await createDraftEducator(db(env.DB), { ...parsed, ipHash: guard.ipHash });

	const plainToken = await issueResumeToken(db(env.DB), applicationId, 30 * 86400);
	const resumeUrl = `${env.PUBLIC_SITE_URL}/for-educators/apply/resume?token=${encodeURIComponent(plainToken)}`;
	await setWizardCookie(applicationId);

	const resend = new Resend(env.RESEND_API_KEY);
	const email = await renderEmail(<EducatorStep1Resume firstName={parsed.firstName} resumeUrl={resumeUrl} />);
	try {
		await sendEmail({
			client: resend,
			from: env.RESEND_FROM_ADDRESS,
			to: parsed.email,
			subject: "Resume your Safe Hands application",
			...email,
		});
	} catch (err) {
		console.error("educator resume email failed", err);
	}

	redirect("/for-educators/apply/step-2");
}
