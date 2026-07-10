export const SITE = {
	name: "Safe Hands Staffing Agency",
	shortName: "Safe Hands",
	tagline: "Reliable, safe, and compassionate childcare workers you can trust.",
	phone: "1300 SAFE HANDS",
	phoneTel: "1300723343",
	emailGeneral: "hello@safehandsstaffing.com.au",
	emailBookings: "bookings@safehandsstaffing.com.au",
	emailRecruitment: "recruitment@safehandsstaffing.com.au",
	abn: "[ABN to be registered]",
	acn: "[ACN to be issued]",
	serviceArea: "Greater Sydney + selected regional NSW",
	hours: "Mon–Fri 6:00am–8:00pm, Sat–Sun 7:00am–6:00pm. After-hours emergency line for live-shift incidents.",
};

export const HOME = {
	heroImage: {
		src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
		alt: "Children's picture books, alphabet blocks and coloured pencils arranged on a desk",
	},
};

export const FOR_CENTRES = {
	h1: "Same-day ratio cover, properly compliant.",
	lede:
		"Centres call us because they can't afford a non-compliant placement. Every educator we send has a current WWCC, HLTAID012, Police Check, and the qualifications the room actually needs.",
	bullets: [
		"Cert III, Diploma, ECT, Room Leader, and OSHC educators",
		"≥95% shift fill rate; ≤4-hour response on emergencies",
		"Master Service Agreement, weekly invoicing, NET-14",
		"Inclusion-support educators for ASD, ADHD, behavioural complexity",
	],
	ctaPhone: "Call our booking line",
	ctaEmail: "Email a centre enquiry",
};

export const FOR_FAMILIES = {
	h1: "Vetted in-home childcare when life happens.",
	lede:
		"Sick days, after-school cover, school holidays, the morning shift you can't move. Safe Hands sends educators we have personally screened, with full compliance documentation.",
	bullets: [
		"Minimum 3-hour shift, $30 admin fee per booking",
		"Same-day support where available",
		"After-school, holiday, ad-hoc, and overnight care",
		"Special-needs experienced educators on request",
	],
};

export const FOR_EDUCATORS = {
	h1: "Flexible shifts. Award-rate pay. Real support.",
	lede:
		"Safe Hands is built and run by someone who's worked in compliance. We pay the Children's Services Award with casual loading and a 30% agency uplift, and we don't book you onto shifts you can't safely cover.",
	bullets: [
		"Choose your suburbs and your hours",
		"Cert III to Director-level positions",
		"Weekly pay, super, transparent rate cards",
		"Compliance reminders so your clearances never lapse",
	],
};

export const ABOUT = {
	h1: "Built by someone who's spent their career on compliance.",
	paragraphs: [
		"Safe Hands was founded in 2026 by a healthcare and compliance professional. Most relief agencies treat compliance as paperwork. We treat it as the product.",
		"Our founder has spent over a decade running compliance frameworks in regulated environments. That discipline is what we bring to childcare staffing — written policies, tracked expiries, documented incident response, and a refusal to place an educator whose clearances are anything less than current.",
	],
	values: ["Safety", "Trust", "Compassion", "Reliability", "Professionalism"],
};

export const COMPLIANCE = {
	h1: "Compliance is the product.",
	lede:
		"Every educator on our bench has cleared a checklist before they take a single shift. Every clearance has a stored expiry date with alerts at 60, 30, 14, and 7 days. A lapsed clearance automatically blocks new bookings.",
	documents: [
		{ name: "Working With Children Check (NSW)", renewal: "Every 5 years" },
		{ name: "National Police Check", renewal: "Annually" },
		{ name: "HLTAID012 First Aid in an Education and Care Setting", renewal: "Every 3 years" },
		{ name: "CPR", renewal: "Annually" },
		{ name: "Anaphylaxis & Asthma management", renewal: "Annually" },
		{ name: "Cert III or Diploma in ECEC", renewal: "Once" },
		{ name: "Public Liability + Professional Indemnity insurance", renewal: "Annually" },
	],
	frameworks: [
		"Education and Care Services National Law (NSW)",
		"National Quality Framework + National Quality Standard",
		"NSW Child Safe Standards (Office of the Children's Guardian)",
		"Fair Work Act 2009 + Children's Services Award 2020",
		"Privacy Act 1988 (Cth)",
		"WHS Act 2011 (NSW)",
	],
};

// Landing-page copy ported 1:1 from the Figma design (reference/Safe Hand
// Website - Figma Import.html), localised: Safe Hands, AU spelling, real
// contact details. Stats and testimonials are the design's placeholder
// content — replace with real figures before launch.
export const LANDING = {
	hero: {
		eyebrow: "Childcare staffing",
		h1: "Trusted childcare staff, ready when you need them",
		lede:
			"Safe Hands matches families and childcare centres with vetted, qualified, and genuinely caring childcare staff — often within 48 hours.",
		chips: [
			{
				key: "family" as const,
				label: "Looking for an Educator",
				hint:
					"Vetted, local educators matched to your family. Meet and message them before you ever confirm a booking.",
				ctaLabel: "Request an Educator",
				ctaHref: "/for-families/request",
			},
			{
				key: "facility" as const,
				label: "Care Facility",
				hint:
					"Qualified relief and permanent staff, pre-screened to your standards and ratio-compliant — often placed within 48 hours.",
				ctaLabel: "Staff my Centre",
				ctaHref: "/for-centres/request",
			},
			{
				key: "educator" as const,
				label: "Educator Professional",
				hint:
					"Flexible hours, fair and transparent pay, and a real team behind you. Build a career caring for children — on your terms.",
				ctaLabel: "Join as an Educator",
				ctaHref: "/for-educators/apply",
			},
		],
	},
	stats: [
		{ value: "2,400+", label: "vetted educators nationwide", tone: "blush" as const },
		{ value: "100%", label: "background-checked & verified", tone: "teal" as const },
		{ value: "48 hr", label: "average placement time", tone: "navy" as const },
		{ value: "8,000+", label: "families & centres served", tone: "blush" as const },
	],
	how: {
		eyebrow: "How it works",
		title: "Childcare cover in four simple steps",
		lede:
			"No endless searching, no guesswork. Tell us what you need and we handle the rest — with a real person behind every match.",
		steps: [
			{
				title: "Tell us your needs",
				body: "Share your schedule, the ages of the children, and any special requirements — in just a few minutes.",
			},
			{
				title: "We match a vetted educator",
				body: "Our team hand-picks qualified educators whose skills and warmth fit your family or centre.",
			},
			{
				title: "Meet & confirm",
				body: "Chat or meet your educator, read their verified profile, then confirm the booking with a single tap.",
			},
			{
				title: "Ongoing support",
				body: "Backup cover, regular check-ins, and a dedicated support team — there for you long after day one.",
			},
		],
	},
	why: {
		eyebrow: "Why Safe Hands",
		title: "Care you can trust, without the worry",
		lede:
			"Every part of Safe Hands is built around one promise: the people we send are people you'd happily welcome into your home or facility.",
		cards: [
			{
				title: "Rigorous vetting",
				body: "Multi-point background checks, identity and right-to-work verification on every single educator — no exceptions.",
			},
			{
				title: "Qualified & trained",
				body: "Paediatric first aid, safeguarding, and early-years training come as standard — and we keep records current.",
			},
			{
				title: "Compassionate care",
				body: "We match for warmth and personality, not just availability — because children thrive with people who truly care.",
			},
			{
				title: "Flexible booking",
				body: "One-off, recurring, or last-minute emergency cover — arrange exactly the care you need, in minutes.",
			},
			{
				title: "Reliable backup cover",
				body: "If an educator falls ill, we arrange a trusted, pre-vetted replacement fast — so you're never left scrambling.",
			},
			{
				title: "Transparent pricing",
				body: "Clear, upfront pricing and honest reviews from real families and centres.",
			},
		],
	},
	audience: {
		eyebrow: "One platform, three sides",
		title: "Built for every side of childcare",
		lede:
			"Whether you're a family, a childcare centre, or an educator, Safe Hands is designed around what you need most.",
		cards: [
			{
				key: "educator" as const,
				title: "For Educators",
				sub: "Rewarding work, on your terms.",
				bullets: [
					"Choose the families, centres & hours that suit you",
					"Fair, transparent pay — every time",
					"Free training and a real team behind you",
				],
				ctaLabel: "Join as an Educator",
				ctaHref: "/for-educators/apply",
				featured: false,
			},
			{
				key: "family" as const,
				title: "For Families",
				sub: "Care you can leave the house for.",
				bullets: [
					"Vetted, local educators matched to your family",
					"Flexible & last-minute cover when life happens",
					"Meet and message your educator before you book",
				],
				ctaLabel: "Request an Educator",
				ctaHref: "/for-families/request",
				featured: true,
			},
			{
				key: "centre" as const,
				title: "For Childcare Centres",
				sub: "Fully-staffed, every single day.",
				bullets: [
					"Qualified relief & permanent staff on demand",
					"Stay ratio-compliant, even at short notice",
					"Pre-screened to your exact standards",
				],
				ctaLabel: "Staff my centre",
				ctaHref: "/for-centres/request",
				featured: false,
			},
		],
	},
	testimonials: {
		eyebrow: "Loved by all three sides",
		title: "Real people, real peace of mind",
		quotes: [
			{
				quote:
					"Within two days we had an educator who felt like family. I finally stopped worrying every time I left for work.",
				initials: "MR",
				name: "Maya R.",
				role: "Parent of two · Families",
			},
			{
				quote:
					"Safe Hands fills our ratios with qualified people I'd actually hire myself. It's taken the panic out of staffing.",
				initials: "DO",
				name: "Daniel O.",
				role: "Nursery Manager · Centres",
			},
			{
				quote:
					"I pick the families and hours that work for me — and there's always someone from the team if I need support.",
				initials: "PS",
				name: "Priya S.",
				role: "Early-Years Educator · Educators",
			},
		],
	},
	trust: {
		eyebrow: "Trust & safety",
		title: "Safety isn't a feature. It's the whole point.",
		lede:
			"Before any educator joins Safe Hands, they pass a five-stage screening process — and we keep checking long after they're approved.",
		cards: [
			{
				title: "Identity & right to work",
				body: "Government ID and right-to-work confirmed before any profile goes live.",
			},
			{
				title: "Enhanced background checks",
				body: "Enhanced criminal record and child-safeguarding checks on every educator.",
			},
			{
				title: "References & history",
				body: "We verify work history and speak to references in person.",
			},
			{
				title: "Qualifications verified",
				body: "First aid, safeguarding and childcare credentials checked at the source.",
			},
			{
				title: "Ongoing training",
				body: "Regular re-checks, refreshed training and post-placement check-ins.",
			},
		],
	},
	request: {
		title: "Find childcare you can trust",
		body:
			"Tell us what you need and we'll match a vetted educator you'll be glad to welcome in — usually within 48 hours.",
		primary: { label: "Request an Educator", href: "/for-families/request" },
		secondary: { label: "Talk to our team", href: "/contact" },
		note: "No obligation · Free to request · Every educator fully vetted",
	},
	footer: {
		mission:
			"On a mission to make trustworthy childcare simple to find — for every family, centre, and educator.",
	},
};
