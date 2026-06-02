import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function AdminMagicLink({ url }: { url: string }) {
	return (
		<Html>
			<Head />
			<Preview>Sign in to Safe Hands admin</Preview>
			<Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
				<Container style={{ maxWidth: 560, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 20 }}>Sign in</Heading>
					<Section>
						<Text>Click the link below to sign in to the Safe Hands admin portal.</Text>
						<Text><a href={url}>Sign in →</a></Text>
						<Text style={{ fontSize: 12, color: "#475569" }}>
							This link is valid for 15 minutes and can only be used once. If you did not request it,
							ignore this email — no action is needed.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
