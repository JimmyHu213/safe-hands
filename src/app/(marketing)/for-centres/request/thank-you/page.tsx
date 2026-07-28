import { SITE } from "@/lib/cms/content";

export default function CentreThankYouPage() {
	return (
		<section className="px-4 py-16">
			<div className="mx-auto max-w-2xl text-center">
				<h1 className="text-3xl font-semibold tracking-tight">Thanks — request received.</h1>
				<p className="mt-4 text-ink-700">
					A {SITE.shortName} operator will be in touch within 4 business hours to confirm coverage.
				</p>
				<p className="mt-2 text-ink-700">
					For urgent shifts, please call us on{" "}
					<a href={`tel:${SITE.phoneTel}`} className="underline">{SITE.phone}</a>.
				</p>
			</div>
		</section>
	);
}
