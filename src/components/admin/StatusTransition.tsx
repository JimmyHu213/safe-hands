"use client";
import { useActionState } from "react";
import { changeStatus, type StatusActionState } from "@/app/admin/submissions/[type]/[id]/actions";

const OPTIONS_DEFAULT = ["new", "contacted", "qualified", "archived"];
const OPTIONS_EDUCATOR = ["draft", "submitted", "shortlisted", "interviewed", "rejected", "archived"];

export function StatusTransition({
	type,
	id,
	current,
}: {
	type: "centre" | "family" | "educator";
	id: string;
	current: string;
}) {
	const [state, action, pending] = useActionState<StatusActionState, FormData>(
		changeStatus, { ok: true },
	);
	const opts = type === "educator" ? OPTIONS_EDUCATOR : OPTIONS_DEFAULT;
	return (
		<form action={action} className="flex items-center gap-2 text-sm">
			<input type="hidden" name="type" value={type} />
			<input type="hidden" name="id" value={id} />
			<label className="flex items-center gap-2">
				<span>Status:</span>
				<select name="status" defaultValue={current} className="rounded-md border px-2 py-1">
					{opts.map((o) => <option key={o} value={o}>{o}</option>)}
				</select>
			</label>
			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-ink-950 px-3 py-1 text-white disabled:opacity-60"
			>
				{pending ? "Saving…" : "Update"}
			</button>
			{state.error ? <span className="text-red-700">{state.error}</span> : null}
		</form>
	);
}
