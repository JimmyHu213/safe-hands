import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// ---------- enums (string unions enforced in Zod + CHECK constraints) ----------

export const SUBMISSION_STATUS = ["new", "contacted", "qualified", "archived"] as const;
export const EDUCATOR_STATUS = [
  "draft",
  "submitted",
  "shortlisted",
  "interviewed",
  "rejected",
  "archived",
] as const;
export const CENTRE_ROLE = ["cert3", "diploma", "ect", "room_leader", "oshc"] as const;
export const FAMILY_CARE_TYPE = ["after_school", "holiday", "ad_hoc", "overnight"] as const;
export const EDUCATOR_QUALIFICATION = ["cert3", "diploma", "ect", "adv_dip", "other"] as const;
export const EDUCATOR_DOC_TYPE = [
  "wwcc",
  "first_aid_hltaid012",
  "cert3_diploma",
  "id_document",
  "reference_letter",
  "other",
] as const;
export const FAQ_AUDIENCE = ["centre", "family", "educator", "general"] as const;

// ---------- centre requests ----------

export const centreRequests = sqliteTable(
  "centre_requests",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: SUBMISSION_STATUS }).notNull().default("new"),
    centreName: text("centre_name").notNull(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    suburb: text("suburb").notNull(),
    postcode: text("postcode").notNull(),
    roleNeeded: text("role_needed", { enum: CENTRE_ROLE }).notNull(),
    shiftDate: text("shift_date").notNull(),
    shiftStart: text("shift_start").notNull(),
    shiftDurationHrs: real("shift_duration_hrs").notNull(),
    specialNeedsFlag: integer("special_needs_flag", { mode: "boolean" }).notNull().default(false),
    notes: text("notes"),
    source: text("source"),
    ipHash: text("ip_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byStatus: index("centre_requests_status_created").on(t.status, t.createdAt),
    byEmail: index("centre_requests_email").on(t.contactEmail),
  }),
);

// ---------- family requests ----------

export const familyRequests = sqliteTable(
  "family_requests",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: SUBMISSION_STATUS }).notNull().default("new"),
    parentName: text("parent_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    suburb: text("suburb").notNull(),
    postcode: text("postcode").notNull(),
    childrenCount: integer("children_count").notNull(),
    childrenAges: text("children_ages").notNull(),
    careType: text("care_type", { enum: FAMILY_CARE_TYPE }).notNull(),
    shiftDate: text("shift_date").notNull(),
    shiftStart: text("shift_start").notNull(),
    shiftDurationHrs: real("shift_duration_hrs").notNull(),
    specialNeedsFlag: integer("special_needs_flag", { mode: "boolean" }).notNull().default(false),
    specialNeedsNotes: text("special_needs_notes"),
    notes: text("notes"),
    source: text("source"),
    ipHash: text("ip_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byStatus: index("family_requests_status_created").on(t.status, t.createdAt),
    byEmail: index("family_requests_email").on(t.contactEmail),
  }),
);

// ---------- educator applications ----------

export const educatorApplications = sqliteTable(
  "educator_applications",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: EDUCATOR_STATUS }).notNull().default("draft"),
    stepCompleted: integer("step_completed").notNull().default(0),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    suburb: text("suburb").notNull(),
    postcode: text("postcode").notNull(),
    privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull(),
    privacyConsentAt: integer("privacy_consent_at"),
    qualificationLevel: text("qualification_level", { enum: EDUCATOR_QUALIFICATION }),
    qualificationOther: text("qualification_other"),
    yearsExperience: integer("years_experience"),
    specialNeedsExperience: integer("special_needs_experience", { mode: "boolean" }),
    specialNeedsNotes: text("special_needs_notes"),
    availability: text("availability"), // JSON string
    travelRadiusKm: integer("travel_radius_km"),
    hasOwnTransport: integer("has_own_transport", { mode: "boolean" }),
    submittedAt: integer("submitted_at"),
    source: text("source"),
    ipHash: text("ip_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byStatus: index("educator_apps_status_created").on(t.status, t.createdAt),
    byEmail: index("educator_apps_email").on(t.email),
  }),
);

// ---------- educator resume tokens ----------

export const educatorResumeTokens = sqliteTable(
  "educator_resume_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => educatorApplications.id),
    expiresAt: integer("expires_at").notNull(),
    usedAt: integer("used_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    byApp: index("resume_tokens_app").on(t.applicationId),
    byExpiry: index("resume_tokens_expiry").on(t.expiresAt),
  }),
);

// ---------- educator documents ----------

export const educatorDocuments = sqliteTable(
  "educator_documents",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => educatorApplications.id),
    docType: text("doc_type", { enum: EDUCATOR_DOC_TYPE }).notNull(),
    r2Key: text("r2_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    uploadedAt: integer("uploaded_at").notNull(),
  },
  (t) => ({
    byApp: index("documents_app").on(t.applicationId),
  }),
);

// ---------- admin magic links ----------

export const adminMagicLinks = sqliteTable(
  "admin_magic_links",
  {
    tokenHash: text("token_hash").primaryKey(),
    email: text("email").notNull(),
    expiresAt: integer("expires_at").notNull(),
    usedAt: integer("used_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    byExpiry: index("magic_links_expiry").on(t.expiresAt),
  }),
);

// ---------- admin sessions ----------

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    sessionIdHash: text("session_id_hash").primaryKey(),
    email: text("email").notNull(),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
  },
  (t) => ({
    byExpiry: index("sessions_expiry").on(t.expiresAt),
  }),
);

// ---------- faq entries ----------

export const faqEntries = sqliteTable(
  "faq_entries",
  {
    id: text("id").primaryKey(),
    audience: text("audience", { enum: FAQ_AUDIENCE }).notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    byAudience: index("faq_audience_sort").on(t.audience, t.sortOrder),
  }),
);

// ---------- media ----------

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  r2Key: text("r2_key").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  altText: text("alt_text"),
  width: integer("width"),
  height: integer("height"),
  createdAt: integer("created_at").notNull(),
});

// ---------- inferred row types ----------

export type CentreRequest = typeof centreRequests.$inferSelect;
export type NewCentreRequest = typeof centreRequests.$inferInsert;
export type FamilyRequest = typeof familyRequests.$inferSelect;
export type NewFamilyRequest = typeof familyRequests.$inferInsert;
export type EducatorApplication = typeof educatorApplications.$inferSelect;
export type NewEducatorApplication = typeof educatorApplications.$inferInsert;
export type EducatorDocument = typeof educatorDocuments.$inferSelect;
export type FaqEntry = typeof faqEntries.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
