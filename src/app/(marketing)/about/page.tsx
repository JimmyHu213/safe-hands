import { ABOUT } from "@/lib/cms/content";

export default function AboutPage() {
	return (
		<>
			<section className="border-b bg-slate-50 px-4 py-16">
				<div className="mx-auto max-w-3xl">
					<p className="text-sm font-semibold uppercase tracking-wide text-slate-500">About</p>
					<h1 className="mt-3 text-4xl font-semibold tracking-tight">{ABOUT.h1}</h1>
				</div>
			</section>
			<section className="px-4 py-12">
				<div className="mx-auto max-w-3xl space-y-4 text-base text-slate-800">
					{ABOUT.paragraphs.map((p, i) => (
						<p key={i}>{p}</p>
					))}
				</div>
			</section>
			<section className="bg-slate-50 px-4 py-12">
				<div className="mx-auto max-w-3xl">
					<h2 className="text-xl font-semibold">Our values</h2>
					<ul className="mt-4 flex flex-wrap gap-2">
						{ABOUT.values.map((v) => (
							<li
								key={v}
								className="rounded-full border bg-white px-3 py-1 text-sm text-slate-700"
							>
								{v}
							</li>
						))}
					</ul>
				</div>
			</section>
		</>
	);
}
