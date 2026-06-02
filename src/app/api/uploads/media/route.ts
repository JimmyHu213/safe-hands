import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { validateSessionToken } from "@/lib/auth/admin";
import { parseSessionCookie } from "@/lib/auth/session";
import { presignPutUrl } from "@/lib/storage/r2";
import { newId } from "@/lib/util/ulid";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const;
const MAX_BYTES = 10 * 1024 * 1024;

const schema = z.object({
	filename: z.string().min(1).max(300),
	mimeType: z.string().min(1).max(100),
	sizeBytes: z.number().int().min(1).max(MAX_BYTES),
});

export async function POST(req: NextRequest) {
	const token = parseSessionCookie(req.headers.get("cookie"));
	const env = bindings();
	if (!token || !(await validateSessionToken(db(env.DB), token))) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}
	let parsed: z.infer<typeof schema>;
	try {
		parsed = schema.parse(await req.json());
	} catch {
		return NextResponse.json({ error: "invalid_body" }, { status: 400 });
	}
	if (!(ALLOWED_MIME as readonly string[]).includes(parsed.mimeType)) {
		return NextResponse.json({ error: "unsupported_mime" }, { status: 415 });
	}
	const extPart = parsed.mimeType.split("/")[1];
	const ext = (extPart ?? "bin").replace("svg+xml", "svg").replace("jpeg", "jpg");
	const r2Key = `media/${newId()}.${ext}`;
	const url = await presignPutUrl({
		accountId: env.R2_ACCOUNT_ID,
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		bucket: "safe-hands-public-media",
		key: r2Key,
		contentType: parsed.mimeType,
		expiresInSeconds: 300,
	});
	return NextResponse.json({ uploadUrl: url, r2Key });
}
