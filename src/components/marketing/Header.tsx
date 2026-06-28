import Link from "next/link";
import { SITE } from "@/lib/cms/content";

export interface HeaderProps {
	appLoginUrl?: string;
}

export function Header({ appLoginUrl }: HeaderProps) {
	return (
		<header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
				<Link href="/" className="flex items-center gap-2 font-semibold">
					<span className="text-lg tracking-tight">{SITE.shortName}</span>
				</Link>
				<nav
					className="hidden md:flex items-center gap-6 text-sm"
					aria-label="Primary"
				>
					<Link href="/for-centres" className="hover:underline">
						For centres
					</Link>
					<Link href="/for-families" className="hover:underline">
						For families
					</Link>
					<Link href="/for-educators" className="hover:underline">
						For educators
					</Link>
					<Link href="/about" className="hover:underline">
						About
					</Link>
					<Link href="/compliance" className="hover:underline">
						Compliance
					</Link>
					<Link href="/contact" className="hover:underline">
						Contact
					</Link>
				</nav>
				<div className="flex items-center gap-3">
					<a
						href={`tel:${SITE.phoneTel}`}
						className="text-sm font-medium hover:underline"
						aria-label={`Call ${SITE.phone}`}
					>
						{SITE.phone}
					</a>
					{appLoginUrl ? (
						<a
							href={appLoginUrl}
							className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
						>
							Access the app
						</a>
					) : null}
				</div>
			</div>
		</header>
	);
}
