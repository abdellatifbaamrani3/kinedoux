import { HOME } from "@/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HomeComparison() {
  const { comparison } = HOME;

  return (
    <section id="comparison" className="kd-section bg-alabaster">
      <div className="kd-container">
        <SectionHeading eyebrow={comparison.eyebrow} title={comparison.title} sub={comparison.sub} />
        <div className="mt-10 overflow-x-auto rounded-2xl ring-1 ring-brand/10">
          <table className="w-full min-w-[36rem] border-collapse bg-white text-right">
            <caption className="sr-only">{comparison.title}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-40 bg-sage/70 p-4" />
                {comparison.columns.map((col, i) => (
                  <th
                    key={col}
                    scope="col"
                    className={`p-4 text-sm font-bold ${i === 0 ? "bg-brand-dark text-white" : "bg-sage/70 text-muted"}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.label} className="border-t border-brand/10">
                  <th scope="row" className="bg-sage/40 p-4 text-sm font-bold text-brand-dark">
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td
                      key={`${row.label}-${i}`}
                      className={`p-4 align-top text-sm ${i === 0 ? "bg-sage/30 font-bold text-brand-dark" : "text-muted"}`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto mt-6 max-w-[42rem] rounded-2xl border border-action/30 bg-sage p-5 text-sm leading-7 text-muted">
          {comparison.honestNote}
        </p>
      </div>
    </section>
  );
}
