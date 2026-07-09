import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bindings } from "@/lib/server/request-context";
import { EDUCATOR_DOC_TYPE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";
import { presignPutUrl } from "@/lib/storage/r2";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;
const MAX_BYTES = 10 * 1024 * 1024;

const bodySchema = z.object({
	docType: z.enum(EDUCATOR_DOC_TYPE),
	filename: z.string().min(1).max(300),
	mimeType: z.enum(ALLOWED_MIME),
	sizeBytes: z.number().int().min(1).max(MAX_BYTES),
});

export async function POST(req: NextRequest) {
	const applicationId = await getWizardCookie();
	if (!applicationId) return NextResponse.json({ error: "no_draft" }, { status: 401 });

	let parsed: z.infer<typeof bodySchema>;
	try {
		parsed = bodySchema.parse(await req.json());
	} catch {
		return NextResponse.json({ error: "invalid_body" }, { status: 400 });
	}

	const ext = parsed.mimeType === "application/pdf" ? "pdf" : parsed.mimeType === "image/png" ? "png" : "jpg";
	const r2Key = `educator-docs/${applicationId}/${parsed.docType}-${newId()}.${ext}`;

	const env = bindings();
	const url = await presignPutUrl({
		accountId: env.R2_ACCOUNT_ID,
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		bucket: "safe-hands-educator-docs",
		key: r2Key,
		contentType: parsed.mimeType,
		expiresInSeconds: 300,
	});

	return NextResponse.json({ uploadUrl: url, r2Key });
}
