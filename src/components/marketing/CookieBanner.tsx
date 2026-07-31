"use client";

import { useEffect, useState } from "react";

const KEY = "bb_cookie_consent";

export function CookieBanner() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setVisible(localStorage.getItem(KEY) !== "1");
	}, []);

	if (!visible) return null;

	return (
		<div
			role="dialog"
			aria-label="Cookie consent"
			className="fixed inset-x-0 bottom-0 z-50 border-t bg-white p-4 shadow-lg"
		>
			<div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 md:flex-row md:items-center">
				<p className="text-sm text-ink-700">
					We use minimal cookies to keep the site running and to remember your
					consent choice. See our{" "}
					<a href="/legal/privacy" className="underline">
						Privacy Policy
					</a>{" "}
					for details.
				</p>
				<button
					type="button"
					className="rounded-md bg-ink-950 px-4 py-2 text-sm font-medium text-white"
					onClick={() => {
						localStorage.setItem(KEY, "1");
						setVisible(false);
					}}
				>
					Accept
				</button>
			</div>
		</div>
	);
}
