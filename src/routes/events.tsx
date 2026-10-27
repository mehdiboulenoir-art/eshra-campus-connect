import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, Check } from "lucide-react";
import { toast } from "sonner";
import { events } from "@/lib/data";
import { PageHeader, card, chip, brandBtn, ghostBtn } from "@/components/AppShell";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Événements — BDE ESHRA" },
      { name: "description", content: "Soirées, concours, forums et sorties organisés par le BDE ESHRA." },
      { property: "og:title", content: "Événements — BDE ESHRA" },
      { property: "og:description", content: "Inscrivez-vous aux prochains événements de l'ESHRA." },
    ],
  }),
  component: Page,
});

function Page() {
  const [joined, setJoined] = useState<number[]>([1]);
  const toggle = (id: number) => {
    setJoined((j) => (j.includes(id) ? j.filter((x) => x !== id) : [...j, id]));
    toast.success(joined.includes(id) ? "Inscription annulée" : "Vous êtes inscrit !");
  };
  return (
    <>
      <PageHeader eyebrow="Agenda" title="Événements" />
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((e) => {
          const on = joined.includes(e.id);
          const pct = Math.round(((e.going + (on ? 1 : 0)) / e.capacity) * 100);
          return (
            <div key={e.id} className={card}>
              <div className="flex gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-brand/40 bg-brand-soft text-brand">
                  <div className="text-center leading-none"><p className="font-display text-2xl font-bold">{e.date}</p><p className="text-[10px] font-bold">{e.month}</p></div>
                </div>
                <div className="min-w-0">
                  <span className={chip}>{e.category}</span>
                  <h2 className="mt-1 text-lg">{e.title}</h2>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {e.time}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {e.place}</p>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
              <p className="mt-1 text-xs text-muted-foreground">{e.going + (on ? 1 : 0)} / {e.capacity} places</p>
              <Button variant="ghost" onClick={() => toggle(e.id)} className={`${on ? ghostBtn : brandBtn} mt-4 w-full`}>
                {on ? <><Check className="h-4 w-4 text-brand" /> Inscrit</> : "Je participe"}
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
