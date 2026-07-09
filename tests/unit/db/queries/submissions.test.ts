import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { listSubmissions, getSubmission, updateStatus, getCounts } from "@/lib/db/queries/submissions";
import { insertCentreRequest } from "@/lib/db/queries/centres";
import { insertFamilyRequest } from "@/lib/db/queries/families";
import { createDraftEducator, finalizeEducatorApplication } from "@/lib/db/queries/educators";

describe("submissions", () => {
	it("lists across all 3 types, newest first", async () => {
		const db = makeTestDb();
		const c = await insertCentreRequest(db as any, {
			centreName: "C", contactName: "X", contactEmail: "x@x.example", contactPhone: "0",
			suburb: "S", postcode: "2000", roleNeeded: "cert3", shiftDate: "2026-07-01",
			shiftStart: "08:00", shiftDurationHrs: 6, specialNeedsFlag: false, notes: "",
			ipHash: "h", source: null,
		});
		const f = await insertFamilyRequest(db as any, {
			parentName: "P", contactEmail: "p@p.example", contactPhone: "0", suburb: "S",
			postcode: "2000", childrenCount: 1, childrenAges: "5", careType: "after_school",
			shiftDate: "2026-07-02", shiftStart: "15:00", shiftDurationHrs: 3,
			specialNeedsFlag: false, specialNeedsNotes: "", notes: "", ipHash: "h", source: null,
		});
		const e = await createDraftEducator(db as any, {
			firstName: "E", lastName: "D", email: "e@d.example", phone: "0",
			suburb: "S", postcode: "2000", privacyConsent: true, ipHash: "h",
		});
		await finalizeEducatorApplication(db as any, e);

		const list = await listSubmissions(db as any, { type: "all", status: "all", q: "", limit: 50, offset: 0 });
		expect(list.length).toBeGreaterThanOrEqual(3);

		const counts = await getCounts(db as any);
		expect(counts.centre).toBe(1);
		expect(counts.family).toBe(1);
		expect(counts.educator).toBe(1);

		expect((await getSubmission(db as any, "centre", c))?.contactEmail).toBe("x@x.example");
		await updateStatus(db as any, "centre", c, "contacted");
		expect((await getSubmission(db as any, "centre", c))?.status).toBe("contacted");
	});
});
