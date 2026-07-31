import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { listMedia } from "@/lib/db/queries/media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { MediaUploader } from "@/components/admin/MediaUploader";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
	const env = bindings();
	const items = await listMedia(db(env.DB));
	const publicBaseUrl = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/beebrightstaffing-public-media`;
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Media</h1>
			<MediaUploader />
			<MediaLibrary items={items} publicBaseUrl={publicBaseUrl} />
		</div>
	);
}
