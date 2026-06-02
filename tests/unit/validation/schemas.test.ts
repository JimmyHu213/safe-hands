import { describe, it, expect } from "vitest";
import {
	centreRequestSchema,
	familyRequestSchema,
	educatorStep1Schema,
	educatorStep2Schema,
	educatorStep3Schema,
} from "@/lib/validation/schemas";

describe("centreRequestSchema", () => {
	const valid = {
		centreName: "Sunny Days ELC",
		contactName: "Jane Smith",
		contactEmail: "jane@sunny.example",
		contactPhone: "0400123456",
		suburb: "Parramatta",
		postcode: "2150",
		roleNeeded: "cert3",
		shiftDate: "2026-07-10",
		shiftStart: "07:30",
		shiftDurationHrs: 8,
		specialNeedsFlag: false,
		notes: "",
		privacyConsent: true,
		turnstileToken: "tok",
	};
	it("accepts a valid payload", () => {
		expect(() => centreRequestSchema.parse(valid)).not.toThrow();
	});
	it("rejects missing privacy consent", () => {
		expect(() => centreRequestSchema.parse({ ...valid, privacyConsent: false })).toThrow();
	});
	it("rejects bad postcode", () => {
		expect(() => centreRequestSchema.parse({ ...valid, postcode: "abc" })).toThrow();
	});
	it("rejects unknown role", () => {
		expect(() => centreRequestSchema.parse({ ...valid, roleNeeded: "unknown" })).toThrow();
	});
	it("caps notes at 2000 chars", () => {
		expect(() => centreRequestSchema.parse({ ...valid, notes: "x".repeat(2001) })).toThrow();
	});
});

describe("familyRequestSchema", () => {
	const valid = {
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
		privacyConsent: true,
		turnstileToken: "tok",
	};
	it("accepts a valid payload", () => {
		expect(() => familyRequestSchema.parse(valid)).not.toThrow();
	});
	it("rejects childrenCount < 1", () => {
		expect(() => familyRequestSchema.parse({ ...valid, childrenCount: 0 })).toThrow();
	});
});

describe("educator step schemas", () => {
	it("step 1 accepts identity payload", () => {
		expect(() =>
			educatorStep1Schema.parse({
				firstName: "Alex",
				lastName: "Park",
				email: "alex@example.com",
				phone: "0400123456",
				suburb: "Marrickville",
				postcode: "2204",
				privacyConsent: true,
				turnstileToken: "tok",
			}),
		).not.toThrow();
	});
	it("step 2 accepts qualification payload", () => {
		expect(() =>
			educatorStep2Schema.parse({
				qualificationLevel: "diploma",
				qualificationOther: "",
				yearsExperience: 5,
				specialNeedsExperience: true,
				specialNeedsNotes: "ASD support 2 yrs",
				availability: { mon: ["am", "pm"], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
				travelRadiusKm: 15,
				hasOwnTransport: true,
			}),
		).not.toThrow();
	});
	it("step 3 requires the three mandatory docs", () => {
		expect(() =>
			educatorStep3Schema.parse({
				documents: [
					{ docType: "wwcc", r2Key: "k1", originalFilename: "wwcc.pdf", mimeType: "application/pdf", sizeBytes: 100 },
					{ docType: "first_aid_hltaid012", r2Key: "k2", originalFilename: "fa.pdf", mimeType: "application/pdf", sizeBytes: 100 },
					{ docType: "cert3_diploma", r2Key: "k3", originalFilename: "c3.pdf", mimeType: "application/pdf", sizeBytes: 100 },
				],
			}),
		).not.toThrow();
	});
	it("step 3 rejects when a mandatory doc is missing", () => {
		expect(() =>
			educatorStep3Schema.parse({
				documents: [
					{ docType: "wwcc", r2Key: "k1", originalFilename: "wwcc.pdf", mimeType: "application/pdf", sizeBytes: 100 },
				],
			}),
		).toThrow();
	});
});
