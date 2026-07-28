import Link from "next/link";

export function AdminNav({ email }: { email: string }) {
	return (
		<header className="border-b bg-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link href="/admin" className="text-sm font-semibold">Bee Bright · Admin</Link>
				<nav className="flex items-center gap-4 text-sm">
					<Link href="/admin/submissions" className="hover:underline">Submissions</Link>
					<Link href="/admin/faq" className="hover:underline">FAQ</Link>
					<Link href="/admin/media" className="hover:underline">Media</Link>
					<span className="text-ink-500">{email}</span>
					<Link href="/admin/logout" className="text-ink-500 hover:underline">Sign out</Link>
				</nav>
			</div>
		</header>
	);
}
