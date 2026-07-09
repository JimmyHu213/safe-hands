import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { listPublishedFaq, groupByAudience } from "@/lib/cms/faq";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const { env } = getCloudflareContext();
  const entries = await listPublishedFaq(db(env.DB));
  const grouped = groupByAudience(entries);

  const sections: { key: keyof typeof grouped; title: string }[] = [
    { key: "general", title: "General" },
    { key: "centre", title: "For centres" },
    { key: "family", title: "For families" },
    { key: "educator", title: "For educators" },
  ];

  return (
    <>
      <section className="border-b bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight">Frequently asked questions</h1>
          <p className="mt-4 text-lg text-slate-700">
            Answers to the questions we hear most. If yours is not here, give us a call.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s) => {
            const items = grouped[s.key];
            if (items.length === 0) return null;
            return (
              <div key={s.key}>
                <h2 className="text-xl font-semibold">{s.title}</h2>
                <dl className="mt-4 divide-y border-y">
                  {items.map((e) => (
                    <div key={e.id} className="py-4">
                      <dt className="font-medium">{e.question}</dt>
                      <dd className="mt-2 whitespace-pre-line text-sm text-slate-700">
                        {e.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}

          {entries.length === 0 ? (
            <p className="text-sm text-slate-600">No FAQ entries yet — please contact us directly.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
