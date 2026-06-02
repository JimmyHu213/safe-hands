import type { Resend } from "resend";
import type { Db } from "@/lib/db/client";
import { generateToken, hashToken, constantTimeEqual } from "./tokens";
import {
	insertMagicLink,
	consumeMagicLink,
	insertAdminSession,
	getValidSession,
} from "@/lib/db/queries/admin";
import { sendEmail } from "@/lib/email/client";
import { renderEmail } from "@/lib/email/render";
import AdminMagicLink from "@/lib/email/templates/AdminMagicLink";

const MAGIC_TTL_SECONDS = 15 * 60;

export interface SendMagicLinkInput {
	db: Db;
	resend: Resend;
	adminEmail: string;
	submittedEmail: string;
	publicSiteUrl: string;
	from: string;
}

export interface SendMagicLinkResult {
	silentlyIgnored: boolean;
	plainToken: string | null;
}

export async function sendMagicLink(input: SendMagicLinkInput): Promise<SendMagicLinkResult> {
	if (!constantTimeEqual(input.submittedEmail.toLowerCase(), input.adminEmail.toLowerCase())) {
		return { silentlyIgnored: true, plainToken: null };
	}

	const plainToken = generateToken();
	const tokenHash = await hashToken(plainToken);
	const expiresAt = Date.now() + MAGIC_TTL_SECONDS * 1000;
	await insertMagicLink(input.db, tokenHash, input.adminEmail, expiresAt);

	const url = `${input.publicSiteUrl}/admin/login/verify?token=${encodeURIComponent(plainToken)}`;
	const email = await renderEmail(<AdminMagicLink url={url} />);
	await sendEmail({
		client: input.resend,
		from: input.from,
		to: input.adminEmail,
		subject: "Sign in to Safe Hands admin",
		...email,
	});
	return { silentlyIgnored: false, plainToken };
}

export interface VerifyInput {
	db: Db;
	plainToken: string;
	sessionTtlSeconds: number;
}

export interface VerifyResult {
	email: string;
	plainSessionToken: string;
}

export async function verifyMagicLinkAndIssueSession(input: VerifyInput): Promise<VerifyResult> {
	const tokenHash = await hashToken(input.plainToken);
	const email = await consumeMagicLink(input.db, tokenHash);
	if (!email) throw new Error("invalid_or_expired_token");

	const plainSessionToken = generateToken();
	const sessionIdHash = await hashToken(plainSessionToken);
	const expiresAt = Date.now() + input.sessionTtlSeconds * 1000;
	await insertAdminSession(input.db, sessionIdHash, email, expiresAt);
	return { email, plainSessionToken };
}

export async function validateSessionToken(
	db: Db,
	plainSessionToken: string,
): Promise<{ email: string } | null> {
	if (!plainSessionToken) return null;
	const sessionIdHash = await hashToken(plainSessionToken);
	const valid = await getValidSession(db, sessionIdHash);
	return valid ? { email: valid.email } : null;
}
