import { NextRequest, NextResponse } from "next/server";
import { lt, and, eq } from "drizzle-orm";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { pruneExpired } from "@/lib/db/queries/admin";
import {
	centreRequests,
	familyRequests,
	educatorApplications,
	educatorResumeTokens,
} from "@/lib/db/schema";

const ARCHIVE_RETENTION_MS = 24 * 30 * 86400 * 1000;
const ABANDONED_DRAFT_MS = 60 * 86400 * 1000;

export async function GET(req: NextRequest) {
	// Cron triggers are unauthenticated from the Worker runtime perspective,
	// but Cloudflare guarantees only its scheduler can call them. As an extra
	// belt-and-braces check, require a shared secret in production via
	// CRON_SECRET; in dev (where CRON_SECRET is unset), the endpoint is open.
	const env = bindings();
	const secret = req.nextUrl.searchParams.get("secret");
	if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const dbi = db(env.DB);
	const now = Date.now();

	// 1. expired magic-link tokens + admin sessions
	const auth = await pruneExpired(dbi);

	// 2. expired educator resume tokens
	const tokens = await dbi.delete(educatorResumeTokens).where(lt(educatorResumeTokens.expiresAt, now)).returning();

	// 3. abandoned educator drafts older than 60 days
	const drafts = await dbi.delete(educatorApplications).where(
		and(eq(educatorApplications.status, "draft"), lt(educatorApplications.updatedAt, now - ABANDONED_DRAFT_MS)),
	).returning();

	// 4. archived submissions older than 24 months
	const archivedCentres = await dbi.delete(centreRequests).where(
		and(eq(centreRequests.status, "archived"), lt(centreRequests.updatedAt, now - ARCHIVE_RETENTION_MS)),
	).returning();
	const archivedFamilies = await dbi.delete(familyRequests).where(
		and(eq(familyRequests.status, "archived"), lt(familyRequests.updatedAt, now - ARCHIVE_RETENTION_MS)),
	).returning();
	const archivedEducators = await dbi.delete(educatorApplications).where(
		and(eq(educatorApplications.status, "archived"), lt(educatorApplications.updatedAt, now - ARCHIVE_RETENTION_MS)),
	).returning();

	return NextResponse.json({
		auth,
		resumeTokens: tokens.length,
		abandonedDrafts: drafts.length,
		archived: {
			centre: archivedCentres.length,
			family: archivedFamilies.length,
			educator: archivedEducators.length,
		},
	});
}
