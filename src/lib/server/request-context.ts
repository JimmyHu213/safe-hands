import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hashIp } from "@/lib/util/ip-hash";

interface SecretsEnv {
	TURNSTILE_SECRET_KEY: string;
	IP_HASH_SALT_ROTATION: string;
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
