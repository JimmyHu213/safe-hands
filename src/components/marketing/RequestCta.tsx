import Link from "next/link";
import { LANDING } from "@/lib/cms/content";

export function RequestCta() {
	const { request } = LANDING;
	return (
		<section id="request" className="bg-white px-4 py-16">
			<div className="relative mx-auto flex max-w-5xl flex-col items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-teal-800 px-6 py-14 text-center text-white shadow-lg md:px-12">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-teal-400/20 blur-2xl"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blush-300/20 blur-2xl"
				/>
				<h2 className="relative font-heading text-3xl font-extrabold tracking-tight md:text-5xl [text-wrap:balance]">
					{request.title}
				</h2>
				<p className="relative max-w-2xl text-navy-100">{request.body}</p>
				<div className="relative mt-3 flex flex-col gap-3 md:flex-row">
					<Link
						href={request.primary.href}
						className="rounded-pill bg-blush-300 px-6 py-2.5 text-sm font-bold text-navy-950 transition-colors hover:bg-blush-400"
					>
						{request.primary.label}
					</Link>
					<Link
						href={request.secondary.href}
						className="rounded-pill border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
					>
						{request.secondary.label}
					</Link>
				</div>
				<p className="relative mt-2 text-xs text-navy-200">{request.note}</p>
			</div>
		</section>
	);
}
