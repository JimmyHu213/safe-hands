"use client";
import { useState } from "react";

export interface UploadedDoc {
	docType: string;
	r2Key: string;
	originalFilename: string;
	mimeType: string;
	sizeBytes: number;
}

export function FileUploadField(props: {
	docType: string;
	label: string;
	onUploaded: (doc: UploadedDoc) => void;
}) {
	const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
	const [error, setError] = useState<string | null>(null);

	async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setStatus("uploading");
		setError(null);
		try {
			const presignRes = await fetch("/api/uploads/presign", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					docType: props.docType,
					filename: file.name,
					mimeType: file.type,
					sizeBytes: file.size,
				}),
			});
			if (!presignRes.ok) throw new Error("presign_failed");
			const { uploadUrl, r2Key } = (await presignRes.json()) as { uploadUrl: string; r2Key: string };

			const putRes = await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!putRes.ok) throw new Error("put_failed");

			const recordRes = await fetch("/for-educators/apply/record-document", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					docType: props.docType,
					r2Key,
					originalFilename: file.name,
					mimeType: file.type,
					sizeBytes: file.size,
				}),
			});
			if (!recordRes.ok) throw new Error("record_failed");

			props.onUploaded({
				docType: props.docType,
				r2Key,
				originalFilename: file.name,
				mimeType: file.type,
				sizeBytes: file.size,
			});
			setStatus("done");
		} catch {
			setStatus("error");
			setError("Upload failed. Try again.");
		}
	}

	return (
		<label
			className="flex flex-col gap-2 text-sm"
			style={{
				borderRadius: 16,
				border: "1.5px dashed rgba(var(--bb-shadow-rgb),.3)",
				background: "var(--bb-surface-tint)",
				padding: "16px 18px",
			}}
		>
			<span className="bb-label">{props.label}</span>
			<input
				type="file"
				accept="application/pdf,image/jpeg,image/png"
				onChange={handleChange}
				className="bb-field"
				style={{ background: "#fff" }}
			/>
			{status === "uploading" ? <span className="text-xs" style={{ color: "var(--bb-ink-muted)" }}>Uploading…</span> : null}
			{status === "done" ? <span className="text-xs text-green-700">Uploaded ✓</span> : null}
			{error ? <span className="text-xs text-red-700">{error}</span> : null}
		</label>
	);
}
