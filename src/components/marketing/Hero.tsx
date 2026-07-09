"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Star } from "lucide-react";
import { HOME, LANDING } from "@/lib/cms/content";
import { Wave } from "./Wave";

const TILE_TONES = ["bg-lavender-200/70", "bg-blush-200/80", "bg-teal-300/70"];

export function Hero() {
	const { hero } = LANDING;
	const [active, setActive] = useState(0);
	const chip = hero.chips[active];

	return (
		<section id="top" className="relative overflow-hidden bg-teal-100 px-4 pt-14 pb-24 md:pt-20">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blush-200/50 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-lavender-200/50 blur-3xl"
			/>
			<div className="relative mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-2">
				<div>
					<p className="inline-block rounded-pill bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-brand text-teal-700 ring-1 ring-teal-300/60">
						{hero.eyebrow}
					</p>
					<h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-navy-900 md:text-6xl [text-wrap:balance]">
						{hero.h1}
					</h1>
					<p className="mt-5 max-w-xl text-lg text-slate-600">{hero.lede}</p>
					<div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="I am a">
						{hero.chips.map((c, i) => (
							<button
								key={c.key}
								type="button"
								aria-pressed={i === active}
								onClick={() => setActive(i)}
								className={`rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
									i === active
										? "bg-blush-300 text-navy-950 shadow-sm"
										: "bg-white/80 text-navy-800 ring-1 ring-navy-200 hover:bg-white"
								}`}
							>
								{c.label}
							</button>
						))}
					</div>
					<div className="mt-4 max-w-md rounded-2xl bg-white p-5 shadow-md ring-1 ring-navy-100">
						<p className="text-sm text-slate-600">{chip.hint}</p>
						<Link
							href={chip.ctaHref}
							className="mt-4 inline-flex items-center gap-2 rounded-pill bg-blush-300 px-5 py-2.5 text-sm font-bold text-navy-950 transition-colors hover:bg-blush-400"
						>
							{chip.ctaLabel}
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</div>
				</div>
				<div className="relative">
					<div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg ring-1 ring-navy-100">
						<Image
							src={HOME.heroImage.src}
							alt={HOME.heroImage.alt}
							fill
							priority
							sizes="(max-width: 768px) 100vw, 560px"
							className="object-cover"
						/>
					</div>
					<Link
						href="/about"
						aria-label="Watch our story"
						className="absolute -left-5 top-1/2 hidden -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full bg-white p-5 text-center shadow-lg ring-1 ring-navy-100 transition hover:shadow-xl md:flex"
					>
						<span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-300 text-navy-950">
							<Play className="h-4 w-4 fill-current" aria-hidden="true" />
						</span>
						<span className="text-xs font-semibold text-navy-800">Watch Story</span>
					</Link>
					<div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-md ring-1 ring-navy-100 md:absolute md:-bottom-8 md:right-6 md:mt-0">
						<div className="flex -space-x-2" aria-hidden="true">
							{hero.rating.initials.map((ini, i) => (
								<span
									key={ini}
									className={`flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-white ${TILE_TONES[i]} text-xs font-bold text-navy-900`}
								>
									{ini}
								</span>
							))}
						</div>
						<div>
							<p className="flex items-center gap-1 font-heading text-lg font-extrabold text-navy-900">
								<Star className="h-4 w-4 fill-blush-400 text-blush-400" aria-hidden="true" />
								{hero.rating.score}
							</p>
							<p className="text-xs text-slate-500">{hero.rating.note}</p>
						</div>
					</div>
				</div>
			</div>
			<Wave className="fill-white" />
		</section>
	);
}
