import {
	BadgeCheck,
	CalendarClock,
	Heart,
	Receipt,
	RefreshCw,
	ShieldCheck,
} from "lucide-react";
import { LANDING } from "@/lib/cms/content";
import { SectionHeading } from "./SectionHeading";
import { Wave } from "./Wave";

const WHY_ICONS = [
	{ Icon: ShieldCheck, tile: "bg-teal-200/70 text-teal-800" },
	{ Icon: BadgeCheck, tile: "bg-lavender-200/70 text-lavender-700" },
	{ Icon: Heart, tile: "bg-blush-200/80 text-blush-600" },
	{ Icon: CalendarClock, tile: "bg-blush-200/80 text-blush-600" },
	{ Icon: RefreshCw, tile: "bg-teal-200/70 text-teal-800" },
	{ Icon: Receipt, tile: "bg-lavender-200/70 text-lavender-700" },
];

export function WhyCards() {
	const { why } = LANDING;
	return (
		<section id="why" className="relative bg-blush-50 px-4 pt-20 pb-28">
			<SectionHeading eyebrow={why.eyebrow} title={why.title} lede={why.lede} />
			<div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{why.cards.map((card, i) => {
					const { Icon, tile } = WHY_ICONS[i];
					return (
						<div
							key={card.title}
							className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-100"
						>
							<span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tile}`}>
								<Icon className="h-5 w-5" aria-hidden="true" />
							</span>
							<h3 className="mt-4 font-heading text-lg font-bold text-navy-900">{card.title}</h3>
							<p className="mt-2 text-sm text-slate-600">{card.body}</p>
						</div>
					);
				})}
			</div>
			<Wave className="fill-white" />
		</section>
	);
}
