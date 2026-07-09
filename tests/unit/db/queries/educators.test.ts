import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import {
	createDraftEducator,
	getDraftById,
	updateEducatorStep2,
	recordEducatorDocument,
	listEducatorDocuments,
	setStep3Complete,
	finalizeEducatorApplication,
} from "@/lib/db/queries/educators";

describe("educator queries", () => {
	it("draft → step2 → docs → finalize", async () => {
		const db = makeTestDb();
		const id = await createDraftEducator(db as any, {
			firstName: "Alex", lastName: "Park", email: "alex@example.com", phone: "0400000000",
			suburb: "Marrickville", postcode: "2204", privacyConsent: true, ipHash: "h",
		});
		expect((await getDraftById(db as any, id))?.stepCompleted).toBe(1);

		await updateEducatorStep2(db as any, id, {
			qualificationLevel: "diploma", qualificationOther: "",
			yearsExperience: 4, specialNeedsExperience: true, specialNeedsNotes: "ASD",
			availability: { mon: ["am"], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
			travelRadiusKm: 10, hasOwnTransport: true,
		});
		expect((await getDraftById(db as any, id))?.stepCompleted).toBe(2);

		await recordEducatorDocument(db as any, {
			applicationId: id, docType: "wwcc", r2Key: "k1",
			originalFilename: "wwcc.pdf", mimeType: "application/pdf", sizeBytes: 1000,
		});
		expect(await listEducatorDocuments(db as any, id)).toHaveLength(1);

		await setStep3Complete(db as any, id);
		expect((await getDraftById(db as any, id))?.stepCompleted).toBe(3);

		await finalizeEducatorApplication(db as any, id);
		const final = await getDraftById(db as any, id);
		expect(final?.status).toBe("submitted");
		expect(final?.submittedAt).toBeGreaterThan(0);
		expect(final?.stepCompleted).toBe(4);
	});
});
