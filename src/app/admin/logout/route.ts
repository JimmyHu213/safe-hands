import { NextRequest, NextResponse } from "next/server";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { deleteSession } from "@/lib/db/queries/admin";
import { buildSessionCookie, parseSessionCookie } from "@/lib/auth/session";
import { hashToken } from "@/lib/auth/tokens";

export async function GET(req: NextRequest) {
	const token = parseSessionCookie(req.headers.get("cookie"));
	const env = bindings();
	if (token) {
		const sessionIdHash = await hashToken(token);
		await deleteSession(db(env.DB), sessionIdHash);
	}
	const res = NextResponse.redirect(new URL("/admin/login", req.url));
	res.headers.append(
		"Set-Cookie",
		buildSessionCookie({ token: "", domain: env.SESSION_COOKIE_DOMAIN, maxAgeSeconds: 0 }),
	);
	return res;
}
