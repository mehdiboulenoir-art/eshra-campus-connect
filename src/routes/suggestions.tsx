import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronUp, Send } from "lucide-react";
import { toast } from "sonner";
import { suggestions as initial } from "@/lib/data";
import { PageHeader, card, chip, brandBtn } from "@/components/AppShell";

export const Route = createFileRoute("/suggestions")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Boîte à idées — BDE ESHRA" },
      { name: "description", content: "Proposez vos idées pour améliorer la vie au campus ESHRA." },
      { property: "og:title", content: "Boîte à idées — BDE ESHRA" },
      { property: "og:description", content: "Partagez et soutenez les idées des étudiants." },
    ],
  }),
  component: Page,
});

function Page() {
  const [list, setList] = useState(initial);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(true);
  const [up, setUp] = useState<number[]>([]);
  const submit = () => {
    if (!text.trim()) return;
    setList([{ id: Date.now(), title: text.trim(), author: anon ? "Anonyme" : "Yasmine B.", votes: 1, status: "Nouveau" }, ...list]);
    setText("");
    toast.success("Merci ! Votre suggestion a été envoyée au BDE.");
  };
  return (
    <>
      <PageHeader eyebrow="Boîte à idées" title="Suggestions" />
      <div className={`${card} mb-5`}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={200} rows={3} placeholder="Votre idée pour améliorer le campus…" className="w-full resize-none rounded-lg border bg-input/30 p-3 text-sm outline-none focus:border-brand" />
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="accent-[var(--brand)]" /> Anonyme</label>
          <Button variant="ghost" onClick={submit} className={brandBtn}><Send className="h-4 w-4" /> Envoyer</Button>
        </div>
      </div>
      <div className="space-y-3">
        {[...list].sort((a, b) => b.votes - a.votes).map((s) => {
          const on = up.includes(s.id);
          return (
            <div key={s.id} className={`${card} flex flex-wrap items-center gap-3`}>
              <Button variant="ghost" aria-label="Soutenir cette suggestion" onClick={() => { setUp(on ? up.filter((x) => x !== s.id) : [...up, s.id]); setList(list.map((x) => x.id === s.id ? { ...x, votes: x.votes + (on ? -1 : 1) } : x)); }}
                className={`flex h-14 w-12 shrink-0 flex-col gap-0 px-0 items-center justify-center rounded-lg border ${on ? "border-brand bg-brand-soft text-brand" : ""}`}>
                <ChevronUp className="h-4 w-4" /><span className="text-sm font-bold">{s.votes}</span>
              </Button>
              <div className="min-w-0 flex-1 basis-36"><p className="font-medium">{s.title}</p><p className="text-xs text-muted-foreground">par {s.author}</p></div>
              <span className={chip}>{s.status}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
