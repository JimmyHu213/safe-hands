import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function FamilyRequestNotify(p: {
	parentName: string;
	contactEmail: string;
	contactPhone: string;
	suburb: string;
	postcode: string;
	childrenCount: number;
	childrenAges: string;
	careType: string;
	shiftDate: string;
	shiftStart: string;
	shiftDurationHrs: number;
	specialNeedsFlag: boolean;
	specialNeedsNotes: string;
	notes: string;
	adminLinkUrl: string;
}) {
	return (
		<Html>
			<Head />
			<Preview>New family care request — {p.parentName}</Preview>
			<Body style={{ fontFamily: "ui-monospace, monospace", color: "#0f172a" }}>
				<Container style={{ maxWidth: 600, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 18 }}>New family care request</Heading>
					<Section>
						<Text>
							<strong>Parent:</strong> {p.parentName} &lt;{p.contactEmail}&gt; — {p.contactPhone}<br />
							<strong>Suburb:</strong> {p.suburb} {p.postcode}<br />
							<strong>Children:</strong> {p.childrenCount} (ages {p.childrenAges})<br />
							<strong>Care type:</strong> {p.careType}<br />
							<strong>Shift:</strong> {p.shiftDate} {p.shiftStart} for {p.shiftDurationHrs}h<br />
							<strong>Special needs:</strong> {p.specialNeedsFlag ? "yes" : "no"}<br />
							<strong>Special needs notes:</strong> {p.specialNeedsNotes || "(none)"}<br />
							<strong>Notes:</strong> {p.notes || "(none)"}
						</Text>
						<Text><a href={p.adminLinkUrl}>Open in admin</a></Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
