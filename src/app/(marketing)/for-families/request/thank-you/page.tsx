import { SITE } from "@/lib/cms/content";

export default function FamilyThankYouPage() {
	return (
		<section className="px-4 py-16">
			<div className="mx-auto max-w-2xl text-center">
				<h1 className="text-3xl font-semibold tracking-tight">Thanks — care request received.</h1>
				<p className="mt-4 text-ink-700">
					A {SITE.shortName} operator will be in touch within 4 business hours.
				</p>
			</div>
		</section>
	);
}
