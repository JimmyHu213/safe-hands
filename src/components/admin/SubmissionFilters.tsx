"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function SubmissionFilters() {
	const router = useRouter();
	const sp = useSearchParams();
	const update = (k: string, v: string) => {
		const next = new URLSearchParams(sp.toString());
		if (v) next.set(k, v); else next.delete(k);
		next.delete("offset");
		router.push(`/admin/submissions?${next.toString()}`);
	};
	return (
		<form className="flex flex-wrap gap-2 text-sm" role="search">
			<select
				aria-label="Filter by submission type"
				defaultValue={sp.get("type") ?? "all"}
				onChange={(e) => update("type", e.target.value === "all" ? "" : e.target.value)}
				className="rounded-md border px-2 py-1"
			>
				<option value="all">All types</option>
				<option value="centre">Centre</option>
				<option value="family">Family</option>
				<option value="educator">Educator</option>
			</select>
			<select
				aria-label="Filter by status"
				defaultValue={sp.get("status") ?? "all"}
				onChange={(e) => update("status", e.target.value === "all" ? "" : e.target.value)}
				className="rounded-md border px-2 py-1"
			>
				<option value="all">All statuses</option>
				<option value="new">New</option>
				<option value="contacted">Contacted</option>
				<option value="qualified">Qualified</option>
				<option value="archived">Archived</option>
			</select>
			<input
				type="search"
				aria-label="Search submissions by name or email"
				placeholder="Search name or email"
				defaultValue={sp.get("q") ?? ""}
				onBlur={(e) => update("q", e.target.value)}
				className="flex-1 rounded-md border px-2 py-1"
			/>
		</form>
	);
}
