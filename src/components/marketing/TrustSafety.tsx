import { BadgeCheck, Fingerprint, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { LANDING } from "@/lib/cms/content";
import { SectionHeading } from "./SectionHeading";

const TRUST_ICONS = [Fingerprint, ShieldCheck, Users, BadgeCheck, RefreshCw];

export function TrustSafety() {
	const { trust } = LANDING;
	return (
		<section id="trust" className="bg-blush-50 px-4 py-20">
			<SectionHeading eyebrow={trust.eyebrow} title={trust.title} lede={trust.lede} />
			<div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
				{trust.cards.map((card, i) => {
					const Icon = TRUST_ICONS[i];
					return (
						<div
							key={card.title}
							className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100"
						>
							<span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-200/70 text-teal-800">
								<Icon className="h-5 w-5" aria-hidden="true" />
							</span>
							<h3 className="mt-3 font-heading text-sm font-bold text-navy-900">{card.title}</h3>
							<p className="mt-2 text-xs text-slate-600">{card.body}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
