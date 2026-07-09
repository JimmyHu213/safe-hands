import { LANDING } from "@/lib/cms/content";

const TONE = {
	blush: "text-blush-500",
	teal: "text-teal-600",
	navy: "text-navy-800",
};

export function StatsBand() {
	return (
		<section aria-label="Safe Hands by the numbers" className="bg-white px-4 py-12">
			<ul className="mx-auto grid max-w-5xl grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x md:divide-navy-100">
				{LANDING.stats.map((s) => (
					<li key={s.label} className="px-4 text-center">
						<p className={`font-heading text-3xl font-extrabold md:text-4xl ${TONE[s.tone]}`}>
							{s.value}
						</p>
						<p className="mt-1 text-sm text-slate-500">{s.label}</p>
					</li>
				))}
			</ul>
		</section>
	);
}
