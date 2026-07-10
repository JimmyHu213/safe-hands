const STEPS = [
	{ num: 1, label: "Identity" },
	{ num: 2, label: "Qualifications" },
	{ num: 3, label: "Documents" },
	{ num: 4, label: "Review" },
];

export function WizardProgress({ current }: { current: 1 | 2 | 3 | 4 }) {
	return (
		<ol className="flex items-center justify-between gap-2" aria-label="Application progress">
			{STEPS.map((s) => {
				const state = s.num < current ? "done" : s.num === current ? "current" : "todo";
				// Decorative fills only (var(--sh-teal)/var(--sh-deep)/rgba(36,91,86,.18)) —
				// step label text below always uses a readable ink/deep/muted token.
				const fill =
					state === "done"
						? "var(--sh-deep,#1A3B5E)"
						: state === "current"
							? "var(--sh-deep,#1A3B5E)"
							: "rgba(36,91,86,.18)";
				return (
					<li key={s.num} className="flex flex-1 items-center gap-2">
						<span
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 28,
								height: 28,
								flexShrink: 0,
								borderRadius: 999,
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 800,
								fontSize: ".78rem",
								background: fill,
								color: state === "todo" ? "var(--sh-deep,#1A3B5E)" : "#fff",
							}}
							aria-current={state === "current" ? "step" : undefined}
						>
							{s.num}
						</span>
						<span
							className="text-xs uppercase tracking-wide"
							style={{
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 700,
								color: state === "todo" ? "var(--sh-muted,#456C6D)" : "var(--sh-deep,#1A3B5E)",
							}}
						>
							{s.label}
						</span>
					</li>
				);
			})}
		</ol>
	);
}
