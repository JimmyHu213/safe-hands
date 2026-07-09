import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { familyRequests, type FamilyRequest, FAMILY_CARE_TYPE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export interface InsertFamilyInput {
	parentName: string;
	contactEmail: string;
	contactPhone: string;
	suburb: string;
	postcode: string;
	childrenCount: number;
	childrenAges: string;
	careType: (typeof FAMILY_CARE_TYPE)[number];
	shiftDate: string;
	shiftStart: string;
	shiftDurationHrs: number;
	specialNeedsFlag: boolean;
	specialNeedsNotes: string;
	notes: string;
	ipHash: string;
	source: string | null;
}

export async function insertFamilyRequest(db: Db, input: InsertFamilyInput): Promise<string> {
	const id = newId();
	const now = Date.now();
	await db.insert(familyRequests).values({
		id,
		status: "new",
		parentName: input.parentName,
		contactEmail: input.contactEmail,
		contactPhone: input.contactPhone,
		suburb: input.suburb,
		postcode: input.postcode,
		childrenCount: input.childrenCount,
		childrenAges: input.childrenAges,
		careType: input.careType,
		shiftDate: input.shiftDate,
		shiftStart: input.shiftStart,
		shiftDurationHrs: input.shiftDurationHrs,
		specialNeedsFlag: input.specialNeedsFlag,
		specialNeedsNotes: input.specialNeedsNotes || null,
		notes: input.notes || null,
		source: input.source,
		ipHash: input.ipHash,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

export async function getFamilyRequestById(db: Db, id: string): Promise<FamilyRequest | undefined> {
	const rows = await db.select().from(familyRequests).where(eq(familyRequests.id, id)).limit(1);
	return rows[0];
}
