import { and, eq, like, or, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
	centreRequests,
	familyRequests,
	educatorApplications,
	SUBMISSION_STATUS,
	type CentreRequest,
	type FamilyRequest,
	type EducatorApplication,
} from "@/lib/db/schema";

export type SubmissionType = "centre" | "family" | "educator";

export interface UnifiedRow {
	type: SubmissionType;
	id: string;
	status: string;
	primaryName: string;
	contactEmail: string;
	createdAt: number;
}

export interface ListOpts {
	type: SubmissionType | "all";
	status: (typeof SUBMISSION_STATUS)[number] | "all";
	q: string;
	limit: number;
	offset: number;
}

export async function listSubmissions(db: Db, opts: ListOpts): Promise<UnifiedRow[]> {
	const rows: UnifiedRow[] = [];

	if (opts.type === "all" || opts.type === "centre") {
		const conds = [];
		if (opts.status !== "all") conds.push(eq(centreRequests.status, opts.status));
		if (opts.q)
			conds.push(
				or(
					like(centreRequests.contactEmail, `%${opts.q}%`),
					like(centreRequests.contactName, `%${opts.q}%`),
					like(centreRequests.centreName, `%${opts.q}%`),
				),
			);
		const r = await db.select().from(centreRequests).where(conds.length ? and(...conds) : undefined);
		r.forEach((row) =>
			rows.push({
				type: "centre",
				id: row.id,
				status: row.status,
				primaryName: row.centreName,
				contactEmail: row.contactEmail,
				createdAt: row.createdAt,
			}),
		);
	}

	if (opts.type === "all" || opts.type === "family") {
		const conds = [];
		if (opts.status !== "all") conds.push(eq(familyRequests.status, opts.status));
		if (opts.q)
			conds.push(
				or(
					like(familyRequests.contactEmail, `%${opts.q}%`),
					like(familyRequests.parentName, `%${opts.q}%`),
				),
			);
		const r = await db.select().from(familyRequests).where(conds.length ? and(...conds) : undefined);
		r.forEach((row) =>
			rows.push({
				type: "family",
				id: row.id,
				status: row.status,
				primaryName: row.parentName,
				contactEmail: row.contactEmail,
				createdAt: row.createdAt,
			}),
		);
	}

	if (opts.type === "all" || opts.type === "educator") {
		const conds = [];
		if (opts.status !== "all") conds.push(eq(educatorApplications.status, opts.status as any));
		if (opts.q)
			conds.push(
				or(
					like(educatorApplications.email, `%${opts.q}%`),
					like(educatorApplications.firstName, `%${opts.q}%`),
					like(educatorApplications.lastName, `%${opts.q}%`),
				),
			);
		const r = await db.select().from(educatorApplications).where(conds.length ? and(...conds) : undefined);
		r.forEach((row) =>
			rows.push({
				type: "educator",
				id: row.id,
				status: row.status,
				primaryName: `${row.firstName} ${row.lastName}`,
				contactEmail: row.email,
				createdAt: row.createdAt,
			}),
		);
	}

	rows.sort((a, b) => b.createdAt - a.createdAt);
	return rows.slice(opts.offset, opts.offset + opts.limit);
}

export async function getCounts(db: Db) {
	const [c] = await db.select({ n: sql<number>`count(*)` }).from(centreRequests);
	const [f] = await db.select({ n: sql<number>`count(*)` }).from(familyRequests);
	const [e] = await db.select({ n: sql<number>`count(*)` }).from(educatorApplications);
	return { centre: Number(c.n), family: Number(f.n), educator: Number(e.n) };
}

export async function getSubmission(db: Db, type: "centre", id: string): Promise<CentreRequest | undefined>;
export async function getSubmission(db: Db, type: "family", id: string): Promise<FamilyRequest | undefined>;
export async function getSubmission(db: Db, type: "educator", id: string): Promise<EducatorApplication | undefined>;
export async function getSubmission(
	db: Db,
	type: SubmissionType,
	id: string,
): Promise<CentreRequest | FamilyRequest | EducatorApplication | undefined> {
	if (type === "centre") {
		const rows = await db.select().from(centreRequests).where(eq(centreRequests.id, id)).limit(1);
		return rows[0];
	}
	if (type === "family") {
		const rows = await db.select().from(familyRequests).where(eq(familyRequests.id, id)).limit(1);
		return rows[0];
	}
	const rows = await db.select().from(educatorApplications).where(eq(educatorApplications.id, id)).limit(1);
	return rows[0];
}

export async function updateStatus(db: Db, type: SubmissionType, id: string, status: string) {
	const now = Date.now();
	if (type === "centre") {
		await db.update(centreRequests).set({ status: status as any, updatedAt: now }).where(eq(centreRequests.id, id));
		return;
	}
	if (type === "family") {
		await db.update(familyRequests).set({ status: status as any, updatedAt: now }).where(eq(familyRequests.id, id));
		return;
	}
	await db.update(educatorApplications).set({ status: status as any, updatedAt: now }).where(eq(educatorApplications.id, id));
}
