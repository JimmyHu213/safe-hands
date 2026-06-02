import Link from "next/link";
import { SITE } from "@/lib/cms/content";
import { AcknowledgementOfCountry } from "./AcknowledgementOfCountry";

export function Footer() {
	return (
		<footer className="mt-16 border-t bg-white">
			<AcknowledgementOfCountry />
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
				<div>
					<h3 className="font-semibold">{SITE.shortName}</h3>
					<p className="mt-2 text-sm text-slate-600">{SITE.tagline}</p>
					<p className="mt-3 text-xs text-slate-500">ABN {SITE.abn}</p>
				</div>
				<div>
					<h4 className="text-sm font-semibold">Services</h4>
					<ul className="mt-2 space-y-1 text-sm">
						<li>
							<Link href="/for-centres" className="hover:underline">
								For centres
							</Link>
						</li>
						<li>
							<Link href="/for-families" className="hover:underline">
								For families
							</Link>
						</li>
						<li>
							<Link href="/for-educators" className="hover:underline">
								For educators
							</Link>
						</li>
						<li>
							<Link href="/compliance" className="hover:underline">
								Compliance
							</Link>
						</li>
					</ul>
				</div>
				<div>
					<h4 className="text-sm font-semibold">Company</h4>
					<ul className="mt-2 space-y-1 text-sm">
						<li>
							<Link href="/about" className="hover:underline">
								About
							</Link>
						</li>
						<li>
							<Link href="/contact" className="hover:underline">
								Contact
							</Link>
						</li>
						<li>
							<Link href="/faq" className="hover:underline">
								FAQ
							</Link>
						</li>
					</ul>
				</div>
				<div>
					<h4 className="text-sm font-semibold">Legal</h4>
					<ul className="mt-2 space-y-1 text-sm">
						<li>
							<Link href="/legal/privacy" className="hover:underline">
								Privacy policy
							</Link>
						</li>
						<li>
							<Link href="/legal/terms" className="hover:underline">
								Terms of use
							</Link>
						</li>
					</ul>
				</div>
			</div>
			<div className="border-t bg-slate-50 px-4 py-4 text-center text-xs text-slate-500">
				© {new Date().getFullYear()} {SITE.name}. All rights reserved.
			</div>
		</footer>
	);
}
