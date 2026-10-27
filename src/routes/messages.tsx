import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { conversations, thread as initial } from "@/lib/data";
import { PageHeader, card } from "@/components/AppShell";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Messages — BDE ESHRA" },
      { name: "description", content: "Discutez avec vos camarades et vos clubs à l'ESHRA." },
      { property: "og:title", content: "Messages — BDE ESHRA" },
      { property: "og:description", content: "La messagerie de la communauté ESHRA." },
    ],
  }),
  component: Page,
});

function Page() {
  const [active, setActive] = useState<number | null>(null);
  const [msgs, setMsgs] = useState(initial);
  const [text, setText] = useState("");
  const conv = conversations.find((c) => c.id === active) ?? conversations[0];
  if (!conv) return null;
  const send = () => {
    if (!text.trim()) return;
    setMsgs([...msgs, { from: "me", text: text.trim(), time: "Maintenant" }]);
    setText("");
  };
  return (
    <>
      <PageHeader eyebrow="Discussions" title="Messages" />
      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <div className={`${card} p-2 ${active !== null ? "hidden md:block" : ""}`}>
          {conversations.map((c) => (
            <Button variant="ghost" key={c.id} onClick={() => setActive(c.id)} className={`flex h-auto w-full items-center gap-3 whitespace-normal rounded-lg p-3 text-left transition hover:bg-accent ${conv.id === c.id && active !== null ? "bg-accent" : ""}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{c.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="flex justify-between text-sm font-semibold"><span className="truncate">{c.name}</span><span className="text-xs font-normal text-muted-foreground">{c.time}</span></span>
                <span className="block truncate text-xs text-muted-foreground">{c.last}</span>
              </span>
              {c.unread > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{c.unread}</span>}
            </Button>
          ))}
        </div>
        <div className={`${card} flex h-[65vh] flex-col p-0 ${active === null ? "hidden md:flex" : ""}`}>
          <div className="flex items-center gap-3 border-b p-4">
            <Button variant="ghost" aria-label="Retour aux conversations" onClick={() => setActive(null)} className="md:hidden"><ArrowLeft className="h-5 w-5" /></Button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{conv.initials}</span>
            <p className="font-semibold">{conv.name}</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
                <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.text}<p className="mt-1 text-[10px] opacity-70">{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Écrire un message…" className="min-w-0 flex-1 rounded-lg border bg-input/30 px-4 text-sm outline-none focus:border-brand" />
            <Button variant="ghost" aria-label="Envoyer le message" onClick={send} className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </>
  );
}
