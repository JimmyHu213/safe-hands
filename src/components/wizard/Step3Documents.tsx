"use client";
import { useActionState, useState } from "react";
import { educatorStep3Action, type WizardActionState } from "@/app/(marketing)/for-educators/apply/actions";
import { FileUploadField, type UploadedDoc } from "./FileUploadField";

const DOCS = [
	{ docType: "wwcc", label: "Working With Children Check (mandatory)" },
	{ docType: "first_aid_hltaid012", label: "HLTAID012 First Aid (mandatory)" },
	{ docType: "cert3_diploma", label: "Cert III or Diploma certificate (mandatory)" },
	{ docType: "id_document", label: "Photo ID (optional but recommended)" },
	{ docType: "reference_letter", label: "Reference letter (optional)" },
];

export function Step3Documents() {
	const [uploaded, setUploaded] = useState<UploadedDoc[]>([]);
	const [state, action, pending] = useActionState<WizardActionState, FormData>(
		educatorStep3Action,
		{ ok: true },
	);

	return (
		<div className="space-y-6">
			<p className="text-sm text-slate-700">
				Upload each document below as PDF, JPG, or PNG (max 10MB). Files upload directly to secure
				storage; we only keep a reference.
			</p>
			{DOCS.map((d) => (
				<FileUploadField
					key={d.docType}
					docType={d.docType}
					label={d.label}
					onUploaded={(doc) => setUploaded((prev) => [...prev, doc])}
				/>
			))}
			{uploaded.length > 0 ? (
				<ul className="rounded-md bg-slate-50 p-3 text-sm">
					{uploaded.map((u, i) => (
						<li key={i}>✓ {u.docType} — {u.originalFilename}</li>
					))}
				</ul>
			) : null}
			<form action={action}>
				{state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
				<button
					type="submit"
					disabled={pending}
					className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
				>
					{pending ? "Checking…" : "Continue to review"}
				</button>
			</form>
		</div>
	);
}
