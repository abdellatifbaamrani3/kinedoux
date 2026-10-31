export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  tone = "light",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
}) {
  const alignCls = align === "center" ? "mx-auto text-center" : "text-start";
  const eye = tone === "dark" ? "text-leaf" : "text-brand";
  const titleCls = tone === "dark" ? "text-white" : "text-brand-dark";
  const subCls = tone === "dark" ? "text-leaf/80" : "text-muted";

  return (
    <div className={`max-w-[38rem] ${alignCls}`}>
      {eyebrow ? <p className={`kd-kicker mb-3 ${eye}`}>{eyebrow}</p> : null}
      <Tag className={`kd-h2 text-balance ${titleCls}`}>{title}</Tag>
      {sub ? <p className={`mt-4 text-base leading-8 md:text-lg ${subCls}`}>{sub}</p> : null}
    </div>
  );
}
