import Link from "next/link";
import { SITE } from "@/lib/cms/content";

export function CtaBand({
  title,
  body,
  primaryHref,
  primaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <section className="bg-slate-900 px-4 py-12 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
        <p className="max-w-2xl text-slate-200">{body}</p>
        <div className="mt-2 flex flex-col gap-2 md:flex-row">
          <Link
            href={primaryHref}
            className="rounded-md bg-white px-5 py-2 text-sm font-medium text-slate-900"
          >
            {primaryLabel}
          </Link>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="rounded-md border border-white/30 px-5 py-2 text-sm font-medium text-white"
          >
            Call {SITE.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
