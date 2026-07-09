"use client";

import { useActionState } from "react";
import { submitCentreRequest, type ActionState } from "@/app/(marketing)/for-centres/request/actions";
import { TurnstileWidget } from "./TurnstileWidget";

const ROLE_OPTIONS: { value: string; label: string }[] = [
	{ value: "cert3", label: "Cert III" },
	{ value: "diploma", label: "Diploma" },
	{ value: "ect", label: "Early Childhood Teacher" },
	{ value: "room_leader", label: "Room Leader" },
	{ value: "oshc", label: "OSHC" },
];

export function CentreRequestForm({ siteKey }: { siteKey: string }) {
	const [state, action, pending] = useActionState<ActionState, FormData>(submitCentreRequest, { ok: true });
	return (
		<form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Field name="centreName" label="Centre name" required />
			<Field name="contactName" label="Your name" required />
			<Field name="contactEmail" label="Email" type="email" required />
			<Field name="contactPhone" label="Phone" type="tel" required />
			<Field name="suburb" label="Suburb" required />
			<Field name="postcode" label="Postcode" required pattern="\d{4}" inputMode="numeric" />
			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium">Role needed</span>
				<select name="roleNeeded" required className="rounded-md border px-3 py-2">
					{ROLE_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>{o.label}</option>
					))}
				</select>
			</label>
			<Field name="shiftDate" label="Shift date" type="date" required />
			<Field name="shiftStart" label="Shift start" type="time" required />
			<Field name="shiftDurationHrs" label="Duration (hours)" type="number" step="0.5" min="0.5" required />
			<label className="md:col-span-2 flex items-center gap-2 text-sm">
				<input type="checkbox" name="specialNeedsFlag" />
				Educator should have special-needs / behavioural-support experience
			</label>
			<label className="md:col-span-2 flex flex-col gap-1 text-sm">
				<span className="font-medium">Notes (optional, max 2000 chars)</span>
				<textarea name="notes" maxLength={2000} rows={4} className="rounded-md border px-3 py-2" />
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
					className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
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
}) {
	return (
		<label className="flex flex-col gap-1 text-sm">
			<span className="font-medium">{props.label}{props.required ? " *" : ""}</span>
			<input
				name={props.name}
				type={props.type ?? "text"}
				required={props.required}
				pattern={props.pattern}
				inputMode={props.inputMode}
				step={props.step}
				min={props.min}
				className="rounded-md border px-3 py-2"
			/>
		</label>
	);
}
