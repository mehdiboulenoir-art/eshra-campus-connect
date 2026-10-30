
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PollCard } from "@/components/PollCard";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type PollOption = {
  id: number;
  label: string;
};

type Poll = {
  id: number;
  question: string;
  ends_at: string | null;
  options: PollOption[];
};

export const Route = createFileRoute("/polls")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sondages — BDE ESHRA" },
      {
        name: "description",
        content: "Votez et donnez votre avis sur la vie étudiante à l'ESHRA.",
      },
      { property: "og:title", content: "Sondages — BDE ESHRA" },
      {
        property: "og:description",
        content: "Votre voix compte : participez aux sondages du BDE.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPolls() {
      const { data, error } = await supabase
        .from("polls")
        .select("id, question, ends_at, poll_options(id, label)")
        .eq("is_active", true)
        .order("id");

      if (cancelled) return;

      if (error) {
        console.error("Error loading polls:", error);
        setError("Impossible de charger les sondages. Réessayez plus tard.");
      } else {
        const loadedPolls: Poll[] = (data ?? []).map((poll) => ({
          id: poll.id,
          question: poll.question,
          ends_at: poll.ends_at,
          options: poll.poll_options,
        }));

        setPolls(loadedPolls);
      }

      setLoading(false);
    }

    void loadPolls();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader eyebrow="Votre avis" title="Sondages" />

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement des sondages…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      ) : polls.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun sondage disponible pour le moment.
        </p>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </>
  );
}
