import { z } from "zod";
import {
	CENTRE_ROLE,
	FAMILY_CARE_TYPE,
	EDUCATOR_QUALIFICATION,
	EDUCATOR_DOC_TYPE,
} from "@/lib/db/schema";

const phoneRe = /^[+]?[\d\s()-]{8,20}$/;
const postcodeRe = /^\d{4}$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const timeRe = /^\d{2}:\d{2}$/;

const txt = (max: number) => z.string().trim().min(1).max(max);

export const centreRequestSchema = z.object({
	centreName: txt(200),
	contactName: txt(200),
	contactEmail: z.string().email().max(200),
	contactPhone: z.string().regex(phoneRe),
	suburb: txt(100),
	postcode: z.string().regex(postcodeRe),
	roleNeeded: z.enum(CENTRE_ROLE),
	shiftDate: z.string().regex(dateRe),
	shiftStart: z.string().regex(timeRe),
	shiftDurationHrs: z.number().min(0.5).max(24),
	specialNeedsFlag: z.boolean(),
	notes: z.string().max(2000).default(""),
	privacyConsent: z.literal(true),
	turnstileToken: z.string().min(1).max(2048),
});
export type CentreRequestInput = z.infer<typeof centreRequestSchema>;

export const familyRequestSchema = z.object({
	parentName: txt(200),
	contactEmail: z.string().email().max(200),
	contactPhone: z.string().regex(phoneRe),
	suburb: txt(100),
	postcode: z.string().regex(postcodeRe),
	childrenCount: z.number().int().min(1).max(10),
	childrenAges: z.string().max(100),
	careType: z.enum(FAMILY_CARE_TYPE),
	shiftDate: z.string().regex(dateRe),
	shiftStart: z.string().regex(timeRe),
	shiftDurationHrs: z.number().min(0.5).max(24),
	specialNeedsFlag: z.boolean(),
	specialNeedsNotes: z.string().max(2000).default(""),
	notes: z.string().max(2000).default(""),
	privacyConsent: z.literal(true),
	turnstileToken: z.string().min(1).max(2048),
});
export type FamilyRequestInput = z.infer<typeof familyRequestSchema>;

export const educatorStep1Schema = z.object({
	firstName: txt(100),
	lastName: txt(100),
	email: z.string().email().max(200),
	phone: z.string().regex(phoneRe),
	suburb: txt(100),
	postcode: z.string().regex(postcodeRe),
	privacyConsent: z.literal(true),
	turnstileToken: z.string().min(1).max(2048),
});
export type EducatorStep1Input = z.infer<typeof educatorStep1Schema>;

const dailyAvail = z.array(z.enum(["am", "pm"])).default([]);
export const availabilitySchema = z.object({
	mon: dailyAvail, tue: dailyAvail, wed: dailyAvail, thu: dailyAvail,
	fri: dailyAvail, sat: dailyAvail, sun: dailyAvail,
});
export type Availability = z.infer<typeof availabilitySchema>;

export const educatorStep2Schema = z.object({
	qualificationLevel: z.enum(EDUCATOR_QUALIFICATION),
	qualificationOther: z.string().max(200).default(""),
	yearsExperience: z.number().int().min(0).max(60),
	specialNeedsExperience: z.boolean(),
	specialNeedsNotes: z.string().max(2000).default(""),
	availability: availabilitySchema,
	travelRadiusKm: z.number().int().min(0).max(200),
	hasOwnTransport: z.boolean(),
});
export type EducatorStep2Input = z.infer<typeof educatorStep2Schema>;

const documentSchema = z.object({
	docType: z.enum(EDUCATOR_DOC_TYPE),
	r2Key: z.string().min(1).max(500),
	originalFilename: z.string().min(1).max(300),
	mimeType: z.string().min(1).max(100),
	sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
});

export const educatorStep3Schema = z
	.object({ documents: z.array(documentSchema).min(3).max(20) })
	.refine(
		(v) => {
			const types = new Set(v.documents.map((d) => d.docType));
			return types.has("wwcc") && types.has("first_aid_hltaid012") && types.has("cert3_diploma");
		},
		{ message: "WWCC, First Aid (HLTAID012), and Cert III/Diploma documents are all required" },
	);
export type EducatorStep3Input = z.infer<typeof educatorStep3Schema>;
