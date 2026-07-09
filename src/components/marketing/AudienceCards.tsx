import Link from "next/link";
import { HOME } from "@/lib/cms/content";

export function AudienceCards() {
  return (
    <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
      {HOME.audiences.map((a) => (
        <Link
          key={a.key}
          href={a.href}
          aria-label={a.title}
          className="group rounded-lg border bg-white p-6 transition hover:border-slate-400 hover:shadow-sm"
        >
          <h3 className="text-lg font-semibold">{a.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{a.sub}</p>
          <p className="mt-4 text-sm font-medium text-slate-900 group-hover:underline">
            Learn more →
          </p>
        </Link>
      ))}
    </div>
  );
}
