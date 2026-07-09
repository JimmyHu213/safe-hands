import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
	educatorApplications,
	educatorDocuments,
	type EducatorApplication,
	type EducatorDocument,
	EDUCATOR_DOC_TYPE,
} from "@/lib/db/schema";
import { newId } from "@/lib/util/ulid";
import type { EducatorStep2Input } from "@/lib/validation/schemas";

export interface CreateDraftInput {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	suburb: string;
	postcode: string;
	privacyConsent: boolean;
	ipHash: string;
}

export async function createDraftEducator(db: Db, input: CreateDraftInput): Promise<string> {
	const id = newId();
	const now = Date.now();
	await db.insert(educatorApplications).values({
		id,
		status: "draft",
		stepCompleted: 1,
		firstName: input.firstName,
		lastName: input.lastName,
		email: input.email,
		phone: input.phone,
		suburb: input.suburb,
		postcode: input.postcode,
		privacyConsent: input.privacyConsent,
		privacyConsentAt: now,
		ipHash: input.ipHash,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

export async function getDraftById(db: Db, id: string): Promise<EducatorApplication | undefined> {
	const rows = await db.select().from(educatorApplications).where(eq(educatorApplications.id, id)).limit(1);
	return rows[0];
}

export async function updateEducatorStep2(db: Db, id: string, input: EducatorStep2Input): Promise<void> {
	const now = Date.now();
	await db.update(educatorApplications)
		.set({
			qualificationLevel: input.qualificationLevel,
			qualificationOther: input.qualificationOther || null,
			yearsExperience: input.yearsExperience,
			specialNeedsExperience: input.specialNeedsExperience,
			specialNeedsNotes: input.specialNeedsNotes || null,
			availability: JSON.stringify(input.availability),
			travelRadiusKm: input.travelRadiusKm,
			hasOwnTransport: input.hasOwnTransport,
			stepCompleted: 2,
			updatedAt: now,
		})
		.where(eq(educatorApplications.id, id));
}

export interface RecordDocInput {
	applicationId: string;
	docType: (typeof EDUCATOR_DOC_TYPE)[number];
	r2Key: string;
	originalFilename: string;
	mimeType: string;
	sizeBytes: number;
}

export async function recordEducatorDocument(db: Db, input: RecordDocInput): Promise<string> {
	const id = newId();
	await db.insert(educatorDocuments).values({
		id,
		applicationId: input.applicationId,
		docType: input.docType,
		r2Key: input.r2Key,
		originalFilename: input.originalFilename,
		mimeType: input.mimeType,
		sizeBytes: input.sizeBytes,
		uploadedAt: Date.now(),
	});
	return id;
}

export async function listEducatorDocuments(db: Db, applicationId: string): Promise<EducatorDocument[]> {
	return db.select().from(educatorDocuments).where(eq(educatorDocuments.applicationId, applicationId));
}

export async function setStep3Complete(db: Db, id: string): Promise<void> {
	await db.update(educatorApplications)
		.set({ stepCompleted: 3, updatedAt: Date.now() })
		.where(eq(educatorApplications.id, id));
}

export async function finalizeEducatorApplication(db: Db, id: string): Promise<void> {
	const now = Date.now();
	await db.update(educatorApplications)
		.set({ status: "submitted", submittedAt: now, stepCompleted: 4, updatedAt: now })
		.where(eq(educatorApplications.id, id));
}
