CREATE TABLE `admin_magic_links` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `magic_links_expiry` ON `admin_magic_links` (`expires_at`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`session_id_hash` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_expiry` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `centre_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`centre_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`contact_phone` text NOT NULL,
	`suburb` text NOT NULL,
	`postcode` text NOT NULL,
	`role_needed` text NOT NULL,
	`shift_date` text NOT NULL,
	`shift_start` text NOT NULL,
	`shift_duration_hrs` real NOT NULL,
	`special_needs_flag` integer DEFAULT false NOT NULL,
	`notes` text,
	`source` text,
	`ip_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `centre_requests_status_created` ON `centre_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `centre_requests_email` ON `centre_requests` (`contact_email`);--> statement-breakpoint
CREATE TABLE `educator_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`step_completed` integer DEFAULT 0 NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`suburb` text NOT NULL,
	`postcode` text NOT NULL,
	`privacy_consent` integer NOT NULL,
	`privacy_consent_at` integer,
	`qualification_level` text,
	`qualification_other` text,
	`years_experience` integer,
	`special_needs_experience` integer,
	`special_needs_notes` text,
	`availability` text,
	`travel_radius_km` integer,
	`has_own_transport` integer,
	`submitted_at` integer,
	`source` text,
	`ip_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `educator_apps_status_created` ON `educator_applications` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `educator_apps_email` ON `educator_applications` (`email`);--> statement-breakpoint
CREATE TABLE `educator_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`doc_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`original_filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`uploaded_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `educator_applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `documents_app` ON `educator_documents` (`application_id`);--> statement-breakpoint
CREATE TABLE `educator_resume_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `educator_applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `resume_tokens_app` ON `educator_resume_tokens` (`application_id`);--> statement-breakpoint
CREATE INDEX `resume_tokens_expiry` ON `educator_resume_tokens` (`expires_at`);--> statement-breakpoint
CREATE TABLE `family_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`parent_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`contact_phone` text NOT NULL,
	`suburb` text NOT NULL,
	`postcode` text NOT NULL,
	`children_count` integer NOT NULL,
	`children_ages` text NOT NULL,
	`care_type` text NOT NULL,
	`shift_date` text NOT NULL,
	`shift_start` text NOT NULL,
	`shift_duration_hrs` real NOT NULL,
	`special_needs_flag` integer DEFAULT false NOT NULL,
	`special_needs_notes` text,
	`notes` text,
	`source` text,
	`ip_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `family_requests_status_created` ON `family_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `family_requests_email` ON `family_requests` (`contact_email`);--> statement-breakpoint
CREATE TABLE `faq_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`audience` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `faq_audience_sort` ON `faq_entries` (`audience`,`sort_order`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`r2_key` text NOT NULL,
	`original_filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`alt_text` text,
	`width` integer,
	`height` integer,
	`created_at` integer NOT NULL
);
