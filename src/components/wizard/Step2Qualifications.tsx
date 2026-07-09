"use client";
import { useActionState } from "react";
import { educatorStep2Action, type WizardActionState } from "@/app/(marketing)/for-educators/apply/actions";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABEL: Record<(typeof DAYS)[number], string> = {
	mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

export function Step2Qualifications() {
	const [state, action, pending] = useActionState<WizardActionState, FormData>(
		educatorStep2Action, { ok: true },
	);
	return (
		<form action={action} className="space-y-6">
			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium">Highest qualification *</span>
				<select name="qualificationLevel" required className="rounded-md border px-3 py-2">
					<option value="cert3">Cert III ECEC</option>
					<option value="diploma">Diploma</option>
					<option value="ect">Early Childhood Teacher (ECT)</option>
					<option value="adv_dip">Advanced Diploma</option>
					<option value="other">Other</option>
				</select>
			</label>
			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium">If "Other", specify</span>
				<input name="qualificationOther" type="text" className="rounded-md border px-3 py-2" />
			</label>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<label className="flex flex-col gap-1 text-sm">
					<span className="font-medium">Years of experience *</span>
					<input name="yearsExperience" type="number" min={0} max={60} required className="rounded-md border px-3 py-2" />
				</label>
				<label className="flex flex-col gap-1 text-sm">
					<span className="font-medium">Travel radius (km) *</span>
					<input name="travelRadiusKm" type="number" min={0} max={200} required className="rounded-md border px-3 py-2" />
				</label>
			</div>
			<label className="flex items-center gap-2 text-sm">
				<input type="checkbox" name="hasOwnTransport" /> I have my own transport
			</label>
			<label className="flex items-center gap-2 text-sm">
				<input type="checkbox" name="specialNeedsExperience" /> I have special-needs / behavioural-support experience
			</label>
			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium">Special-needs experience notes (optional)</span>
				<textarea name="specialNeedsNotes" rows={3} maxLength={2000} className="rounded-md border px-3 py-2" />
			</label>
			<fieldset>
				<legend className="text-sm font-medium">Availability</legend>
				<div className="mt-2 overflow-x-auto">
					<table className="w-full text-sm">
						<thead><tr><th></th><th className="px-2">AM</th><th className="px-2">PM</th></tr></thead>
						<tbody>
							{DAYS.map((d) => (
								<tr key={d}>
									<td className="py-1 pr-2 font-medium">{DAY_LABEL[d]}</td>
									<td className="px-2"><input type="checkbox" name={`availability_${d}`} value="am" /></td>
									<td className="px-2"><input type="checkbox" name={`availability_${d}`} value="pm" /></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</fieldset>
			{state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
			>
				{pending ? "Saving…" : "Save and continue"}
			</button>
		</form>
	);
}
