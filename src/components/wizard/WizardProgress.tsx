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
				// Decorative fills only (var(--bb-ink-soft)/var(--bb-ink-strong)/rgba(var(--bb-shadow-rgb),.18)) —
				// step label text below always uses a readable ink/deep/muted token.
				const fill =
					state === "done"
						? "var(--bb-ink-strong)"
						: state === "current"
							? "var(--bb-ink-strong)"
							: "rgba(var(--bb-shadow-rgb),.18)";
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
								color: state === "todo" ? "var(--bb-ink-strong)" : "#fff",
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
								color: state === "todo" ? "var(--bb-ink-muted)" : "var(--bb-ink-strong)",
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
