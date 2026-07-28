import { createFaqAction, togglePublishedAction, deleteFaqAction } from "@/app/admin/faq/actions";
import type { FaqEntry } from "@/lib/db/schema";

export function FaqEditor({ entries }: { entries: FaqEntry[] }) {
	// Bind the create-action's two-arg signature for use as a form action.
	async function createAction(formData: FormData) {
		"use server";
		await createFaqAction({ ok: true }, formData);
	}

	return (
		<div className="space-y-8">
			<section className="rounded-md border bg-white p-4">
				<h2 className="text-lg font-semibold">Add an entry</h2>
				<form action={createAction} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm">
						<span className="font-medium">Audience</span>
						<select name="audience" required className="rounded-md border px-2 py-1">
							<option value="general">General</option>
							<option value="centre">Centre</option>
							<option value="family">Family</option>
							<option value="educator">Educator</option>
						</select>
					</label>
					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className="font-medium">Question</span>
						<input name="question" required maxLength={500} className="rounded-md border px-3 py-2" />
					</label>
					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className="font-medium">Answer (markdown)</span>
						<textarea name="answer" required rows={4} maxLength={10000} className="rounded-md border px-3 py-2" />
					</label>
					<div className="md:col-span-2">
						<button type="submit" className="rounded-md bg-ink-950 px-3 py-1.5 text-sm text-white">
							Add
						</button>
					</div>
				</form>
			</section>

			<section>
				<h2 className="text-lg font-semibold">Entries</h2>
				<ul className="mt-3 space-y-3">
					{entries.map((e) => (
						<li key={e.id} className="rounded-md border bg-white p-4">
							<p className="text-xs uppercase tracking-wide text-ink-500">{e.audience}</p>
							<p className="mt-1 font-medium">{e.question}</p>
							<p className="mt-1 whitespace-pre-line text-sm text-ink-700">{e.answer}</p>
							<div className="mt-3 flex items-center gap-3 text-sm">
								<form action={togglePublishedAction}>
									<input type="hidden" name="id" value={e.id} />
									<input type="hidden" name="published" value={String(!e.published)} />
									<button type="submit" className="rounded-md border px-2 py-1">
										{e.published ? "Unpublish" : "Publish"}
									</button>
								</form>
								<form action={deleteFaqAction}>
									<input type="hidden" name="id" value={e.id} />
									<button type="submit" className="rounded-md border border-red-300 px-2 py-1 text-red-700">
										Delete
									</button>
								</form>
								<span className="text-ink-500">sort: {e.sortOrder}</span>
							</div>
						</li>
					))}
					{entries.length === 0 ? <li className="text-sm text-ink-500">No FAQ entries yet.</li> : null}
				</ul>
			</section>
		</div>
	);
}
