// Data layer: resume data structures + local storage persistence (prototype storage).

export type Education = {
  id: string;
  institution: string;
  qualification: string;
  startYear: string;
  endYear: string;
  details: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  rawDescription: string;
  /** AI-enhanced bullets. Kept separate from user input (Responsible AI: provenance). */
  aiBullets: string[];
  useAi: boolean;
};

export type Project = {
  id: string;
  name: string;
  tech: string;
  description: string;
};

export type SimpleItem = { id: string; text: string };

export type SkillSet = {
  technical: string[];
  soft: string[];
  /** AI-suggested skills the user has NOT confirmed. Never printed unless accepted. */
  suggestedTechnical: string[];
  suggestedSoft: string[];
};

export type ResumeData = {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  objective: string;
  summary: string;
  /** Marks whether current summary text came from AI (before user edits). */
  summaryFromAi: boolean;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillSet;
  certifications: SimpleItem[];
  achievements: SimpleItem[];
  volunteering: SimpleItem[];
  target: {
    jobTitle: string;
    industry: string;
    jobDescription: string;
  };
  template: TemplateId;
};

export type TemplateId = "modern" | "professional" | "minimal";

export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "modern", name: "Modern", blurb: "Clean contemporary layout with accent header." },
  { id: "professional", name: "Professional", blurb: "Traditional corporate serif layout." },
  { id: "minimal", name: "Minimal ATS", blurb: "Plain, single-column, parser-friendly." },
];

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyResume = (): ResumeData => ({
  personal: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  objective: "",
  summary: "",
  summaryFromAi: false,
  education: [],
  experience: [],
  projects: [],
  skills: { technical: [], soft: [], suggestedTechnical: [], suggestedSoft: [] },
  certifications: [],
  achievements: [],
  volunteering: [],
  target: { jobTitle: "", industry: "", jobDescription: "" },
  template: "modern",
});

export const sampleResume = (): ResumeData => ({
  ...emptyResume(),
  personal: {
    fullName: "Thandi Mokoena",
    title: "Junior Data Analyst",
    email: "thandi.mokoena@example.com",
    phone: "+27 71 234 5678",
    location: "Johannesburg, South Africa",
    linkedin: "linkedin.com/in/thandimokoena",
    portfolio: "github.com/thandim",
  },
  objective: "Move from retail supervision into a data analyst role in fintech.",
  education: [
    {
      id: uid(),
      institution: "University of Johannesburg",
      qualification: "BSc Information Technology",
      startYear: "2021",
      endYear: "2024",
      details: "Modules: Databases, Statistics, Software Development. Final-year project on churn prediction.",
    },
  ],
  experience: [
    {
      id: uid(),
      role: "Retail Supervisor",
      company: "BrightMart",
      location: "Soweto",
      startDate: "2022-03",
      endDate: "2025-01",
      rawDescription: "I helped customers, made the weekly stock report in Excel and trained 4 new staff members.",
      aiBullets: [],
      useAi: false,
    },
  ],
  projects: [
    {
      id: uid(),
      name: "Customer Churn Dashboard",
      tech: "Python, Pandas, Power BI",
      description: "Built a dashboard on a public telecom dataset showing churn drivers by segment.",
    },
  ],
  skills: { technical: ["Python", "SQL", "Excel"], soft: ["Communication", "Teamwork"], suggestedTechnical: [], suggestedSoft: [] },
  certifications: [{ id: uid(), text: "Google Data Analytics Certificate (2024)" }],
  achievements: [{ id: uid(), text: "Employee of the month, BrightMart (July 2024)" }],
  volunteering: [{ id: uid(), text: "Weekend coding tutor, Soweto Youth Centre" }],
  target: {
    jobTitle: "Data Analyst",
    industry: "Fintech",
    jobDescription:
      "We are looking for a Data Analyst with SQL, Python and Power BI experience to build reporting for our payments product. Experience with cloud data warehouses is a plus.",
  },
});

const KEY = "wamashudu-resume-v1";

export function loadResume(): ResumeData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...emptyResume(), ...(JSON.parse(raw) as ResumeData) };
  } catch {
    return null;
  }
}

export function saveResume(data: ResumeData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

/** Condensed, PII-light serialization of the resume for prompt context injection. */
export function resumeToContext(d: ResumeData): string {
  const lines: string[] = [];
  lines.push(`PROFESSIONAL TITLE: ${d.personal.title || "(not provided)"}`);
  lines.push(`LOCATION: ${d.personal.location || "(not provided)"}`);
  lines.push(`CAREER OBJECTIVE: ${d.objective || "(not provided)"}`);
  lines.push(`CURRENT SUMMARY: ${d.summary || "(none yet)"}`);
  lines.push(
    "EDUCATION:\n" +
      (d.education.map((e) => `- ${e.qualification}, ${e.institution} (${e.startYear}–${e.endYear}). ${e.details}`).join("\n") ||
        "- (none provided)"),
  );
  lines.push(
    "WORK EXPERIENCE:\n" +
      (d.experience
        .map(
          (e) =>
            `- ${e.role} at ${e.company} (${e.startDate}–${e.endDate}). Described as: "${e.rawDescription}"` +
            (e.aiBullets.length ? `\n  Enhanced bullets: ${e.aiBullets.join(" | ")}` : ""),
        )
        .join("\n") || "- (none provided)"),
  );
  lines.push(
    "PROJECTS:\n" + (d.projects.map((p) => `- ${p.name} [${p.tech}]: ${p.description}`).join("\n") || "- (none provided)"),
  );
  lines.push(`SKILLS (user-confirmed): technical = ${d.skills.technical.join(", ") || "none"}; soft = ${d.skills.soft.join(", ") || "none"}`);
  lines.push("CERTIFICATIONS:\n" + (d.certifications.map((c) => `- ${c.text}`).join("\n") || "- (none provided)"));
  lines.push("ACHIEVEMENTS:\n" + (d.achievements.map((c) => `- ${c.text}`).join("\n") || "- (none provided)"));
  lines.push("VOLUNTEER EXPERIENCE:\n" + (d.volunteering.map((c) => `- ${c.text}`).join("\n") || "- (none provided)"));
  return lines.join("\n\n");
}

export function resumePlainText(d: ResumeData): string {
  const parts: string[] = [];
  parts.push(d.personal.fullName, d.personal.title);
  parts.push([d.personal.email, d.personal.phone, d.personal.location, d.personal.linkedin, d.personal.portfolio].filter(Boolean).join(" | "));
  if (d.summary) parts.push("\nPROFESSIONAL SUMMARY\n" + d.summary);
  if (d.skills.technical.length || d.skills.soft.length)
    parts.push("\nSKILLS\n" + [...d.skills.technical, ...d.skills.soft].join(", "));
  if (d.experience.length)
    parts.push(
      "\nWORK EXPERIENCE\n" +
        d.experience
          .map((e) => {
            const body = e.useAi && e.aiBullets.length ? e.aiBullets.map((b) => "• " + b).join("\n") : e.rawDescription;
            return `${e.role} — ${e.company}, ${e.location} (${e.startDate}–${e.endDate})\n${body}`;
          })
          .join("\n\n"),
    );
  if (d.education.length)
    parts.push(
      "\nEDUCATION\n" +
        d.education.map((e) => `${e.qualification}, ${e.institution} (${e.startYear}–${e.endYear})\n${e.details}`).join("\n\n"),
    );
  if (d.projects.length)
    parts.push("\nPROJECTS\n" + d.projects.map((p) => `${p.name} [${p.tech}]\n${p.description}`).join("\n\n"));
  if (d.certifications.length) parts.push("\nCERTIFICATIONS\n" + d.certifications.map((c) => "• " + c.text).join("\n"));
  if (d.achievements.length) parts.push("\nACHIEVEMENTS\n" + d.achievements.map((c) => "• " + c.text).join("\n"));
  if (d.volunteering.length) parts.push("\nVOLUNTEER EXPERIENCE\n" + d.volunteering.map((c) => "• " + c.text).join("\n"));
  return parts.filter(Boolean).join("\n");
}

export function completeness(d: ResumeData): number {
  const checks = [
    !!d.personal.fullName,
    !!d.personal.email,
    !!d.personal.title,
    !!d.summary,
    d.education.length > 0,
    d.experience.length > 0 || d.projects.length > 0,
    d.skills.technical.length + d.skills.soft.length >= 3,
    !!d.target.jobTitle,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
