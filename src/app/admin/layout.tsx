import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { validateSessionToken } from "@/lib/auth/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { bindings } from "@/lib/server/request-context";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
	// Note: this layout wraps ALL /admin/** routes including /admin/login and
	// /admin/login/verify. Those entry points should render cleanly without the
	// admin chrome when there's no session. Defence-in-depth gating is in the
	// middleware; here we just bypass the chrome when no valid session exists.
	const jar = await cookies();
	const token = jar.get(SESSION_COOKIE_NAME)?.value ?? null;
	if (!token) return <>{children}</>;

	const env = bindings();
	const session = await validateSessionToken(db(env.DB), token);
	if (!session) return <>{children}</>;

	return (
		<div className="min-h-screen bg-ink-50">
			<AdminNav email={session.email} />
			<main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
		</div>
	);
}
