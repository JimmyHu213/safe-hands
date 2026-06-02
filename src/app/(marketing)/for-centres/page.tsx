import Link from "next/link";
import { FOR_CENTRES, SITE } from "@/lib/cms/content";

export default function ForCentresPage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">For Centres</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{FOR_CENTRES.h1}</h1>
          <p className="mt-4 text-lg text-slate-700">{FOR_CENTRES.lede}</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ul className="space-y-3 text-base text-slate-800">
            {FOR_CENTRES.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-12 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Centres talk to us first.</h2>
          <p className="text-slate-200">
            We do not ask centres to fill in a form to start. Call our booking line or email — we
            answer the phone.
          </p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row">
            <a
              href={`tel:${SITE.phoneTel}`}
              className="rounded-md bg-white px-5 py-2 text-sm font-medium text-slate-900"
            >
              {FOR_CENTRES.ctaPhone}: {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.emailBookings}`}
              className="rounded-md border border-white/30 px-5 py-2 text-sm font-medium text-white"
            >
              {FOR_CENTRES.ctaEmail}
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Prefer a structured request? <Link href="/for-centres/request" className="underline">
              Submit a booking request →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
