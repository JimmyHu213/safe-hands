import { ClipboardList, LifeBuoy, MessageCircle, UserCheck } from "lucide-react";
import { LANDING } from "@/lib/cms/content";
import { SectionHeading } from "./SectionHeading";
import { Wave } from "./Wave";

const STEP_ICONS = [ClipboardList, UserCheck, MessageCircle, LifeBuoy];

export function HowItWorks() {
	const { how } = LANDING;
	return (
		<section id="how" className="relative bg-teal-100 px-4 pt-20 pb-28">
			<SectionHeading eyebrow={how.eyebrow} title={how.title} lede={how.lede} />
			<div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{how.steps.map((step, i) => {
					const Icon = STEP_ICONS[i];
					return (
						<div
							key={step.title}
							className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-100"
						>
							<p
								aria-hidden="true"
								className="absolute right-4 top-2 font-heading text-5xl font-extrabold text-teal-200/80"
							>
								{String(i + 1).padStart(2, "0")}
							</p>
							<span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-200/70 text-teal-800">
								<Icon className="h-5 w-5" aria-hidden="true" />
							</span>
							<h3 className="mt-4 font-heading text-lg font-bold text-navy-900">{step.title}</h3>
							<p className="mt-2 text-sm text-slate-600">{step.body}</p>
						</div>
					);
				})}
			</div>
			<Wave className="fill-blush-50" />
		</section>
	);
}
