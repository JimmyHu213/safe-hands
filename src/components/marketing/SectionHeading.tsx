export function SectionHeading({
	eyebrow,
	title,
	lede,
	dark = false,
}: {
	eyebrow?: string;
	title: string;
	lede?: string;
	dark?: boolean;
}) {
	return (
		<div className="mx-auto max-w-3xl text-center">
			{eyebrow ? (
				<p
					className={`text-xs font-bold uppercase tracking-brand ${dark ? "text-teal-300" : "text-teal-600"}`}
				>
					{eyebrow}
				</p>
			) : null}
			<h2
				className={`mt-3 font-heading text-3xl font-extrabold tracking-tight md:text-5xl ${dark ? "text-white" : "text-navy-900"}`}
			>
				{title}
			</h2>
			{lede ? (
				<p className={`mt-4 text-base ${dark ? "text-navy-100" : "text-slate-600"}`}>{lede}</p>
			) : null}
		</div>
	);
}
