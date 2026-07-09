import { NextRequest, NextResponse } from "next/server";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { consumeResumeToken } from "@/lib/db/queries/resume-tokens";
import { getDraftById } from "@/lib/db/queries/educators";
import { setWizardCookie } from "@/lib/auth/wizard-cookie";

export async function GET(req: NextRequest) {
	const token = req.nextUrl.searchParams.get("token");
	if (!token) return NextResponse.redirect(new URL("/for-educators/apply", req.url));
	const env = bindings();
	const applicationId = await consumeResumeToken(db(env.DB), token);
	if (!applicationId) {
		return NextResponse.redirect(new URL("/for-educators/apply?resume=invalid", req.url));
	}
	const app = await getDraftById(db(env.DB), applicationId);
	if (!app || app.status !== "draft") {
		return NextResponse.redirect(new URL("/for-educators/apply?resume=expired", req.url));
	}
	await setWizardCookie(applicationId);
	const nextStep = Math.min(app.stepCompleted + 1, 4);
	const target = nextStep === 1 ? "/for-educators/apply" : `/for-educators/apply/step-${nextStep}`;
	return NextResponse.redirect(new URL(target, req.url));
}
