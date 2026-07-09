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
				return (
					<li key={s.num} className="flex flex-1 items-center gap-2">
						<span
							className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
								state === "done"
									? "border-slate-900 bg-slate-900 text-white"
									: state === "current"
										? "border-slate-900 bg-white text-slate-900"
										: "border-slate-300 text-slate-400"
							}`}
							aria-current={state === "current" ? "step" : undefined}
						>
							{s.num}
						</span>
						<span className="text-xs uppercase tracking-wide text-slate-700">{s.label}</span>
					</li>
				);
			})}
		</ol>
	);
}
