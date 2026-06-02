import { cookies } from "next/headers";

const COOKIE = "sh_educator_draft";

export async function setWizardCookie(applicationId: string) {
	const jar = await cookies();
	jar.set(COOKIE, applicationId, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 2, // 2 hours
	});
}

export async function getWizardCookie(): Promise<string | null> {
	const jar = await cookies();
	return jar.get(COOKIE)?.value ?? null;
}

export async function clearWizardCookie() {
	const jar = await cookies();
	jar.delete(COOKIE);
}
