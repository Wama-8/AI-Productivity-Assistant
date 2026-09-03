import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ResumeSheet } from "@/components/resume/ResumePreview";
import { AssistantChat } from "@/components/resume/AssistantChat";
import {
  analyzeAts,
  analyzeJobMatch,
  enhanceExperience,
  generateSkills,
  generateSummary,
  type AtsResult,
  type MatchResult,
  type SkillsResult,
  type SummaryResult,
} from "@/lib/ai.functions";
import {
  completeness,
  emptyResume,
  loadResume,
  resumePlainText,
  resumeToContext,
  sampleResume,
  saveResume,
  TEMPLATES,
  uid,
  type ResumeData,
  type TemplateId,
} from "@/lib/resume";
import { AI_DISCLAIMER } from "@/lib/prompts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wamashudu Resume Builder — AI ATS-Friendly Resume Creator" },
      {
        name: "description",
        content:
          "Build an ATS-friendly resume in minutes. AI summaries, experience rewriting, evidence-based skills, ATS scoring, job-match analysis, three templates and PDF export.",
      },
      { property: "og:title", content: "Wamashudu Resume Builder — AI ATS-Friendly Resume Creator" },
      {
        property: "og:description",
        content: "AI-assisted resume writing for graduates, professionals and career switchers, with ATS optimisation and instant export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const STEPS = [
  { id: "personal", label: "Personal" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "extras", label: "Projects & Extras" },
  { id: "target", label: "Target job" },
  { id: "ai", label: "AI content" },
  { id: "ats", label: "ATS & match" },
  { id: "assistant", label: "Assistant" },
  { id: "export", label: "Template & export" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ai-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ai">
      <Sparkles className="h-3 w-3" /> AI draft
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border bg-card p-4 ${className}`}>{children}</div>;
}

function Builder() {
  const [data, setData] = useState<ResumeData>(emptyResume());
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<StepId>("personal");
  const [confirmExport, setConfirmExport] = useState(false);

  useEffect(() => {
    const stored = loadResume();
    if (stored) setData(stored);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) saveResume(data);
  }, [data, hydrated]);

  const update = (patch: Partial<ResumeData>) => setData((d) => ({ ...d, ...patch }));
  const context = useMemo(() => resumeToContext(data), [data]);
  const plain = useMemo(() => resumePlainText(data), [data]);
  const percent = completeness(data);
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-tight">Wamashudu Resume Builder</p>
              <p className="text-[11px] text-muted-foreground">AI writing &amp; ATS optimisation aid</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/docs" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Project docs
            </Link>
            <Button variant="outline" size="sm" onClick={() => setData(sampleResume())}>
              Load sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setData(emptyResume());
                toast.success("Cleared. Your local copy was reset.");
              }}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={() => setConfirmExport(true)}>
              <Download className="mr-1 h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 pb-3">
          <Progress value={percent} className="h-1.5 flex-1" />
          <span className="text-[11px] text-muted-foreground">{percent}% complete</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="print:hidden">
          <nav className="mb-4 flex flex-wrap gap-1.5" aria-label="Resume steps">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  s.id === step ? "bg-primary text-primary-foreground" : "border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {i + 1}. {s.label}
              </button>
            ))}
          </nav>

          <div className="rounded-lg border bg-card p-5">
            {step === "personal" && <PersonalStep data={data} update={update} />}
            {step === "education" && <EducationStep data={data} update={update} />}
            {step === "experience" && <ExperienceStep data={data} update={update} />}
            {step === "skills" && <SkillsStep data={data} update={update} context={context} />}
            {step === "extras" && <ExtrasStep data={data} update={update} />}
            {step === "target" && <TargetStep data={data} update={update} />}
            {step === "ai" && <AiStep data={data} update={update} context={context} />}
            {step === "ats" && <AtsStep data={data} plain={plain} />}
            {step === "assistant" && <AssistantChat context={context} />}
            {step === "export" && <ExportStep data={data} update={update} onExport={() => setConfirmExport(true)} />}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={stepIndex === 0} onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)].id)}>
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
            </Button>
            <Button
              size="sm"
              disabled={stepIndex === STEPS.length - 1}
              onClick={() => setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].id)}
            >
              Next <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <p className="mt-4 flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>{AI_DISCLAIMER}</span>
          </p>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
            <span className="text-xs font-medium text-muted-foreground">Live preview</span>
            <div className="flex gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => update({ template: t.id as TemplateId })}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    data.template === t.id ? "border-accent bg-accent text-accent-foreground" : "hover:bg-secondary"
                  }`}
                  title={t.blurb}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[80vh] overflow-y-auto rounded-lg border bg-muted p-3 print:max-h-none print:overflow-visible print:border-0 print:bg-white print:p-0">
            <ResumeSheet data={data} />
          </div>
        </div>
      </main>

      <AlertDialog open={confirmExport} onOpenChange={setConfirmExport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export your resume?</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm you have reviewed every section — including AI-generated wording — and that the content accurately reflects
              your qualifications, experience and achievements. Your browser print dialog opens next; choose "Save as PDF".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([plain], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${(data.personal.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}-ats.txt`;
                a.click();
                URL.revokeObjectURL(url);
                setConfirmExport(false);
                toast.success("Plain-text ATS version downloaded.");
              }}
            >
              Download .txt
            </Button>
            <AlertDialogAction
              onClick={() => {
                setConfirmExport(false);
                setTimeout(() => window.print(), 150);
              }}
            >
              Confirm &amp; download PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------- Steps ---------------- */

type StepProps = { data: ResumeData; update: (p: Partial<ResumeData>) => void };

function PersonalStep({ data, update }: StepProps) {
  const p = data.personal;
  const set = (k: keyof ResumeData["personal"], v: string) => update({ personal: { ...p, [k]: v } });
  return (
    <Section title="Personal information" hint="Contact details stay in your browser and are never sent to the AI model.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={p.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Thandi Mokoena" />
        <Field label="Professional title" value={p.title} onChange={(e) => set("title", e.target.value)} placeholder="Junior Data Analyst" />
        <Field label="Email" type="email" value={p.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
        <Field label="Phone" value={p.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+27 71 234 5678" />
        <Field label="Location" value={p.location} onChange={(e) => set("location", e.target.value)} placeholder="Johannesburg, South Africa" />
        <Field label="LinkedIn" value={p.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/…" />
        <Field label="Portfolio / GitHub" value={p.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="github.com/…" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="objective">Career objective</Label>
        <Textarea
          id="objective"
          rows={3}
          value={data.objective}
          onChange={(e) => update({ objective: e.target.value })}
          placeholder="In one or two lines: what role are you moving towards and why?"
        />
      </div>
    </Section>
  );
}

function EducationStep({ data, update }: StepProps) {
  const add = () =>
    update({
      education: [...data.education, { id: uid(), institution: "", qualification: "", startYear: "", endYear: "", details: "" }],
    });
  const set = (id: string, patch: Partial<ResumeData["education"][number]>) =>
    update({ education: data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  return (
    <Section title="Education" hint="Graduates: include modules, final-year projects and academic achievements — they carry real weight.">
      {data.education.map((e) => (
        <Card key={e.id} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Qualification" value={e.qualification} onChange={(ev) => set(e.id, { qualification: ev.target.value })} placeholder="BSc Information Technology" />
            <Field label="Institution" value={e.institution} onChange={(ev) => set(e.id, { institution: ev.target.value })} placeholder="University of Johannesburg" />
            <Field label="Start year" value={e.startYear} onChange={(ev) => set(e.id, { startYear: ev.target.value })} placeholder="2021" />
            <Field label="End year" value={e.endYear} onChange={(ev) => set(e.id, { endYear: ev.target.value })} placeholder="2024" />
          </div>
          <Textarea rows={2} value={e.details} onChange={(ev) => set(e.id, { details: ev.target.value })} placeholder="Key modules, distinctions, final-year project…" />
          <Button variant="ghost" size="sm" onClick={() => update({ education: data.education.filter((x) => x.id !== e.id) })}>
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
          </Button>
        </Card>
      ))}
      <Button variant="outline" onClick={add}>
        <Plus className="mr-1 h-4 w-4" /> Add education
      </Button>
    </Section>
  );
}

function ExperienceStep({ data, update }: StepProps) {
  const enhance = useServerFn(enhanceExperience);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, { missing: string[]; check: string }>>({});

  const set = (id: string, patch: Partial<ResumeData["experience"][number]>) =>
    update({ experience: data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  async function run(id: string) {
    const e = data.experience.find((x) => x.id === id);
    if (!e) return;
    setBusyId(id);
    try {
      const res = await enhance({
        data: { role: e.role, company: e.company, raw: e.rawDescription, target: data.target.jobTitle, jobDescription: data.target.jobDescription },
      });
      set(id, { aiBullets: res.bullets, useAi: true });
      setNotes((n) => ({ ...n, [id]: { missing: res.missingInformation, check: res.fabricationCheck } }));
      toast.success("Bullets drafted — review and edit them before exporting.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not enhance this description.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Section
      title="Work experience"
      hint='Write plainly — e.g. "I helped customers and worked on computers." The AI rewrites it professionally without inventing numbers.'
    >
      {data.experience.map((e) => (
        <Card key={e.id} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Job title" value={e.role} onChange={(ev) => set(e.id, { role: ev.target.value })} placeholder="Retail Supervisor" />
            <Field label="Employer" value={e.company} onChange={(ev) => set(e.id, { company: ev.target.value })} placeholder="BrightMart" />
            <Field label="Location" value={e.location} onChange={(ev) => set(e.id, { location: ev.target.value })} placeholder="Soweto" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" value={e.startDate} onChange={(ev) => set(e.id, { startDate: ev.target.value })} placeholder="2022-03" />
              <Field label="End" value={e.endDate} onChange={(ev) => set(e.id, { endDate: ev.target.value })} placeholder="Present" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Your own description</Label>
            <Textarea rows={3} value={e.rawDescription} onChange={(ev) => set(e.id, { rawDescription: ev.target.value })} placeholder="What did you actually do? Include any real numbers you remember." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" disabled={busyId === e.id || e.rawDescription.trim().length < 5} onClick={() => run(e.id)}>
              {busyId === e.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
              Improve with AI
            </Button>
            {e.aiBullets.length > 0 && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={e.useAi} onChange={(ev) => set(e.id, { useAi: ev.target.checked })} />
                Use AI bullets in the resume
              </label>
            )}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => update({ experience: data.experience.filter((x) => x.id !== e.id) })}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
            </Button>
          </div>
          {e.aiBullets.length > 0 && (
            <div className="space-y-2 rounded-md bg-ai-soft p-3">
              <AiBadge />
              {e.aiBullets.map((b, i) => (
                <Textarea
                  key={i}
                  rows={2}
                  value={b}
                  onChange={(ev) => set(e.id, { aiBullets: e.aiBullets.map((x, j) => (j === i ? ev.target.value : x)) })}
                  className="bg-card"
                />
              ))}
              {notes[e.id]?.check && <p className="text-[11px] text-muted-foreground">Fabrication check: {notes[e.id].check}</p>}
              {!!notes[e.id]?.missing.length && (
                <p className="text-[11px] text-muted-foreground">
                  <AlertTriangle className="mr-1 inline h-3 w-3 text-warning" />
                  Missing detail that would strengthen this: {notes[e.id].missing.join("; ")}
                </p>
              )}
            </div>
          )}
        </Card>
      ))}
      <Button
        variant="outline"
        onClick={() =>
          update({
            experience: [
              ...data.experience,
              { id: uid(), role: "", company: "", location: "", startDate: "", endDate: "", rawDescription: "", aiBullets: [], useAi: false },
            ],
          })
        }
      >
        <Plus className="mr-1 h-4 w-4" /> Add experience
      </Button>
    </Section>
  );
}

function TagList({ items, onRemove }: { items: string[]; onRemove: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-1 text-xs">
          {s}
          <button onClick={() => onRemove(s)} aria-label={`Remove ${s}`} className="text-muted-foreground hover:text-destructive">
            ×
          </button>
        </span>
      ))}
      {!items.length && <span className="text-xs text-muted-foreground">None yet.</span>}
    </div>
  );
}

function SkillsStep({ data, update, context }: StepProps & { context: string }) {
  const gen = useServerFn(generateSkills);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<SkillsResult | null>(null);
  const [tech, setTech] = useState("");
  const [soft, setSoft] = useState("");

  const addSkill = (kind: "technical" | "soft", value: string) => {
    const v = value.trim();
    if (!v || data.skills[kind].includes(v)) return;
    update({ skills: { ...data.skills, [kind]: [...data.skills[kind], v] } });
  };
  const removeSkill = (kind: "technical" | "soft", value: string) =>
    update({ skills: { ...data.skills, [kind]: data.skills[kind].filter((s) => s !== value) } });

  async function run() {
    setBusy(true);
    try {
      const r = await gen({ data: { context, target: data.target.jobTitle, jobDescription: data.target.jobDescription } });
      setRes(r);
      toast.success("Skills analysed. Verified skills are evidence-backed; potential skills are gaps, not claims.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Skills analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Skills" hint="AI only recommends skills it can trace to your education, experience, projects or certifications.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Technical skills</Label>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addSkill("technical", tech);
              setTech("");
            }}
          >
            <Input value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Python" />
            <Button type="submit" variant="outline" size="icon" aria-label="Add technical skill">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <TagList items={data.skills.technical} onRemove={(s) => removeSkill("technical", s)} />
        </div>
        <div className="space-y-2">
          <Label>Soft skills</Label>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addSkill("soft", soft);
              setSoft("");
            }}
          >
            <Input value={soft} onChange={(e) => setSoft(e.target.value)} placeholder="Communication" />
            <Button type="submit" variant="outline" size="icon" aria-label="Add soft skill">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <TagList items={data.skills.soft} onRemove={(s) => removeSkill("soft", s)} />
        </div>
      </div>

      <Button variant="secondary" disabled={busy} onClick={run}>
        {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
        Analyse my skills with AI
      </Button>

      {res && (
        <div className="space-y-4">
          <Card className="space-y-3 bg-ai-soft">
            <div className="flex items-center gap-2">
              <AiBadge />
              <p className="text-sm font-semibold">Verified skills (evidence found in your input)</p>
            </div>
            {[...res.verified.technical.map((v) => ({ ...v, kind: "technical" as const })), ...res.verified.soft.map((v) => ({ ...v, kind: "soft" as const }))].map(
              (v) => (
                <div key={v.kind + v.skill} className="flex items-start justify-between gap-3 rounded-md bg-card p-2.5">
                  <div>
                    <p className="text-sm font-medium">{v.skill}</p>
                    <p className="text-[11px] text-muted-foreground">Evidence: {v.evidence}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addSkill(v.kind, v.skill)}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              ),
            )}
          </Card>
          <Card className="space-y-2 border-warning/40 bg-warning/10">
            <p className="text-sm font-semibold">Potential skills to develop — not claims about you</p>
            <p className="text-xs text-muted-foreground">
              These appear in your target job but have no evidence in your resume. Only add one after you can genuinely demonstrate it.
            </p>
            <TagList items={[...res.potential.technical, ...res.potential.soft]} onRemove={() => undefined} />
          </Card>
          {!!res.missingInformation.length && (
            <p className="text-xs text-muted-foreground">Missing information: {res.missingInformation.join("; ")}</p>
          )}
        </div>
      )}
    </Section>
  );
}

function SimpleListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: ResumeData["certifications"];
  onChange: (v: ResumeData["certifications"]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {items.map((i) => (
        <div key={i.id} className="flex gap-2">
          <Input value={i.text} onChange={(e) => onChange(items.map((x) => (x.id === i.id ? { ...x, text: e.target.value } : x)))} placeholder={placeholder} />
          <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((x) => x.id !== i.id))} aria-label={`Remove ${label}`}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { id: uid(), text: "" }])}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add
      </Button>
    </div>
  );
}

function ExtrasStep({ data, update }: StepProps) {
  const set = (id: string, patch: Partial<ResumeData["projects"][number]>) =>
    update({ projects: data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  return (
    <Section title="Projects, certifications, achievements & volunteering" hint="Especially important if you have limited paid experience.">
      <div className="space-y-3">
        <Label>Projects</Label>
        {data.projects.map((p) => (
          <Card key={p.id} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Project name" value={p.name} onChange={(e) => set(p.id, { name: e.target.value })} placeholder="Customer Churn Dashboard" />
              <Field label="Tools used" value={p.tech} onChange={(e) => set(p.id, { tech: e.target.value })} placeholder="Python, Power BI" />
            </div>
            <Textarea rows={2} value={p.description} onChange={(e) => set(p.id, { description: e.target.value })} placeholder="What did you build and what did it show?" />
            <Button variant="ghost" size="sm" onClick={() => update({ projects: data.projects.filter((x) => x.id !== p.id) })}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
            </Button>
          </Card>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ projects: [...data.projects, { id: uid(), name: "", tech: "", description: "" }] })}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add project
        </Button>
      </div>
      <SimpleListEditor label="Certifications" items={data.certifications} onChange={(v) => update({ certifications: v })} placeholder="Google Data Analytics Certificate (2024)" />
      <SimpleListEditor label="Achievements" items={data.achievements} onChange={(v) => update({ achievements: v })} placeholder="Dean's list 2023" />
      <SimpleListEditor label="Volunteer experience" items={data.volunteering} onChange={(v) => update({ volunteering: v })} placeholder="Weekend coding tutor, youth centre" />
    </Section>
  );
}

function TargetStep({ data, update }: StepProps) {
  const t = data.target;
  return (
    <Section title="Target job" hint="Everything the AI writes is prioritised against this target. Paste the real advert for the best results.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target job title" value={t.jobTitle} onChange={(e) => update({ target: { ...t, jobTitle: e.target.value } })} placeholder="Data Analyst" />
        <Field label="Target industry" value={t.industry} onChange={(e) => update({ target: { ...t, industry: e.target.value } })} placeholder="Fintech" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="jd">Job description</Label>
        <Textarea id="jd" rows={10} value={t.jobDescription} onChange={(e) => update({ target: { ...t, jobDescription: e.target.value } })} placeholder="Paste the full job advert here…" />
      </div>
    </Section>
  );
}

function AiStep({ data, update, context }: StepProps & { context: string }) {
  const gen = useServerFn(generateSummary);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<SummaryResult | null>(null);

  async function run() {
    setBusy(true);
    try {
      const r = await gen({ data: { context, target: data.target.jobTitle, jobDescription: data.target.jobDescription } });
      setRes(r);
      toast.success("Three summary options drafted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Summary generation failed.");
    } finally {
      setBusy(false);
    }
  }

  const labels: Record<string, string> = {
    professional: "Professional",
    achievement: "Achievement-focused",
    transition: "Career-transition focused",
  };

  return (
    <Section title="AI professional summary" hint="Generate options, pick one, then edit it in your own voice. Nothing is added to your resume until you choose it.">
      <Button variant="secondary" disabled={busy} onClick={run}>
        {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
        Generate summary options
      </Button>

      {res && (
        <div className="space-y-3">
          {res.variants.map((v) => (
            <Card key={v.type} className="space-y-2 bg-ai-soft">
              <div className="flex items-center gap-2">
                <AiBadge />
                <p className="text-sm font-semibold">{labels[v.type] ?? v.type}</p>
              </div>
              <p className="text-sm">{v.text}</p>
              <Button
                size="sm"
                onClick={() => {
                  update({ summary: v.text, summaryFromAi: true });
                  toast.success("Added to your resume. Please review and edit it.");
                }}
              >
                <Check className="mr-1 h-3.5 w-3.5" /> Use this
              </Button>
            </Card>
          ))}
          {!!res.missingInformation.length && (
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 inline h-3 w-3 text-warning" />
              To strengthen your summary, add: {res.missingInformation.join("; ")}
            </p>
          )}
          {res.reviewNote && <p className="text-xs text-muted-foreground">{res.reviewNote}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="summary">
          Summary on your resume {data.summaryFromAi && <span className="text-[11px] text-ai">(started as an AI draft — edit freely)</span>}
        </Label>
        <Textarea id="summary" rows={4} value={data.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="Your professional summary…" />
      </div>
    </Section>
  );
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-accent">
        <span className="font-display text-lg font-bold">{value}</span>
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">Estimate only</p>
      </div>
    </div>
  );
}

function AtsStep({ data, plain }: { data: ResumeData; plain: string }) {
  const ats = useServerFn(analyzeAts);
  const match = useServerFn(analyzeJobMatch);
  const [busy, setBusy] = useState<"ats" | "match" | null>(null);
  const [atsRes, setAtsRes] = useState<AtsResult | null>(null);
  const [matchRes, setMatchRes] = useState<MatchResult | null>(null);

  async function runAts() {
    setBusy("ats");
    try {
      setAtsRes(await ats({ data: { resumeText: plain, jobDescription: data.target.jobDescription, target: data.target.jobTitle } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ATS analysis failed.");
    } finally {
      setBusy(null);
    }
  }
  async function runMatch() {
    setBusy("match");
    try {
      setMatchRes(await match({ data: { resumeText: plain, jobDescription: data.target.jobDescription, target: data.target.jobTitle } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Job match analysis failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Section title="ATS optimisation & job match" hint="Compares your resume against the job description you entered in the Target job step.">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={busy !== null} onClick={runAts}>
          {busy === "ats" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />} Run ATS analysis
        </Button>
        <Button variant="secondary" disabled={busy !== null} onClick={runMatch}>
          {busy === "match" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />} Run job match
        </Button>
      </div>

      {atsRes && (
        <Card className="space-y-4">
          <ScoreRing value={atsRes.score} label="ATS compatibility score" />
          <div className="space-y-2">
            {atsRes.breakdown.map((b) => (
              <div key={b.area}>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{b.area}</span>
                  <span className="text-muted-foreground">
                    {b.score}/{b.max}
                  </span>
                </div>
                <Progress value={(b.score / (b.max || 1)) * 100} className="h-1.5" />
                <p className="mt-1 text-[11px] text-muted-foreground">{b.comment}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-success">Matching keywords</p>
              <TagList items={atsRes.matchingKeywords} onRemove={() => undefined} />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-destructive">Missing keywords</p>
              <TagList items={atsRes.missingKeywords} onRemove={() => undefined} />
            </div>
          </div>
          {!!atsRes.sectionsNeedingWork.length && (
            <div className="space-y-2">
              <p className="text-xs font-semibold">Sections needing work</p>
              {atsRes.sectionsNeedingWork.map((s, i) => (
                <div key={i} className="rounded-md border p-2.5 text-xs">
                  <p className="font-medium">{s.section}</p>
                  <p className="text-muted-foreground">{s.issue}</p>
                  <p className="mt-1">Fix: {s.fix}</p>
                </div>
              ))}
            </div>
          )}
          {!!atsRes.recommendations.length && (
            <ul className="list-disc space-y-1 pl-5 text-xs">
              {atsRes.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          <p className="rounded-md border border-warning/40 bg-warning/10 p-2.5 text-[11px]">{atsRes.disclaimer}</p>
        </Card>
      )}

      {matchRes && (
        <Card className="space-y-4">
          <ScoreRing value={matchRes.matchScore} label="Job match score" />
          <p className="text-sm">{matchRes.verdict}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-success">Strong matches</p>
              {matchRes.strongMatches.map((s, i) => (
                <p key={i} className="text-xs">
                  <span className="font-medium">{s.item}</span> — {s.evidence}
                </p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-destructive">Gaps / weak areas</p>
              {matchRes.gaps.map((s, i) => (
                <p key={i} className="text-xs">
                  <span className="font-medium">{s.item}</span> — {s.why} <em>Action: {s.action}</em>
                </p>
              ))}
            </div>
          </div>
          {!!matchRes.transferableStrengths.length && (
            <div>
              <p className="mb-1 text-xs font-semibold">Transferable strengths</p>
              <TagList items={matchRes.transferableStrengths} onRemove={() => undefined} />
            </div>
          )}
          {!!matchRes.recommendations.length && (
            <ul className="list-disc space-y-1 pl-5 text-xs">
              {matchRes.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          <p className="rounded-md border border-warning/40 bg-warning/10 p-2.5 text-[11px]">
            Match scores describe alignment between your stated evidence and the advert. They are not a prediction or guarantee of an
            interview or job offer.
          </p>
        </Card>
      )}
    </Section>
  );
}

function ExportStep({ data, update, onExport }: StepProps & { onExport: () => void }) {
  return (
    <Section title="Template & export" hint="Switch templates freely — your information is never lost.">
      <div className="grid gap-3 sm:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => update({ template: t.id })}
            className={`rounded-lg border p-3 text-left transition-colors ${data.template === t.id ? "border-accent bg-accent/10" : "hover:bg-secondary"}`}
          >
            <p className="font-display text-sm font-semibold">{t.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.blurb}</p>
          </button>
        ))}
      </div>
      <Card className="space-y-2">
        <p className="text-sm font-semibold">Before you export</p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>Read every AI-generated line and confirm it is factually true for you.</li>
          <li>Check dates, employer names, qualifications and certifications.</li>
          <li>Remove any "potential skill" you cannot demonstrate in an interview.</li>
        </ul>
        <Button onClick={onExport}>
          <Download className="mr-1 h-4 w-4" /> Export resume
        </Button>
        <p className="text-[11px] text-muted-foreground">PDF via your browser's "Save as PDF", plus a plain-text version for ATS upload forms.</p>
      </Card>
    </Section>
  );
}
