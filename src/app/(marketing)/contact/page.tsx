import { SITE } from "@/lib/cms/content";
import { PageHero } from "@/components/marketing/PageHero";

function ContactIconPhone() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"></path>
		</svg>
	);
}

function ContactIconMail() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<rect x="3.5" y="5" width="17" height="14" rx="2.5"></rect>
			<path d="M4.5 6.5l7.5 6 7.5-6"></path>
		</svg>
	);
}

function ContactIconClock() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="8.5"></circle>
			<path d="M12 7.5V12l3.2 2"></path>
		</svg>
	);
}

const CONTACT_CARDS = [
	{
		Icon: ContactIconPhone,
		title: "Phone",
		body: "For centres and families needing a shift filled — we answer the phone.",
		content: (
			<a href={`tel:${SITE.phoneTel}`} style={{ color: "var(--bb-ink-strong)", fontWeight: 700 }}>
				{SITE.phone}
			</a>
		),
	},
	{
		Icon: ContactIconMail,
		title: "Email",
		body: "Bookings, recruitment, or general questions — write to the right inbox.",
		content: (
			<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
				<a href={`mailto:${SITE.emailBookings}`} style={{ color: "var(--bb-ink-strong)", fontWeight: 700 }}>
					{SITE.emailBookings}
				</a>
				<a href={`mailto:${SITE.emailRecruitment}`} style={{ color: "var(--bb-ink-strong)", fontWeight: 700 }}>
					{SITE.emailRecruitment}
				</a>
			</div>
		),
	},
	{
		Icon: ContactIconClock,
		title: "Hours",
		body: `Service area: ${SITE.serviceArea}.`,
		content: <p style={{ margin: 0, color: "var(--bb-ink)", fontWeight: 600 }}>{SITE.hours}</p>,
	},
];

export default function ContactPage() {
	return (
		<>
			<PageHero
				eyebrow="Contact"
				title="Get in touch."
				lede="We answer the phone. For bookings, recruitment, or general questions — use the channel below that suits you."
			/>
			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 1080, margin: "0 auto" }}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
						gap: 22,
					}}
				>
					{CONTACT_CARDS.map(({ Icon, title, body, content }) => (
						<div
							key={title}
							className="bb-why-card"
							style={{
								background: "#fff",
								border: "1px solid rgba(var(--bb-shadow-rgb),.07)",
								borderRadius: 22,
								padding: "30px 28px",
								boxShadow: "0 2px 14px rgba(var(--bb-shadow-rgb),.05)",
								transition: "transform .25s ease,box-shadow .25s ease",
							}}
						>
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									width: 56,
									height: 56,
									borderRadius: 16,
									background: "var(--bb-surface-tint)",
									color: "var(--bb-ink-soft)",
								}}
							>
								<Icon />
							</span>
							<h2
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: "1.24rem",
									color: "var(--bb-ink-strong)",
									margin: "18px 0 8px",
								}}
							>
								{title}
							</h2>
							<p style={{ color: "var(--bb-ink-muted)", lineHeight: 1.55, margin: "0 0 16px" }}>{body}</p>
							{content}
						</div>
					))}
				</div>
			</section>
		</>
	);
}
