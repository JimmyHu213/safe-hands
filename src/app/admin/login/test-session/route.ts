import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { insertAdminSession } from "@/lib/db/queries/admin";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const TEST_FALLBACK_EMAIL = "test-admin@example.com";

export async function POST(_req: NextRequest) {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ error: "disabled" }, { status: 403 });
	}
	const { env } = getCloudflareContext();
	const adminEmail =
		(env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL ?? TEST_FALLBACK_EMAIL;

	const token = generateToken();
	const hash = await hashToken(token);
	const expiresAt = Date.now() + 60 * 60 * 1000; // 1h for tests
	await insertAdminSession(db(env.DB), hash, adminEmail, expiresAt);

	// Hand-rolled cookie for test usage: omit Domain (browser uses the request
	// host, which is what we want for localhost) and omit Secure (Playwright
	// dev server runs over http). Production sign-in uses buildSessionCookie.
	const cookieParts = [
		`${SESSION_COOKIE_NAME}=${token}`,
		"Path=/",
		"Max-Age=3600",
		"HttpOnly",
		"SameSite=Lax",
	];
	const res = NextResponse.json({ ok: true });
	res.headers.append("Set-Cookie", cookieParts.join("; "));
	return res;
}
