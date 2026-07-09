import { Hero } from "@/components/marketing/Hero";
import { StatsBand } from "@/components/marketing/StatsBand";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhyCards } from "@/components/marketing/WhyCards";
import { AudienceCards } from "@/components/marketing/AudienceCards";
import { Testimonials } from "@/components/marketing/Testimonials";
import { TrustSafety } from "@/components/marketing/TrustSafety";
import { RequestCta } from "@/components/marketing/RequestCta";

export default function Home() {
	return (
		<>
			<Hero />
			<StatsBand />
			<HowItWorks />
			<WhyCards />
			<AudienceCards />
			<Testimonials />
			<TrustSafety />
			<RequestCta />
		</>
	);
}
