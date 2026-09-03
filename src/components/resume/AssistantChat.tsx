import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How can I improve my resume?",
  "What skills should I highlight for this position?",
  "Rewrite my professional summary.",
  "How can I make my resume more ATS-friendly?",
];

export function AssistantChat({ context }: { context: string }) {
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your resume assistant. I can see the resume you're building in this session. Ask me to review a section, rewrite wording, or explain ATS behaviour. Always review my suggestions before using them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setError("");
    const history = messages.filter((m, i) => i > 0).slice(-12);
    setMessages((m) => [...m, { role: "user", content: message }]);
    setBusy(true);
    try {
      const res = await ask({ data: { context, history, message } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[520px] flex-col rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Sparkles className="h-4 w-4 text-ai" />
        <p className="font-display text-sm font-semibold">Career assistant</p>
        <span className="ml-auto text-[11px] text-muted-foreground">Session context: this resume</span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "max-w-[90%] rounded-lg bg-ai-soft px-3 py-2 text-sm whitespace-pre-wrap"
            }
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </p>
        )}
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      </div>
      <div className="border-t p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your resume…" aria-label="Message the assistant" />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
