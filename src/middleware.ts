import { NextRequest, NextResponse } from "next/server";
import { parseSessionCookie } from "@/lib/auth/session";

export const config = {
	matcher: ["/admin/:path*"],
};

const ALLOW = ["/admin/login", "/admin/login/verify"];

export function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	if (ALLOW.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
		return NextResponse.next();
	}
	const sessionToken = parseSessionCookie(req.headers.get("cookie"));
	if (!sessionToken) {
		return NextResponse.redirect(new URL("/admin/login", req.url));
	}
	// Full session validation happens server-side in the layout (Batch B);
	// middleware only checks cookie presence (cheap, edge-safe — no DB call).
	return NextResponse.next();
}
