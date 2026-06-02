import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { insertFamilyRequest, getFamilyRequestById } from "@/lib/db/queries/families";

describe("insertFamilyRequest", () => {
	it("inserts a row with status=new", async () => {
		const db = makeTestDb();
		const id = await insertFamilyRequest(db as any, {
			parentName: "Sam Lee",
			contactEmail: "sam@example.com",
			contactPhone: "0400123456",
			suburb: "Newtown",
			postcode: "2042",
			childrenCount: 2,
			childrenAges: "3,7",
			careType: "after_school",
			shiftDate: "2026-07-10",
			shiftStart: "15:00",
			shiftDurationHrs: 3,
			specialNeedsFlag: false,
			specialNeedsNotes: "",
			notes: "",
			ipHash: "abc",
			source: null,
		});
		const row = await getFamilyRequestById(db as any, id);
		expect(row?.status).toBe("new");
		expect(row?.parentName).toBe("Sam Lee");
	});
});
