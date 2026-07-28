"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { centreRequestSchema, type CentreRequestInput } from "@/lib/validation/schemas";
import { bindings } from "@/lib/server/request-context";
import { rateGuard } from "@/lib/server/rate-guard";
import { db } from "@/lib/db/client";
import { insertCentreRequest } from "@/lib/db/queries/centres";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import CentreRequestAck from "@/lib/email/templates/CentreRequestAck";
import CentreRequestNotify from "@/lib/email/templates/CentreRequestNotify";

export type ActionState = { ok: boolean; error?: string };

export async function submitCentreRequest(_prev: ActionState, fd: FormData): Promise<ActionState> {
	const raw = {
		centreName: fd.get("centreName"),
		contactName: fd.get("contactName"),
		contactEmail: fd.get("contactEmail"),
		contactPhone: fd.get("contactPhone"),
		suburb: fd.get("suburb"),
		postcode: fd.get("postcode"),
		roleNeeded: fd.get("roleNeeded"),
		shiftDate: fd.get("shiftDate"),
		shiftStart: fd.get("shiftStart"),
		shiftDurationHrs: Number(fd.get("shiftDurationHrs")),
		specialNeedsFlag: fd.get("specialNeedsFlag") === "on",
		notes: fd.get("notes") ?? "",
		privacyConsent: fd.get("privacyConsent") === "on",
		turnstileToken: fd.get("cf-turnstile-response") ?? "",
	};

	let parsed: CentreRequestInput;
	try {
		parsed = centreRequestSchema.parse(raw);
	} catch {
		return { ok: false, error: "Please check the required fields and try again." };
	}

	const guard = await rateGuard({ bucket: "centre", turnstileToken: parsed.turnstileToken });
	if (!guard.ok) {
		return { ok: false, error: "Verification failed. Please refresh and try again." };
	}

	const env = bindings();
	const id = await insertCentreRequest(db(env.DB), {
		centreName: parsed.centreName,
		contactName: parsed.contactName,
		contactEmail: parsed.contactEmail,
		contactPhone: parsed.contactPhone,
		suburb: parsed.suburb,
		postcode: parsed.postcode,
		roleNeeded: parsed.roleNeeded,
		shiftDate: parsed.shiftDate,
		shiftStart: parsed.shiftStart,
		shiftDurationHrs: parsed.shiftDurationHrs,
		specialNeedsFlag: parsed.specialNeedsFlag,
		notes: parsed.notes,
		ipHash: guard.ipHash,
		source: null,
	});

	const resend = new Resend(env.RESEND_API_KEY);
	const ack = await renderEmail(
		<CentreRequestAck
			contactName={parsed.contactName}
			centreName={parsed.centreName}
			shiftDate={parsed.shiftDate}
			shiftStart={parsed.shiftStart}
		/>,
	);
	const notify = await renderEmail(
		<CentreRequestNotify
			{...parsed}
			adminLinkUrl={`${env.PUBLIC_SITE_URL}/admin/submissions/centre/${id}`}
		/>,
	);

	try {
		await sendEmail({
			client: resend,
			from: env.RESEND_FROM_ADDRESS,
			to: parsed.contactEmail,
			subject: "We have received your booking request",
			...ack,
		});
		await sendEmail({
			client: resend,
			from: env.RESEND_FROM_ADDRESS,
			to: env.ADMIN_EMAIL,
			subject: `[Bee Bright] Centre request — ${parsed.centreName}`,
			...notify,
		});
	} catch (err) {
		console.error("centre email send failed", err);
	}

	redirect("/for-centres/request/thank-you");
}
