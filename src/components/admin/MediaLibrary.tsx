import { updateAltAction, deleteMediaAction } from "@/app/admin/media/actions";
import type { MediaItem } from "@/lib/db/schema";

export function MediaLibrary({ items, publicBaseUrl }: { items: MediaItem[]; publicBaseUrl: string }) {
	return (
		<ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{items.map((m) => {
				const url = `${publicBaseUrl}/${m.r2Key}`;
				return (
					<li key={m.id} className="rounded-md border bg-white p-3">
						{m.mimeType.startsWith("image/") ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={url} alt={m.altText ?? ""} className="aspect-video w-full rounded object-cover" />
						) : null}
						<p className="mt-2 text-xs text-ink-500">{m.originalFilename}</p>
						<p className="mt-1 break-all text-xs"><code>{url}</code></p>
						<form action={updateAltAction} className="mt-2 flex gap-2 text-xs">
							<input type="hidden" name="id" value={m.id} />
							<input
								name="alt"
								defaultValue={m.altText ?? ""}
								placeholder="alt text"
								className="flex-1 rounded-md border px-2 py-1"
							/>
							<button type="submit" className="rounded-md border px-2 py-1">Save</button>
						</form>
						<form action={deleteMediaAction} className="mt-2">
							<input type="hidden" name="id" value={m.id} />
							<button type="submit" className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700">Delete</button>
						</form>
					</li>
				);
			})}
			{items.length === 0 ? <li className="text-sm text-ink-500">No media uploaded yet.</li> : null}
		</ul>
	);
}
