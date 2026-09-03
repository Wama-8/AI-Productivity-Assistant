// Application logic layer: typed RPC entry points for every AI feature.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAI, parseJson, GatewayError } from "./ai-gateway.server";
import {
  summaryPrompt,
  experiencePrompt,
  skillsPrompt,
  atsPrompt,
  jobMatchPrompt,
  masterPrompt,
  CHAT_SYSTEM_PROMPT,
} from "./prompts";

const ctxInput = z.object({
  context: z.string().min(1),
  target: z.string().default(""),
  jobDescription: z.string().default(""),
});

const clamp = (n: unknown, min = 0, max = 100) => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.max(min, Math.min(max, Math.round(v)));
};
const strArr = (v: unknown, max = 20): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, max) : [];

function wrap<T>(fn: () => Promise<T>) {
  return fn().catch((e: unknown) => {
    if (e instanceof GatewayError) throw new Error(e.message);
    throw e;
  });
}

export type SummaryResult = {
  variants: { type: string; text: string }[];
  missingInformation: string[];
  reviewNote: string;
};

export const generateSummary = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ctxInput.parse(d))
  .handler(async ({ data }): Promise<SummaryResult> =>
    wrap(async () => {
      const raw = await callAI({ prompt: summaryPrompt(data.context, data.target, data.jobDescription), json: true });
      const p = parseJson<SummaryResult>(raw);
      const variants = (Array.isArray(p.variants) ? p.variants : [])
        .filter((v) => v && typeof v.text === "string" && v.text.trim())
        .slice(0, 3)
        .map((v) => ({ type: String(v.type || "professional"), text: v.text.trim() }));
      if (!variants.length) throw new GatewayError(502, "The AI could not produce a summary. Add more detail and try again.");
      return { variants, missingInformation: strArr(p.missingInformation, 8), reviewNote: String(p.reviewNote || "") };
    }),
  );

export type ExperienceResult = {
  bullets: string[];
  verbsUsed: string[];
  missingInformation: string[];
  fabricationCheck: string;
};

export const enhanceExperience = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        role: z.string().default(""),
        company: z.string().default(""),
        raw: z.string().min(5, "Please describe the role in at least a few words."),
        target: z.string().default(""),
        jobDescription: z.string().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<ExperienceResult> =>
    wrap(async () => {
      const out = await callAI({
        prompt: experiencePrompt(data.role, data.company, data.raw, data.target, data.jobDescription),
        json: true,
      });
      const p = parseJson<ExperienceResult>(out);
      const bullets = strArr(p.bullets, 6);
      if (!bullets.length) throw new GatewayError(502, "The AI could not rewrite this description. Try adding more detail.");
      return {
        bullets,
        verbsUsed: strArr(p.verbsUsed, 10),
        missingInformation: strArr(p.missingInformation, 8),
        fabricationCheck: String(p.fabricationCheck || ""),
      };
    }),
  );

export type SkillsResult = {
  verified: { technical: { skill: string; evidence: string }[]; soft: { skill: string; evidence: string }[] };
  potential: { technical: string[]; soft: string[] };
  missingInformation: string[];
};

export const generateSkills = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ctxInput.parse(d))
  .handler(async ({ data }): Promise<SkillsResult> =>
    wrap(async () => {
      const out = await callAI({ prompt: skillsPrompt(data.context, data.target, data.jobDescription), json: true });
      const p = parseJson<SkillsResult>(out);
      const ev = (v: unknown) =>
        Array.isArray(v)
          ? v
              .filter((x) => x && typeof (x as { skill?: string }).skill === "string")
              .slice(0, 12)
              .map((x) => ({ skill: String((x as { skill: string }).skill), evidence: String((x as { evidence?: string }).evidence || "") }))
          : [];
      return {
        verified: { technical: ev(p.verified?.technical), soft: ev(p.verified?.soft) },
        potential: { technical: strArr(p.potential?.technical, 8), soft: strArr(p.potential?.soft, 8) },
        missingInformation: strArr(p.missingInformation, 8),
      };
    }),
  );

export type AtsResult = {
  score: number;
  breakdown: { area: string; score: number; max: number; comment: string }[];
  matchingKeywords: string[];
  missingKeywords: string[];
  sectionsNeedingWork: { section: string; issue: string; fix: string }[];
  recommendations: string[];
  disclaimer: string;
};

export const analyzeAts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ resumeText: z.string().min(20, "Add more resume content before running an ATS analysis."), jobDescription: z.string().default(""), target: z.string().default("") }).parse(d),
  )
  .handler(async ({ data }): Promise<AtsResult> =>
    wrap(async () => {
      const out = await callAI({ prompt: atsPrompt(data.resumeText, data.jobDescription, data.target), json: true });
      const p = parseJson<AtsResult>(out);
      return {
        score: clamp(p.score),
        breakdown: Array.isArray(p.breakdown)
          ? p.breakdown.slice(0, 6).map((b) => ({
              area: String(b?.area || ""),
              score: clamp(b?.score, 0, 100),
              max: clamp(b?.max, 1, 100) || 25,
              comment: String(b?.comment || ""),
            }))
          : [],
        matchingKeywords: strArr(p.matchingKeywords, 30),
        missingKeywords: strArr(p.missingKeywords, 30),
        sectionsNeedingWork: Array.isArray(p.sectionsNeedingWork)
          ? p.sectionsNeedingWork.slice(0, 8).map((s) => ({ section: String(s?.section || ""), issue: String(s?.issue || ""), fix: String(s?.fix || "") }))
          : [],
        recommendations: strArr(p.recommendations, 10),
        disclaimer:
          String(p.disclaimer || "") ||
          "This ATS score is an estimate only and does not guarantee that any specific employer's ATS will accept or rank this resume.",
      };
    }),
  );

export type MatchResult = {
  matchScore: number;
  verdict: string;
  strongMatches: { item: string; evidence: string }[];
  gaps: { item: string; why: string; action: string }[];
  transferableStrengths: string[];
  recommendations: string[];
};

export const analyzeJobMatch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        resumeText: z.string().min(20, "Add more resume content first."),
        jobDescription: z.string().min(20, "Paste the job description you want to match against."),
        target: z.string().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<MatchResult> =>
    wrap(async () => {
      const out = await callAI({ prompt: jobMatchPrompt(data.resumeText, data.jobDescription, data.target), json: true });
      const p = parseJson<MatchResult>(out);
      return {
        matchScore: clamp(p.matchScore),
        verdict: String(p.verdict || ""),
        strongMatches: Array.isArray(p.strongMatches)
          ? p.strongMatches.slice(0, 12).map((s) => ({ item: String(s?.item || ""), evidence: String(s?.evidence || "") }))
          : [],
        gaps: Array.isArray(p.gaps)
          ? p.gaps.slice(0, 12).map((s) => ({ item: String(s?.item || ""), why: String(s?.why || ""), action: String(s?.action || "") }))
          : [],
        transferableStrengths: strArr(p.transferableStrengths, 10),
        recommendations: strArr(p.recommendations, 10),
      };
    }),
  );

export type MasterResult = {
  professionalSummary: string;
  keySkills: string[];
  workExperience: { role: string; company: string; period: string; bullets: string[] }[];
  education: { qualification: string; institution: string; period: string; detail: string }[];
  projects: { name: string; detail: string }[];
  certifications: string[];
  achievements: string[];
  atsRecommendations: string[];
  missingInformation: string[];
  qualityCheck: string;
};

export const generateFullResume = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ctxInput.parse(d))
  .handler(async ({ data }): Promise<MasterResult> =>
    wrap(async () => {
      const out = await callAI({ prompt: masterPrompt(data.context, data.target, data.jobDescription), json: true });
      const p = parseJson<MasterResult>(out);
      return {
        professionalSummary: String(p.professionalSummary || ""),
        keySkills: strArr(p.keySkills, 20),
        workExperience: Array.isArray(p.workExperience)
          ? p.workExperience.slice(0, 8).map((w) => ({
              role: String(w?.role || ""),
              company: String(w?.company || ""),
              period: String(w?.period || ""),
              bullets: strArr(w?.bullets, 6),
            }))
          : [],
        education: Array.isArray(p.education)
          ? p.education.slice(0, 6).map((e) => ({
              qualification: String(e?.qualification || ""),
              institution: String(e?.institution || ""),
              period: String(e?.period || ""),
              detail: String(e?.detail || ""),
            }))
          : [],
        projects: Array.isArray(p.projects) ? p.projects.slice(0, 8).map((x) => ({ name: String(x?.name || ""), detail: String(x?.detail || "") })) : [],
        certifications: strArr(p.certifications, 10),
        achievements: strArr(p.achievements, 10),
        atsRecommendations: strArr(p.atsRecommendations, 10),
        missingInformation: strArr(p.missingInformation, 10),
        qualityCheck: String(p.qualityCheck || ""),
      };
    }),
  );

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        context: z.string().default(""),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .max(30)
          .default([]),
        message: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ reply: string }> =>
    wrap(async () => {
      const reply = await callAI({
        messages: [
          { role: "system", content: `${CHAT_SYSTEM_PROMPT}\n\nRESUME CONTEXT:\n${data.context || "(the user has not entered resume details yet)"}` },
          ...data.history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: data.message },
        ],
      });
      return { reply: reply.trim() || "I couldn't generate an answer. Please rephrase your question." };
    }),
  );
