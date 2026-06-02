import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface CentreRequestNotifyProps {
	centreName: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;
	suburb: string;
	postcode: string;
	roleNeeded: string;
	shiftDate: string;
	shiftStart: string;
	shiftDurationHrs: number;
	specialNeedsFlag: boolean;
	notes: string;
	adminLinkUrl: string;
}

export default function CentreRequestNotify(p: CentreRequestNotifyProps) {
	return (
		<Html>
			<Head />
			<Preview>New centre booking request — {p.centreName}</Preview>
			<Body style={{ fontFamily: "ui-monospace, monospace", color: "#0f172a" }}>
				<Container style={{ maxWidth: 600, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 18 }}>New centre booking request</Heading>
					<Section>
						<Text>
							<strong>Centre:</strong> {p.centreName}<br />
							<strong>Contact:</strong> {p.contactName} &lt;{p.contactEmail}&gt; — {p.contactPhone}<br />
							<strong>Suburb:</strong> {p.suburb} {p.postcode}<br />
							<strong>Role:</strong> {p.roleNeeded}<br />
							<strong>Shift:</strong> {p.shiftDate} {p.shiftStart} for {p.shiftDurationHrs}h<br />
							<strong>Special needs:</strong> {p.specialNeedsFlag ? "yes" : "no"}<br />
							<strong>Notes:</strong> {p.notes || "(none)"}
						</Text>
						<Text><a href={p.adminLinkUrl}>Open in admin</a></Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
