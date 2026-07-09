import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/cms/content";

export interface HeaderProps {
	appLoginUrl?: string;
}

export function Header({ appLoginUrl }: HeaderProps) {
	return (
		<header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
				<Link
					href="/"
					className="flex items-center gap-2.5"
					aria-label={`${SITE.name} home`}
				>
					<Image
						src="/brand/safehands-icon-192.png"
						alt=""
						width={40}
						height={40}
						priority
					/>
					<span className="flex flex-col leading-tight">
						<span className="font-heading text-xl font-extrabold tracking-tight text-navy-800">
							{SITE.shortName}
						</span>
						<span className="text-[0.6rem] font-semibold uppercase tracking-brand text-teal-600">
							Staffing Agency
						</span>
					</span>
				</Link>
				<nav
					className="hidden md:flex items-center gap-6 text-sm font-medium text-navy-800"
					aria-label="Primary"
				>
					<Link href="/#how" className="transition-colors hover:text-teal-600">
						How it works
					</Link>
					<Link href="/for-families" className="transition-colors hover:text-teal-600">
						For Families
					</Link>
					<Link href="/for-centres" className="transition-colors hover:text-teal-600">
						For Childcare Centres
					</Link>
					<Link href="/for-educators" className="transition-colors hover:text-teal-600">
						For Educators
					</Link>
					<Link href="/about" className="transition-colors hover:text-teal-600">
						About
					</Link>
				</nav>
				<div className="flex items-center gap-4">
					{appLoginUrl ? (
						<a
							href={appLoginUrl}
							className="hidden text-sm font-medium text-navy-800 hover:text-teal-600 sm:block"
						>
							Access the app
						</a>
					) : null}
					<Link
						href="/for-families/request"
						className="rounded-pill bg-blush-300 px-4 py-2 text-sm font-bold text-navy-950 shadow-sm transition-colors hover:bg-blush-400"
					>
						Request an Educator
					</Link>
				</div>
			</div>
		</header>
	);
}
