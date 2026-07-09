import Image from "next/image";
import Link from "next/link";
import { LANDING, SITE } from "@/lib/cms/content";
import { AcknowledgementOfCountry } from "./AcknowledgementOfCountry";

// lucide-react no longer ships brand icons; inline paths (Feather-style).
const SOCIALS = [
	{
		label: "Facebook",
		path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
	},
	{
		label: "Instagram",
		path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01",
	},
	{
		label: "LinkedIn",
		path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v1.3A6 6 0 0 1 16 8zM6 9H2v12h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
	},
	{ label: "X", path: "M4 4l16 16M20 4L4 20" },
];

export function Footer() {
	return (
		<footer className="mt-16 bg-navy-900 text-white">
			<AcknowledgementOfCountry />
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
				<div>
					<div className="flex items-center gap-2.5">
						<Image src="/brand/safehands-icon-192.png" alt="" width={36} height={36} />
						<span className="flex flex-col leading-tight">
							<span className="font-heading text-lg font-extrabold text-white">
								{SITE.shortName}
							</span>
							<span className="text-[0.55rem] font-semibold uppercase tracking-brand text-teal-300">
								Staffing Agency
							</span>
						</span>
					</div>
					<p className="mt-3 text-sm text-navy-200">{LANDING.footer.mission}</p>
					<div className="mt-4 flex gap-2">
						{SOCIALS.map(({ label, path }) => (
							<a
								key={label}
								href="#"
								aria-label={label}
								className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-navy-200 transition-colors hover:bg-navy-700 hover:text-white"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4"
									aria-hidden="true"
								>
									<path d={path} />
								</svg>
							</a>
						))}
					</div>
				</div>
				<div>
					<h4 className="text-sm font-bold uppercase tracking-brand text-teal-300">Platform</h4>
					<ul className="mt-3 space-y-2 text-sm text-navy-100">
						<li>
							<Link href="/#how" className="transition-colors hover:text-teal-300">
								How it works
							</Link>
						</li>
						<li>
							<Link href="/#why" className="transition-colors hover:text-teal-300">
								Why Safe Hands
							</Link>
						</li>
						<li>
							<Link href="/#trust" className="transition-colors hover:text-teal-300">
								Trust &amp; safety
							</Link>
						</li>
						<li>
							<Link href="/faq" className="transition-colors hover:text-teal-300">
								FAQ
							</Link>
						</li>
					</ul>
				</div>
				<div>
					<h4 className="text-sm font-bold uppercase tracking-brand text-teal-300">For you</h4>
					<ul className="mt-3 space-y-2 text-sm text-navy-100">
						<li>
							<Link href="/for-families" className="transition-colors hover:text-teal-300">
								Families
							</Link>
						</li>
						<li>
							<Link href="/for-centres" className="transition-colors hover:text-teal-300">
								Childcare centres
							</Link>
						</li>
						<li>
							<Link href="/for-educators" className="transition-colors hover:text-teal-300">
								Educators
							</Link>
						</li>
						<li>
							<Link href="/about" className="transition-colors hover:text-teal-300">
								About
							</Link>
						</li>
					</ul>
				</div>
				<div>
					<h4 className="text-sm font-bold uppercase tracking-brand text-teal-300">Contact</h4>
					<ul className="mt-3 space-y-2 text-sm text-navy-100">
						<li>
							<a
								href={`mailto:${SITE.emailGeneral}`}
								className="transition-colors hover:text-teal-300"
							>
								{SITE.emailGeneral}
							</a>
						</li>
						<li>
							<a href={`tel:${SITE.phoneTel}`} className="transition-colors hover:text-teal-300">
								{SITE.phone}
							</a>
						</li>
						<li className="text-navy-200">{SITE.hours}</li>
					</ul>
				</div>
			</div>
			<div className="border-t border-navy-800 px-4 py-4">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-navy-300 md:flex-row">
					<p>
						© {new Date().getFullYear()} {SITE.name}. All rights reserved. · ABN {SITE.abn}
					</p>
					<div className="flex gap-4">
						<Link href="/legal/privacy" className="transition-colors hover:text-teal-300">
							Privacy
						</Link>
						<Link href="/legal/terms" className="transition-colors hover:text-teal-300">
							Terms
						</Link>
						<Link href="/compliance" className="transition-colors hover:text-teal-300">
							Safeguarding
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
