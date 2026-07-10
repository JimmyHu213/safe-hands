"use client";

import { useActionState } from "react";
import { submitFamilyRequest, type ActionState } from "@/app/(marketing)/for-families/request/actions";
import { TurnstileWidget } from "./TurnstileWidget";

const CARE_OPTIONS: { value: string; label: string }[] = [
	{ value: "after_school", label: "After-school" },
	{ value: "holiday", label: "School holidays" },
	{ value: "ad_hoc", label: "Ad-hoc / one-off" },
	{ value: "overnight", label: "Overnight" },
];

export function FamilyRequestForm({ siteKey }: { siteKey: string }) {
	const [state, action, pending] = useActionState<ActionState, FormData>(submitFamilyRequest, { ok: true });
	return (
		<form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Field name="parentName" label="Your name" required />
			<Field name="contactEmail" label="Email" type="email" required />
			<Field name="contactPhone" label="Phone" type="tel" required />
			<Field name="suburb" label="Suburb" required />
			<Field name="postcode" label="Postcode" required pattern="\d{4}" inputMode="numeric" />
			<Field name="childrenCount" label="Number of children" type="number" min="1" max="10" required />
			<label className="md:col-span-2 flex flex-col gap-1">
				<span className="sh-label">Children&apos;s ages (comma-separated, e.g. 3, 7) *</span>
				<input name="childrenAges" type="text" required className="sh-field" />
			</label>
			<label className="flex flex-col gap-1">
				<span className="sh-label">Care type</span>
				<select name="careType" required className="sh-field">
					{CARE_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>{o.label}</option>
					))}
				</select>
			</label>
			<Field name="shiftDate" label="Shift date" type="date" required />
			<Field name="shiftStart" label="Shift start" type="time" required />
			<Field name="shiftDurationHrs" label="Duration (hours)" type="number" step="0.5" min="0.5" required />
			<label className="md:col-span-2 flex items-center gap-2 text-sm">
				<input type="checkbox" name="specialNeedsFlag" />
				My child(ren) need(s) special-needs experience
			</label>
			<label className="md:col-span-2 flex flex-col gap-1">
				<span className="sh-label">Special-needs notes (optional)</span>
				<textarea name="specialNeedsNotes" maxLength={2000} rows={3} className="sh-field" />
			</label>
			<label className="md:col-span-2 flex flex-col gap-1">
				<span className="sh-label">Notes (optional, max 2000 chars)</span>
				<textarea name="notes" maxLength={2000} rows={4} className="sh-field" />
			</label>
			<label className="md:col-span-2 flex items-center gap-2 text-sm">
				<input type="checkbox" name="privacyConsent" required />
				I have read and agree to the <a href="/legal/privacy" className="underline">Privacy Policy</a>.
			</label>
			<div className="md:col-span-2"><TurnstileWidget siteKey={siteKey} /></div>
			{state.error ? <p className="md:col-span-2 text-sm text-red-700">{state.error}</p> : null}
			<div className="md:col-span-2">
				<button
					type="submit"
					disabled={pending}
					className="sh-btn-accent disabled:opacity-60"
				>
					{pending ? "Submitting…" : "Submit request"}
				</button>
			</div>
		</form>
	);
}

function Field(props: {
	name: string;
	label: string;
	type?: string;
	required?: boolean;
	pattern?: string;
	inputMode?: "numeric" | "text";
	step?: string;
	min?: string;
	max?: string;
}) {
	return (
		<label className="flex flex-col gap-1">
			<span className="sh-label">{props.label}{props.required ? " *" : ""}</span>
			<input
				name={props.name}
				type={props.type ?? "text"}
				required={props.required}
				pattern={props.pattern}
				inputMode={props.inputMode}
				step={props.step}
				min={props.min}
				max={props.max}
				className="sh-field"
			/>
		</label>
	);
}
