
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pin } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { PageHeader, card, chip } from "@/components/AppShell";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Annonces — BDE ESHRA" },
      {
        name: "description",
        content: "Les annonces officielles du BDE et de l'administration ESHRA.",
      },
    ],
  }),
  component: Page,
});

type Announcement = {
  id: string;
  title: string;
  content: string;
  tag: string;
  created_at: string;
};

function Page() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tag, setTag] = useState("Tout");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnnouncements() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, tag, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Impossible de charger les annonces. Réessayez plus tard.");
        console.error("Announcements error:", error);
      } else {
        setAnnouncements(data ?? []);
      }

      setLoading(false);
    }

    loadAnnouncements();
  }, []);

  const tags = [
    "Tout",
    ...Array.from(
      new Set(announcements.map((announcement) => announcement.tag).filter(Boolean))
    ),
  ];

  const list = announcements.filter(
    (announcement) => tag === "Tout" || announcement.tag === tag
  );

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(new Date(date));
  }

  return (
    <>
      <PageHeader eyebrow="Actualités" title="Annonces" />

      {announcements.length > 0 && (
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {tags.map((t) => (
            <Button
              variant="ghost"
              key={t}
              onClick={() => setTag(t)}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
                tag === t
                  ? "border-brand bg-brand-soft text-brand"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Chargement des annonces...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-500">{error}</p>
      ) : list.length === 0 ? (
        <div className={`${card} py-10 text-center`}>
          <h2 className="text-lg font-semibold">Aucune annonce pour le moment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Les nouvelles actualités du BDE ESHRA apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <article key={a.id} className={card}>
              <div className="flex items-center gap-2">
                {a.tag && <span className={chip}>{a.tag}</span>}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDate(a.created_at)}
                </span>
              </div>

              <h2 className="mt-3 text-xl">{a.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {a.content}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                — BDE ESHRA
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
