import { Hero } from "@/components/marketing/Hero";
import { TrustBand } from "@/components/marketing/TrustBand";
import { CtaBand } from "@/components/marketing/CtaBand";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export default function Home() {
  const appLoginUrl = process.env.APP_LOGIN_URL ?? "";
  return (
    <>
      <Hero appLoginUrl={appLoginUrl} />
      <TrustBand />
      <section className="px-4 py-16">
        <SectionHeading
          eyebrow="What we do"
          title="One agency. Three audiences. One bench."
          lede="We supply the same vetted educators to centres, families, and OSHC programs across Greater Sydney and selected regional NSW."
        />
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Centres</h3>
            <p className="mt-2 text-sm text-slate-600">
              Casual relief, short-term cover, emergency fills. Cert III, Diploma, ECT,
              Room Leader, and OSHC educators with verified clearances.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Families</h3>
            <p className="mt-2 text-sm text-slate-600">
              In-home care for 0–12 year-olds. After-school, holiday, ad-hoc, overnight.
              Vetted educators, agency accountability.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Educators</h3>
            <p className="mt-2 text-sm text-slate-600">
              Children's Services Award rates with casual loading. Pick your suburbs and
              hours. Compliance reminders so your clearances never lapse.
            </p>
          </div>
        </div>
      </section>
      <CtaBand
        title="Need cover today?"
        body="Call our booking line, or apply if you're an educator looking for shifts."
        primaryHref="/for-centres"
        primaryLabel="For centres →"
      />
    </>
  );
}
