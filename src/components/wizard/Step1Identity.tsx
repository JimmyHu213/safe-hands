"use client";
import { useActionState } from "react";
import { educatorStep1Action, type WizardActionState } from "@/app/(marketing)/for-educators/apply/actions";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

export function Step1Identity({ siteKey }: { siteKey: string }) {
	const [state, action, pending] = useActionState<WizardActionState, FormData>(
		educatorStep1Action, { ok: true },
	);
	return (
		<form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Field name="firstName" label="First name" required />
			<Field name="lastName" label="Last name" required />
			<Field name="email" label="Email" type="email" required />
			<Field name="phone" label="Phone" type="tel" required />
			<Field name="suburb" label="Suburb" required />
			<Field name="postcode" label="Postcode" required pattern="\d{4}" />
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
					{pending ? "Saving…" : "Save and continue"}
				</button>
			</div>
		</form>
	);
}

function Field(props: { name: string; label: string; type?: string; required?: boolean; pattern?: string }) {
	return (
		<label className="flex flex-col gap-1 text-sm">
			<span className="font-medium">{props.label}{props.required ? " *" : ""}</span>
			<input
				name={props.name}
				type={props.type ?? "text"}
				required={props.required}
				pattern={props.pattern}
				className="rounded-md border px-3 py-2"
			/>
		</label>
	);
}
