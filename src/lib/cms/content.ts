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
	heroH1: "Reliable, qualified, compassionate childcare staff.",
	heroLede:
		"Safe Hands supplies fully-compliant educators to NSW childcare centres, OSHC programs, and private families — for casual relief, short-term cover, and emergency shifts.",
	audiences: [
		{
			key: "centre" as const,
			title: "I'm a Centre",
			sub: "Same-day ratio cover. Compliance you can audit.",
			href: "/for-centres",
		},
		{
			key: "family" as const,
			title: "I'm a Family",
			sub: "Vetted in-home educators when you need them.",
			href: "/for-families",
		},
		{
			key: "educator" as const,
			title: "I'm an Educator",
			sub: "Flexible shifts. Award-rate pay. Real support.",
			href: "/for-educators",
		},
	],
	trustBadges: [
		{ label: "WWCC tracked", note: "Working With Children Check verified" },
		{ label: "NSW Child Safe Standards", note: "Aligned to the OCG 10 standards" },
		{ label: "NQF aligned", note: "National Quality Framework practice" },
		{ label: "ASIC registered", note: "Pty Ltd, NSW" },
	],
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
