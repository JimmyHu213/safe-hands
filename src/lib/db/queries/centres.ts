import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { centreRequests, type CentreRequest, CENTRE_ROLE } from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";

export interface InsertCentreInput {
	centreName: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;
	suburb: string;
	postcode: string;
	roleNeeded: (typeof CENTRE_ROLE)[number];
	shiftDate: string;
	shiftStart: string;
	shiftDurationHrs: number;
	specialNeedsFlag: boolean;
	notes: string;
	ipHash: string;
	source: string | null;
}

export async function insertCentreRequest(db: Db, input: InsertCentreInput): Promise<string> {
	const id = newId();
	const now = Date.now();
	await db.insert(centreRequests).values({
		id,
		status: "new",
		centreName: input.centreName,
		contactName: input.contactName,
		contactEmail: input.contactEmail,
		contactPhone: input.contactPhone,
		suburb: input.suburb,
		postcode: input.postcode,
		roleNeeded: input.roleNeeded,
		shiftDate: input.shiftDate,
		shiftStart: input.shiftStart,
		shiftDurationHrs: input.shiftDurationHrs,
		specialNeedsFlag: input.specialNeedsFlag,
		notes: input.notes || null,
		source: input.source,
		ipHash: input.ipHash,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

export async function getCentreRequestById(db: Db, id: string): Promise<CentreRequest | undefined> {
	const rows = await db.select().from(centreRequests).where(eq(centreRequests.id, id)).limit(1);
	return rows[0];
}
