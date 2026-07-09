import Link from "next/link";
import { Briefcase, Building2, Check, House } from "lucide-react";
import { LANDING } from "@/lib/cms/content";
import { SectionHeading } from "./SectionHeading";

const AUDIENCE_STYLE = {
	educator: {
		Icon: Briefcase,
		tile: "bg-lavender-200/70 text-lavender-700",
		bar: "bg-teal-400",
		cta: "border border-navy-200 text-navy-800 hover:bg-navy-50",
	},
	family: {
		Icon: House,
		tile: "bg-blush-200/80 text-blush-600",
		bar: "bg-blush-300",
		cta: "bg-blush-300 text-navy-950 hover:bg-blush-400",
	},
	centre: {
		Icon: Building2,
		tile: "bg-teal-200/70 text-teal-800",
		bar: "bg-navy-800",
		cta: "bg-navy-800 text-white hover:bg-navy-700",
	},
} as const;

export function AudienceCards() {
	const { audience } = LANDING;
	return (
		<section id="audience" className="bg-white px-4 pt-16 pb-20">
			<SectionHeading eyebrow={audience.eyebrow} title={audience.title} lede={audience.lede} />
			<div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
				{audience.cards.map((card) => {
					const { Icon, tile, bar, cta } = AUDIENCE_STYLE[card.key];
					return (
						<div
							key={card.key}
							className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-100 ${
								card.featured ? "shadow-md ring-blush-200" : ""
							}`}
						>
							<div aria-hidden="true" className={`h-1.5 ${bar}`} />
							<div className="flex flex-1 flex-col p-6">
								<span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tile}`}>
									<Icon className="h-5 w-5" aria-hidden="true" />
								</span>
								<h3 className="mt-4 font-heading text-xl font-bold text-navy-900">{card.title}</h3>
								<p className="mt-1 text-sm text-slate-500">{card.sub}</p>
								<ul className="mt-4 flex-1 space-y-2">
									{card.bullets.map((b) => (
										<li key={b} className="flex items-start gap-2 text-sm text-slate-600">
											<Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
											{b}
										</li>
									))}
								</ul>
								<Link
									href={card.ctaHref}
									className={`mt-6 rounded-pill px-5 py-2.5 text-center text-sm font-bold transition-colors ${cta}`}
								>
									{card.ctaLabel}
								</Link>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
