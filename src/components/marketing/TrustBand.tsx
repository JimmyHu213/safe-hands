import { HOME } from "@/lib/cms/content";

export function TrustBand() {
  return (
    <section className="border-y bg-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
          Compliance is the product
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {HOME.trustBadges.map((b) => (
            <li key={b.label} className="rounded-md border bg-white p-4 text-center">
              <p className="text-sm font-semibold">{b.label}</p>
              <p className="mt-1 text-xs text-slate-500">{b.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
