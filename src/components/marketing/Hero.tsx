import { HOME } from "@/lib/cms/content";
import { AudienceCards } from "./AudienceCards";

export function Hero() {
  return (
    <section className="border-b bg-gradient-to-b from-white to-slate-50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {HOME.heroH1}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{HOME.heroLede}</p>
      </div>
      <AudienceCards />
    </section>
  );
}
