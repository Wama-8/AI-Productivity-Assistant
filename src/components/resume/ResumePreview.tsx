import type { ResumeData } from "@/lib/resume";

// Presentation layer: three ATS-aware templates rendering the same data model.
// Colours here are intentionally print-fixed (documents are always light) and
// scoped to the resume sheet only.

function contactLine(d: ResumeData) {
  return [d.personal.email, d.personal.phone, d.personal.location, d.personal.linkedin, d.personal.portfolio].filter(Boolean);
}

function bodyFor(e: ResumeData["experience"][number]) {
  return e.useAi && e.aiBullets.length ? e.aiBullets : e.rawDescription ? [e.rawDescription] : [];
}

const Empty = () => (
  <p className="text-sm italic text-neutral-400">Start filling in the form — your resume appears here live.</p>
);

function ModernTemplate({ d }: { d: ResumeData }) {
  const skills = [...d.skills.technical, ...d.skills.soft];
  return (
    <div className="font-sans text-[11.5px] leading-relaxed text-neutral-800">
      <header className="border-l-4 border-[#c2703a] pl-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{d.personal.fullName || "Your Name"}</h1>
        {d.personal.title && <p className="text-sm font-medium text-[#c2703a]">{d.personal.title}</p>}
        <p className="mt-1 text-[10.5px] text-neutral-600">{contactLine(d).join("  ·  ")}</p>
      </header>
      <Sections d={d} skills={skills} headingClass="mt-5 mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c2703a]" ruleClass="border-b border-neutral-200 pb-1" />
    </div>
  );
}

function ProfessionalTemplate({ d }: { d: ResumeData }) {
  const skills = [...d.skills.technical, ...d.skills.soft];
  return (
    <div className="font-serif text-[11.5px] leading-relaxed text-neutral-900">
      <header className="border-b-2 border-neutral-900 pb-3 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-[0.12em]">{d.personal.fullName || "Your Name"}</h1>
        {d.personal.title && <p className="text-sm italic">{d.personal.title}</p>}
        <p className="mt-1 text-[10.5px]">{contactLine(d).join("  |  ")}</p>
      </header>
      <Sections d={d} skills={skills} headingClass="mt-5 mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-900" ruleClass="border-b border-neutral-400 pb-1" />
    </div>
  );
}

function MinimalTemplate({ d }: { d: ResumeData }) {
  const skills = [...d.skills.technical, ...d.skills.soft];
  return (
    <div className="font-sans text-[11.5px] leading-relaxed text-black">
      <header>
        <h1 className="text-xl font-bold">{d.personal.fullName || "Your Name"}</h1>
        {d.personal.title && <p className="text-[12px]">{d.personal.title}</p>}
        <p className="text-[10.5px]">{contactLine(d).join(" | ")}</p>
      </header>
      <Sections d={d} skills={skills} headingClass="mt-4 mb-1 text-[11.5px] font-bold uppercase" ruleClass="" />
    </div>
  );
}

function Sections({ d, skills, headingClass, ruleClass }: { d: ResumeData; skills: string[]; headingClass: string; ruleClass: string }) {
  const H = ({ children }: { children: string }) => <h2 className={`${headingClass} ${ruleClass}`}>{children}</h2>;
  const nothing =
    !d.summary && !skills.length && !d.experience.length && !d.education.length && !d.projects.length && !d.certifications.length;
  if (nothing) return <div className="mt-6"><Empty /></div>;
  return (
    <>
      {d.summary && (
        <section>
          <H>Professional Summary</H>
          <p>{d.summary}</p>
        </section>
      )}
      {!!skills.length && (
        <section>
          <H>Skills</H>
          {d.skills.technical.length > 0 && (
            <p>
              <span className="font-semibold">Technical: </span>
              {d.skills.technical.join(", ")}
            </p>
          )}
          {d.skills.soft.length > 0 && (
            <p>
              <span className="font-semibold">Professional: </span>
              {d.skills.soft.join(", ")}
            </p>
          )}
        </section>
      )}
      {!!d.experience.length && (
        <section>
          <H>Work Experience</H>
          {d.experience.map((e) => (
            <div key={e.id} className="mb-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {e.role || "Role"}
                  {e.company ? ` — ${e.company}` : ""}
                  {e.location ? `, ${e.location}` : ""}
                </p>
                <p className="text-[10.5px] text-neutral-600">
                  {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                </p>
              </div>
              <ul className="ml-4 list-disc">
                {bodyFor(e).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      {!!d.education.length && (
        <section>
          <H>Education</H>
          {d.education.map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {e.qualification}
                  {e.institution ? ` — ${e.institution}` : ""}
                </p>
                <p className="text-[10.5px] text-neutral-600">{[e.startYear, e.endYear].filter(Boolean).join(" – ")}</p>
              </div>
              {e.details && <p>{e.details}</p>}
            </div>
          ))}
        </section>
      )}
      {!!d.projects.length && (
        <section>
          <H>Projects</H>
          {d.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="font-semibold">
                {p.name}
                {p.tech ? ` — ${p.tech}` : ""}
              </p>
              {p.description && <p>{p.description}</p>}
            </div>
          ))}
        </section>
      )}
      {!!d.certifications.length && (
        <section>
          <H>Certifications</H>
          <ul className="ml-4 list-disc">
            {d.certifications.map((c) => (
              <li key={c.id}>{c.text}</li>
            ))}
          </ul>
        </section>
      )}
      {!!d.achievements.length && (
        <section>
          <H>Achievements</H>
          <ul className="ml-4 list-disc">
            {d.achievements.map((c) => (
              <li key={c.id}>{c.text}</li>
            ))}
          </ul>
        </section>
      )}
      {!!d.volunteering.length && (
        <section>
          <H>Volunteer Experience</H>
          <ul className="ml-4 list-disc">
            {d.volunteering.map((c) => (
              <li key={c.id}>{c.text}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export function ResumeSheet({ data }: { data: ResumeData }) {
  return (
    <div id="resume-sheet" className="mx-auto w-full max-w-[794px] bg-white p-8 text-black shadow-sm sm:p-10">
      {data.template === "modern" && <ModernTemplate d={data} />}
      {data.template === "professional" && <ProfessionalTemplate d={data} />}
      {data.template === "minimal" && <MinimalTemplate d={data} />}
    </div>
  );
}
