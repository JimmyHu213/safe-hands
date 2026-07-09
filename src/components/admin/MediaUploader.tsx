"use client";
import { useState } from "react";
import { recordMediaAction } from "@/app/admin/media/actions";

export function MediaUploader() {
	const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

	async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setStatus("uploading");
		try {
			const presignRes = await fetch("/api/uploads/media", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size }),
			});
			if (!presignRes.ok) throw new Error("presign failed");
			const { uploadUrl, r2Key } = (await presignRes.json()) as { uploadUrl: string; r2Key: string };
			const putRes = await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!putRes.ok) throw new Error("put failed");
			const fd = new FormData();
			fd.append("r2Key", r2Key);
			fd.append("originalFilename", file.name);
			fd.append("mimeType", file.type);
			fd.append("sizeBytes", String(file.size));
			await recordMediaAction(fd);
			setStatus("done");
		} catch {
			setStatus("error");
		}
	}

	return (
		<label className="flex flex-col gap-1 text-sm">
			<span className="font-medium">Upload image</span>
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp,image/svg+xml"
				onChange={handleChange}
				className="rounded-md border px-3 py-2"
			/>
			{status === "uploading" ? <span className="text-xs text-slate-500">Uploading…</span> : null}
			{status === "done" ? <span className="text-xs text-green-700">Uploaded ✓</span> : null}
			{status === "error" ? <span className="text-xs text-red-700">Upload failed</span> : null}
		</label>
	);
}
