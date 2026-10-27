import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { clubs, me } from "@/lib/data";
import { PageHeader, card, brandBtn, ghostBtn } from "@/components/AppShell";

export const Route = createFileRoute("/clubs")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Clubs étudiants — BDE ESHRA" },
      { name: "description", content: "Découvrez et rejoignez les clubs étudiants de l'ESHRA." },
      { property: "og:title", content: "Clubs étudiants — BDE ESHRA" },
      { property: "og:description", content: "Gastronomie, sport, voyage, langues : trouvez votre club." },
    ],
  }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [mine, setMine] = useState<string[]>(me.clubs);
  const list = clubs.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="Communauté" title="Clubs étudiants" />
      <label className="mb-5 flex items-center gap-2 rounded-lg border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un club…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const on = mine.includes(c.name);
          return (
            <div key={c.id} className={`${card} flex flex-col`}>
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-soft text-3xl">{c.emoji}</div>
              <h2 className="mt-4 text-lg">{c.name}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <p className="mt-3 text-xs text-muted-foreground">{c.members + (on && !me.clubs.includes(c.name) ? 1 : 0)} membres · Resp. {c.lead}</p>
              <Button variant="ghost" onClick={() => setMine((m) => (on ? m.filter((x) => x !== c.name) : [...m, c.name]))} className={`${on ? ghostBtn : brandBtn} mt-4`}>
                {on ? "Membre ✓" : "Rejoindre"}
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
