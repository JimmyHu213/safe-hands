import { verifyTurnstile } from "@/lib/util/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp, clientIpHash, bindings } from "./request-context";

export interface GuardResult {
	ok: boolean;
	reason?: "rate_limited" | "turnstile_failed";
	ipHash: string;
}

export async function rateGuard(opts: {
	bucket: string;
	turnstileToken: string;
	limit?: number;
	windowSeconds?: number;
}): Promise<GuardResult> {
	const env = bindings();
	const ip = await clientIp();
	const ipHash = await clientIpHash();

	const tsOk = await verifyTurnstile({
		token: opts.turnstileToken,
		remoteIp: ip,
		secret: env.TURNSTILE_SECRET_KEY,
	});
	if (!tsOk) return { ok: false, reason: "turnstile_failed", ipHash };

	const rl = await checkRateLimit(
		env.RATE_LIMITS,
		`${opts.bucket}:${ipHash}`,
		opts.limit ?? 10,
		opts.windowSeconds ?? 86400,
	);
	if (!rl.allowed) return { ok: false, reason: "rate_limited", ipHash };

	return { ok: true, ipHash };
}
