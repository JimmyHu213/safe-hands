import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { recordEducatorDocument } from "@/lib/db/queries/educators";
import { EDUCATOR_DOC_TYPE } from "@/lib/db/schema";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";

const schema = z.object({
	docType: z.enum(EDUCATOR_DOC_TYPE),
	r2Key: z.string().min(1).max(500),
	originalFilename: z.string().min(1).max(300),
	mimeType: z.string().min(1).max(100),
	sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
});

export async function POST(req: NextRequest) {
	const applicationId = await getWizardCookie();
	if (!applicationId) return NextResponse.json({ error: "no_draft" }, { status: 401 });
	let parsed: z.infer<typeof schema>;
	try {
		parsed = schema.parse(await req.json());
	} catch {
		return NextResponse.json({ error: "invalid_body" }, { status: 400 });
	}
	const env = bindings();
	await recordEducatorDocument(db(env.DB), { applicationId, ...parsed });
	return NextResponse.json({ ok: true });
}
