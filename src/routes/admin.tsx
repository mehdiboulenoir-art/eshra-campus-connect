import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminStats, announcements, events, suggestions } from "@/lib/data";
import { PageHeader, card, chip, brandBtn } from "@/components/AppShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Administration — BDE ESHRA" },
      { name: "description", content: "Tableau de bord d'administration du BDE ESHRA." },
      { property: "og:title", content: "Administration — BDE ESHRA" },
      { property: "og:description", content: "Gérez annonces, événements et suggestions." },
    ],
  }),
  component: Page,
});

const tabs = ["Annonces", "Événements", "Suggestions"] as const;
const bars = [42, 58, 51, 74, 66, 88, 79];

function Page() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Annonces");
  const [ann, setAnn] = useState(announcements);
  const rows = tab === "Annonces" ? ann.map((a) => ({ id: a.id, title: a.title, meta: a.date, tag: a.tag }))
    : tab === "Événements" ? events.map((e) => ({ id: e.id, title: e.title, meta: `${e.date} ${e.month}`, tag: `${e.going}/${e.capacity}` }))
    : suggestions.map((s) => ({ id: s.id, title: s.title, meta: `${s.votes} votes`, tag: s.status }));
  return (
    <>
      <PageHeader eyebrow="Espace bureau" title="Administration">
        <Button variant="ghost" onClick={() => toast("Formulaire de création bientôt disponible")} className={brandBtn}><Plus className="h-4 w-4" /> Nouveau</Button>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {adminStats.map((s) => (
          <div key={s.label} className={card}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-brand">{s.delta}</p>
          </div>
        ))}
      </div>
      <div className={`${card} mt-4`}>
        <h2 className="text-xl">Activité de la semaine</h2>
        <div className="mt-5 flex h-40 items-end gap-3">
          {bars.map((b, i) => (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="w-full rounded-t-lg bg-primary" style={{ height: `${b}%` }} />
              <span className="text-[10px] text-muted-foreground">{["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${card} mt-4`}>
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => <Button variant="ghost" key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm ${tab === t ? "bg-brand-soft text-brand" : "text-muted-foreground"}`}>{t}</Button>)}
        </div>
        <ul className="mt-4 divide-y">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.meta}</p></div>
              <span className={chip}>{r.tag}</span>
              {tab === "Annonces" && <Button variant="ghost" aria-label="Supprimer" onClick={() => { setAnn(ann.filter((a) => a.id !== r.id)); toast.success("Annonce supprimée"); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
