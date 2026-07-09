import { NextRequest, NextResponse } from "next/server";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { verifyMagicLinkAndIssueSession } from "@/lib/auth/admin";
import { buildSessionCookie } from "@/lib/auth/session";

const SESSION_TTL_SECONDS = 30 * 86400;

export async function GET(req: NextRequest) {
	const token = req.nextUrl.searchParams.get("token");
	if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

	const env = bindings();
	try {
		const { plainSessionToken } = await verifyMagicLinkAndIssueSession({
			db: db(env.DB),
			plainToken: token,
			sessionTtlSeconds: SESSION_TTL_SECONDS,
		});
		const cookie = buildSessionCookie({
			token: plainSessionToken,
			domain: env.SESSION_COOKIE_DOMAIN,
			maxAgeSeconds: SESSION_TTL_SECONDS,
		});
		const res = NextResponse.redirect(new URL("/admin", req.url));
		res.headers.append("Set-Cookie", cookie);
		return res;
	} catch {
		return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url));
	}
}
