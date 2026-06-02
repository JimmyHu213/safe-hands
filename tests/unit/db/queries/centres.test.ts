import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { insertCentreRequest, getCentreRequestById } from "@/lib/db/queries/centres";

describe("insertCentreRequest", () => {
	it("inserts a row with status=new and returns the id", async () => {
		const db = makeTestDb();
		const id = await insertCentreRequest(db as any, {
			centreName: "Sunny Days",
			contactName: "Jane",
			contactEmail: "jane@sunny.example",
			contactPhone: "0400000000",
			suburb: "Parramatta",
			postcode: "2150",
			roleNeeded: "cert3",
			shiftDate: "2026-07-10",
			shiftStart: "07:30",
			shiftDurationHrs: 8,
			specialNeedsFlag: false,
			notes: "",
			ipHash: "abc",
			source: null,
		});
		expect(id).toMatch(/^[0-9A-Za-z_-]{26}$/);
		const row = await getCentreRequestById(db as any, id);
		expect(row?.status).toBe("new");
		expect(row?.centreName).toBe("Sunny Days");
	});
});
