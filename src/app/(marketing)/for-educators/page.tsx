import Link from "next/link";
import { FOR_EDUCATORS } from "@/lib/cms/content";

export default function ForEducatorsPage() {
  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">For Educators</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{FOR_EDUCATORS.h1}</h1>
          <p className="mt-4 text-lg text-slate-700">{FOR_EDUCATORS.lede}</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ul className="space-y-3 text-base text-slate-800">
            {FOR_EDUCATORS.bullets.map((b) => (
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
          <h2 className="text-2xl font-semibold md:text-3xl">Join the bench</h2>
          <p className="text-slate-200">
            Tell us about your qualifications, where you can travel, and when you can work. Step
            through at your own pace — we will email you a link to resume any time.
          </p>
          <Link
            href="/for-educators/apply"
            className="mt-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-slate-900"
          >
            Start your application →
          </Link>
        </div>
      </section>
    </>
  );
}
