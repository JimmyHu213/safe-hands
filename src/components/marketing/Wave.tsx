// Wavy section divider from the reference design. Sits at the bottom of a
// section; `className` sets the fill to the NEXT section's background.
export function Wave({ className }: { className: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 1440 64"
			preserveAspectRatio="none"
			className={`absolute inset-x-0 bottom-0 h-10 w-full md:h-16 ${className}`}
		>
			<path d="M0 64h1440V22c-120 22-300 34-480 26S600 12 420 10 120 26 0 44v20Z" />
		</svg>
	);
}
