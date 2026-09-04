import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { PROMPT_CATALOGUE, AI_DISCLAIMER } from "@/lib/prompts";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Project Documentation — Wamashudu Resume Builder" },
      { name: "description", content: "Problem statement, target users, requirements, architecture, prompt engineering strategy, responsible AI policy and test cases for the Wamashudu AI Resume Builder." },
      { property: "og:title", content: "Project Documentation — Wamashudu Resume Builder" },
      { property: "og:description", content: "Design document and prompt catalogue for the AI Resume Builder." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocsPage,
});

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="border-b border-border pb-2 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function DocsPage() {
  const copyPrompt = (template: string, name: string) => {
    navigator.clipboard.writeText(template).then(
      () => toast.success(`Copied "${name}"`),
      () => toast.error("Could not copy to clipboard"),
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to builder
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">Wamashudu Resume Builder — Project Document</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AI-assisted resume creation for graduates, professionals and career switchers.
        </p>
      </header>

      <div className="mt-8 space-y-10">
        <Section id="problem" title="1. Problem statement">
          <p>
            Job seekers — especially graduates, working professionals and career switchers — spend hours writing and
            rewriting resumes, and many are rejected by Applicant Tracking Systems (ATS) before a human ever reads
            them. Common pain points: weak summaries, duty-based (not achievement-based) experience descriptions,
            missing ATS keywords, poorly articulated transferable skills, and uncertainty about how well a resume
            matches a specific job.
          </p>
          <p>
            <strong>Solution:</strong> an AI-assisted resume builder that turns the user's own facts into polished,
            ATS-aware resume content — summaries, enhanced experience bullets, evidence-backed skills, ATS scoring and
            job-match analysis — inside a guided multi-step form with live preview, templates and export.
          </p>
          <p>
            <strong>Measurable productivity value:</strong> first-draft resume content is produced in minutes instead of
            hours; ATS keyword gaps are surfaced automatically instead of via manual comparison; every AI suggestion is
            editable and traceable to user-provided evidence.
          </p>
        </Section>

        <Section id="users" title="2. Target users & personas">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>University graduate (e.g. "Aisha, 22, BSc IT"):</strong> limited work history; needs education,
              projects, internships, volunteering and skills presented professionally; needs achievements framed without
              inventing experience.
            </li>
            <li>
              <strong>Working professional (e.g. "Thabo, 31, marketing manager"):</strong> has a resume that needs
              improvement; wants tailoring to specific job ads and ATS optimization; wants quantified, action-verb
              bullets.
            </li>
            <li>
              <strong>Career switcher (e.g. "Lerato, 38, teacher → data analyst"):</strong> needs transferable skills
              identified and evidence-backed, experience rewritten toward a new field, and an honest job-match gap
              analysis.
            </li>
          </ul>
        </Section>

        <Section id="requirements" title="3. Requirements">
          <p><strong>Functional:</strong> multi-step form (personal, education, experience, projects, skills, certifications, achievements, volunteering, target job, job description); AI summary variants; AI experience enhancer; AI skills analysis (verified vs. potential, technical vs. soft); ATS analysis with estimated score and keyword gaps; optional job-match analysis; master resume generation; template gallery (Modern / Professional / Minimal ATS) with lossless switching; live preview; PDF and plain-text export with confirmation; session-aware AI chatbot.</p>
          <p><strong>Non-functional:</strong> responsive (desktop/tablet/mobile); fast loading states and clear error messages; data persisted in the browser (localStorage) — no account required; AI never fabricates qualifications; disclaimers on all AI output.</p>
        </Section>

        <Section id="journey" title="4. User journey & workflow">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Fill in the 10-step form (progress indicator + completeness score guide the way).</li>
            <li>Optionally set a target job title, industry and paste a job description.</li>
            <li>Run AI features per section (summary, experience bullets, skills) or generate a full draft.</li>
            <li>Review every suggestion — AI output is clearly labelled and kept separate from user-entered text.</li>
            <li>Run ATS analysis and job-match analysis; apply explainable recommendations.</li>
            <li>Switch templates in the live preview; confirm and export to PDF or plain text.</li>
            <li>Ask the chatbot follow-up questions at any point; it answers using the current resume context.</li>
          </ol>
        </Section>

        <Section id="architecture" title="5. Technical & AI architecture">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>UI layer:</strong> React + TanStack Start; wizard components, preview templates, dashboards.</li>
            <li><strong>Data layer:</strong> typed resume model (<code>src/lib/resume.ts</code>); localStorage persistence; plain-text/ATS serializers; prompt-context serializer.</li>
            <li><strong>Application logic layer:</strong> typed server functions (<code>src/lib/ai.functions.ts</code>) with Zod input validation and defensive output parsing/clamping.</li>
            <li><strong>AI/prompt layer:</strong> structured prompt templates (<code>src/lib/prompts.ts</code>) → Lovable AI Gateway (Gemini) via a server-only client with friendly error semantics.</li>
            <li><strong>Export layer:</strong> print-isolated A4 stylesheet for PDF, plus a plain-text download.</li>
          </ul>
        </Section>

        <Section id="prompts" title="6. Prompt engineering strategy">
          <p>
            Every prompt follows a fixed structure: <strong>ROLE → CONTEXT → TASK → CONSTRAINTS → OUTPUT FORMAT →
            QUALITY CRITERIA</strong>. Techniques used: role prompting (senior resume writer / ATS analyst), context
            injection (the user's actual resume facts, target job and job description), a few-shot example in the
            experience enhancer, structured JSON outputs with server-side validation, hard constraints (never invent
            employers, degrees, certifications, metrics or achievements; evidence-only skills; no discriminatory
            recommendations; no employment guarantees), and iterative refinement (missing-information detection lets the
            user supply more facts and re-run).
          </p>
          <div className="space-y-4">
            {PROMPT_CATALOGUE.map((p) => (
              <details key={p.id} className="rounded-lg border border-border bg-card">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3">
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{p.purpose}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      copyPrompt(p.template, p.name);
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" /> Copy
                  </button>
                </summary>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-border bg-muted/50 p-4 font-mono text-xs">{p.template}</pre>
              </details>
            ))}
          </div>
        </Section>

        <Section id="responsible-ai" title="7. Responsible AI">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>All AI content must be reviewed by the user; AI can be inaccurate.</li>
            <li>The AI never fabricates qualifications, employment history, degrees, certifications or achievements — this is enforced in every prompt and re-checked server-side.</li>
            <li>User-provided facts and AI suggestions are visually distinguished (provenance badges).</li>
            <li>No discriminatory recommendations; ATS and match scores are estimates, never hiring guarantees.</li>
            <li>Data stays in the user's browser (localStorage); resume text is sent to the AI only when the user invokes a feature.</li>
          </ul>
          <blockquote className="rounded-md border-l-4 border-accent bg-muted/50 p-3 text-muted-foreground">
            {AI_DISCLAIMER}
          </blockquote>
        </Section>

        <Section id="challenges" title="8. Challenges & solutions">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Hallucination risk:</strong> solved with evidence-only constraints, few-shot grounding, and missing-information detection instead of invented filler.</li>
            <li><strong>Unstructured LLM output:</strong> solved with strict JSON output formats plus defensive parsing and clamping.</li>
            <li><strong>Template switching without data loss:</strong> one canonical data model; templates are pure render functions.</li>
            <li><strong>Clean PDF export:</strong> print stylesheet isolates the resume sheet on A4.</li>
          </ul>
        </Section>

        <Section id="tests" title="9. Test cases">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Empty form → AI features are blocked with a helpful message asking for more detail.</li>
            <li>Graduate profile (education/projects only) → summary generator produces a factual summary with no invented experience.</li>
            <li>Experience enhancer with a duty-based description → action-verb bullets; no invented metrics; missing-info list prompts for real numbers.</li>
            <li>Skills analysis → skills are separated technical/soft and verified/potential, each verified skill citing evidence.</li>
            <li>ATS analysis with a pasted job description → estimated score, matching vs. missing keywords, disclaimer shown.</li>
            <li>Job-match analysis → score with strong matches and gaps; wording avoids any hiring guarantee.</li>
            <li>Template switching → all data preserved across Modern / Professional / Minimal ATS.</li>
            <li>Export → confirmation dialog appears; PDF prints only the resume sheet; .txt downloads.</li>
          </ol>
        </Section>

        <Section id="impact" title="10. Impact">
          <p>
            Cuts first-draft resume time from hours to minutes, gives every job seeker access to ATS-aware writing
            assistance, and improves resume quality without compromising honesty — the AI strengthens how real
            experience is communicated, it never invents it.
          </p>
        </Section>
      </div>
    </div>
  );
}
