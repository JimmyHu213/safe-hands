import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hashIp } from "@/lib/util/ip-hash";

interface SecretsEnv {
	TURNSTILE_SECRET_KEY: string;
	IP_HASH_SALT_ROTATION: string;
	RESEND_API_KEY: string;
	RESEND_FROM_ADDRESS: string;
	ADMIN_EMAIL: string;
	PUBLIC_SITE_URL: string;
	R2_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
}

export async function clientIp(): Promise<string> {
	const h = await headers();
	return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
}

export async function clientIpHash(): Promise<string> {
	const env = bindings();
	const ip = await clientIp();
	return hashIp(ip, new Date(), env.IP_HASH_SALT_ROTATION);
}

export function bindings(): CloudflareEnv & SecretsEnv {
	return getCloudflareContext().env as unknown as CloudflareEnv & SecretsEnv;
}
