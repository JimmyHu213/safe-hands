import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EducatorSubmittedNotify(p: {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	suburb: string;
	qualificationLevel: string;
	yearsExperience: number;
	documents: { docType: string; url: string }[];
	adminLinkUrl: string;
}) {
	return (
		<Html>
			<Head />
			<Preview>New educator application — {p.firstName} {p.lastName}</Preview>
			<Body style={{ fontFamily: "ui-monospace, monospace", color: "#0f172a" }}>
				<Container style={{ maxWidth: 600, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 18 }}>New educator application</Heading>
					<Section>
						<Text>
							<strong>Name:</strong> {p.firstName} {p.lastName}<br />
							<strong>Email:</strong> {p.email}<br />
							<strong>Phone:</strong> {p.phone}<br />
							<strong>Suburb:</strong> {p.suburb}<br />
							<strong>Qualification:</strong> {p.qualificationLevel}<br />
							<strong>Years experience:</strong> {p.yearsExperience}<br />
						</Text>
						<Text><strong>Documents:</strong></Text>
						{p.documents.map((d, i) => (
							<Text key={i}><a href={d.url}>{d.docType}</a></Text>
						))}
						<Text><a href={p.adminLinkUrl}>Open in admin</a></Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
