// Server-only Lovable AI Gateway client (chat completions path, non-OpenAI model).

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const MODEL = "google/gemini-3.7-flash";

export class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function friendly(status: number, message: string) {
  if (status === 429) return "The AI assistant is busy right now (rate limited). Please try again in a few seconds.";
  if (status === 402) return message || "AI credits are exhausted for this workspace. The app owner needs to add credits.";
  if (status === 403) return message || "AI access is blocked by workspace policy.";
  if (status === 401) return "AI is not configured correctly (missing or invalid API key).";
  return message || "The AI service returned an error. Please try again.";
}

export async function callAI(opts: {
  system?: string;
  prompt?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string }[];
  json?: boolean;
}): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new GatewayError(401, "Missing LOVABLE_API_KEY");

  const messages =
    opts.messages ??
    [
      ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
      { role: "user" as const, content: opts.prompt ?? "" },
    ];

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    let msg = "";
    try {
      const body = (await res.json()) as { error?: { message?: string }; message?: string };
      msg = body?.error?.message || body?.message || "";
    } catch {
      msg = await res.text().catch(() => "");
    }
    throw new GatewayError(res.status, friendly(res.status, msg));
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Validation layer: parse model JSON defensively (strip fences, locate the object). */
export function parseJson<T>(raw: string): T {
  let text = raw.trim();
  if (text.startsWith("```")) text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start > 0 || end < text.length - 1) text = text.slice(start, end + 1);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GatewayError(502, "The AI returned an unexpected format. Please try again.");
  }
}
