import { SITE } from "@/lib/cms/content";

export default function ContactPage() {
	return (
		<>
			<section className="border-b bg-slate-50 px-4 py-16">
				<div className="mx-auto max-w-3xl">
					<p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</p>
					<h1 className="mt-3 text-4xl font-semibold tracking-tight">Get in touch.</h1>
					<p className="mt-4 text-lg text-slate-700">
						We answer the phone. For bookings, recruitment, or general questions — use the channel
						below that suits you.
					</p>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
					<div className="rounded-lg border p-6">
						<h2 className="font-semibold">Bookings</h2>
						<p className="mt-2 text-sm text-slate-600">
							For centres and families needing a shift filled.
						</p>
						<p className="mt-4 text-sm">
							Phone:{" "}
							<a href={`tel:${SITE.phoneTel}`} className="underline">
								{SITE.phone}
							</a>
						</p>
						<p className="text-sm">
							Email:{" "}
							<a href={`mailto:${SITE.emailBookings}`} className="underline">
								{SITE.emailBookings}
							</a>
						</p>
					</div>
					<div className="rounded-lg border p-6">
						<h2 className="font-semibold">Recruitment</h2>
						<p className="mt-2 text-sm text-slate-600">
							For educators interested in joining our bench.
						</p>
						<p className="mt-4 text-sm">
							Email:{" "}
							<a href={`mailto:${SITE.emailRecruitment}`} className="underline">
								{SITE.emailRecruitment}
							</a>
						</p>
						<p className="text-sm">
							Or start your application:{" "}
							<a href="/for-educators/apply" className="underline">
								/for-educators/apply
							</a>
						</p>
					</div>
					<div className="rounded-lg border p-6 md:col-span-2">
						<h2 className="font-semibold">Hours</h2>
						<p className="mt-2 text-sm text-slate-700">{SITE.hours}</p>
						<p className="mt-2 text-sm text-slate-700">Service area: {SITE.serviceArea}</p>
					</div>
				</div>
			</section>
		</>
	);
}
