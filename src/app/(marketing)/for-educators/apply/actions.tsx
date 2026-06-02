"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { educatorStep1Schema, educatorStep2Schema, educatorStep3Schema, availabilitySchema } from "@/lib/validation/schemas";
import { bindings } from "@/lib/server/request-context";
import { rateGuard } from "@/lib/server/rate-guard";
import { db } from "@/lib/db/client";
import {
	createDraftEducator,
	updateEducatorStep2,
	listEducatorDocuments,
	setStep3Complete,
} from "@/lib/db/queries/educators";
import { issueResumeToken } from "@/lib/db/queries/resume-tokens";
import { setWizardCookie, getWizardCookie } from "@/lib/auth/wizard-cookie";
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

export async function educatorStep2Action(
	_p: WizardActionState,
	fd: FormData,
): Promise<WizardActionState> {
	const applicationId = await getWizardCookie();
	if (!applicationId) return { ok: false, error: "Your session expired. Please restart your application." };

	const avail = {
		mon: fd.getAll("availability_mon") as ("am" | "pm")[],
		tue: fd.getAll("availability_tue") as ("am" | "pm")[],
		wed: fd.getAll("availability_wed") as ("am" | "pm")[],
		thu: fd.getAll("availability_thu") as ("am" | "pm")[],
		fri: fd.getAll("availability_fri") as ("am" | "pm")[],
		sat: fd.getAll("availability_sat") as ("am" | "pm")[],
		sun: fd.getAll("availability_sun") as ("am" | "pm")[],
	};

	const raw = {
		qualificationLevel: fd.get("qualificationLevel"),
		qualificationOther: fd.get("qualificationOther") ?? "",
		yearsExperience: Number(fd.get("yearsExperience")),
		specialNeedsExperience: fd.get("specialNeedsExperience") === "on",
		specialNeedsNotes: fd.get("specialNeedsNotes") ?? "",
		availability: availabilitySchema.parse(avail),
		travelRadiusKm: Number(fd.get("travelRadiusKm")),
		hasOwnTransport: fd.get("hasOwnTransport") === "on",
	};

	let parsed;
	try {
		parsed = educatorStep2Schema.parse(raw);
	} catch {
		return { ok: false, error: "Please check the required fields and try again." };
	}

	const env = bindings();
	await updateEducatorStep2(db(env.DB), applicationId, parsed);
	redirect("/for-educators/apply/step-3");
}

export async function educatorStep3Action(
	_p: WizardActionState,
	_fd: FormData,
): Promise<WizardActionState> {
	const applicationId = await getWizardCookie();
	if (!applicationId) return { ok: false, error: "Your session expired." };

	const env = bindings();
	const docs = await listEducatorDocuments(db(env.DB), applicationId);
	try {
		educatorStep3Schema.parse({
			documents: docs.map((d) => ({
				docType: d.docType,
				r2Key: d.r2Key,
				originalFilename: d.originalFilename,
				mimeType: d.mimeType,
				sizeBytes: d.sizeBytes,
			})),
		});
	} catch {
		return {
			ok: false,
			error:
				"Please upload all three mandatory documents (WWCC, First Aid HLTAID012, Cert III/Diploma).",
		};
	}
	await setStep3Complete(db(env.DB), applicationId);
	redirect("/for-educators/apply/step-4");
}
