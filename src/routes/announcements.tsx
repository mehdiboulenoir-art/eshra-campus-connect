import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pin } from "lucide-react";
import { announcements } from "@/lib/data";
import { PageHeader, card, chip } from "@/components/AppShell";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Annonces — BDE ESHRA" },
      { name: "description", content: "Les annonces officielles du BDE et de l'administration ESHRA." },
      { property: "og:title", content: "Annonces — BDE ESHRA" },
      { property: "og:description", content: "Restez informé des actualités du campus ESHRA." },
    ],
  }),
  component: Page,
});

const tags = ["Tout", "Carrière", "Campus", "BDE", "Académique"];

function Page() {
  const [tag, setTag] = useState("Tout");
  const list = announcements.filter((a) => tag === "Tout" || a.tag === tag);
  return (
    <>
      <PageHeader eyebrow="Actualités" title="Annonces" />
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {tags.map((t) => (
          <Button variant="ghost" key={t} onClick={() => setTag(t)} className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${tag === t ? "border-brand bg-brand-soft text-brand" : "text-muted-foreground hover:bg-accent"}`}>{t}</Button>
        ))}
      </div>
      <div className="space-y-4">
        {list.map((a) => (
          <article key={a.id} className={`${card} ${a.pinned ? "border-brand/40" : ""}`}>
            <div className="flex items-center gap-2">
              <span className={chip}>{a.tag}</span>
              {a.pinned && <span className="flex items-center gap-1 text-xs text-brand"><Pin className="h-3 w-3" /> Épinglé</span>}
              <span className="ml-auto text-xs text-muted-foreground">{a.date}</span>
            </div>
            <h2 className="mt-3 text-xl">{a.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
            <p className="mt-3 text-xs text-muted-foreground">— {a.author}</p>
          </article>
        ))}
      </div>
    </>
  );
}
