import { LANDING } from "@/lib/cms/content";
import { SectionHeading } from "./SectionHeading";

const AVATAR_TONES = ["bg-blush-200/80 text-blush-700", "bg-teal-300/70 text-teal-900", "bg-lavender-200/80 text-lavender-700"];

export function Testimonials() {
	const { testimonials } = LANDING;
	return (
		<section id="testimonials" className="bg-navy-900 px-4 py-20">
			<SectionHeading
				dark
				eyebrow={testimonials.eyebrow}
				title={testimonials.title}
			/>
			<div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
				{testimonials.quotes.map((t, i) => (
					<figure key={t.name} className="rounded-2xl bg-white p-6 shadow-md">
						<p aria-hidden="true" className="font-heading text-4xl font-extrabold leading-none text-blush-300">
							&ldquo;
						</p>
						<blockquote className="mt-2 text-sm text-slate-600">
							&ldquo;{t.quote}&rdquo;
						</blockquote>
						<figcaption className="mt-5 flex items-center gap-3">
							<span
								aria-hidden="true"
								className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[i]}`}
							>
								{t.initials}
							</span>
							<span>
								<span className="block text-sm font-bold text-navy-900">{t.name}</span>
								<span className="block text-xs text-slate-500">{t.role}</span>
							</span>
						</figcaption>
					</figure>
				))}
			</div>
		</section>
	);
}
