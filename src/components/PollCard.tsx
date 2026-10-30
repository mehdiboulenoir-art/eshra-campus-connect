
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type PollOption = {
  id: number;
  label: string;
};

type Poll = {
  id: number;
  question: string;
  options: PollOption[];
  ends_at: string | null;
};

export function PollCard({ poll }: { poll: Poll }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVotes() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const { data, error } = await supabase
        .from("poll_votes")
        .select("option_id")
        .eq("poll_id", poll.id);

      if (cancelled) return;

      if (error) {
        setMessage("Impossible de charger les votes.");
      } else {
        const nextCounts: Record<number, number> = {};
        data?.forEach((vote) => {
          nextCounts[vote.option_id] = (nextCounts[vote.option_id] || 0) + 1;
        });
        setCounts(nextCounts);

        if (user) {
          const { data: ownVote } = await supabase
            .from("poll_votes")
            .select("option_id")
            .eq("poll_id", poll.id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (!cancelled && ownVote) setSelected(ownVote.option_id);
        }
      }

      if (!cancelled) setLoading(false);
    }

    void loadVotes();

    return () => {
      cancelled = true;
    };
  }, [poll.id]);

  async function handleVote(optionId: number) {
    setMessage("");
    setVoting(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMessage("Connectez-vous pour voter.");
      setVoting(false);
      return;
    }

    const { error } = await supabase.from("poll_votes").insert({
      poll_id: poll.id,
      option_id: optionId,
      user_id: user.id,
    });

    if (error) {
      setMessage(
        error.code === "23505"
          ? "Vous avez déjà voté pour ce sondage."
          : "Vote impossible. Réessayez."
      );
    } else {
      setSelected(optionId);
      setCounts((previous) => ({
        ...previous,
        [optionId]: (previous[optionId] || 0) + 1,
      }));
      setMessage("Votre vote a été enregistré.");
    }

    setVoting(false);
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <article className="rounded-lg border bg-card p-5 shadow-card">
      <div className="text-xs text-muted-foreground">
        {poll.ends_at
          ? `Clôture : ${new Date(poll.ends_at).toLocaleDateString("fr-FR")}`
          : "Sondage étudiant"}
        {" · "}
        {total} votes
      </div>

      <h3 className="mt-3 text-xl">{poll.question}</h3>

      <div className="mt-4 space-y-2">
        {poll.options.map((option) => {
          const count = counts[option.id] || 0;
          const percentage = total
            ? Math.round((count / total) * 100)
            : 0;

          return (
            <Button
              key={option.id}
              variant="outline"
              disabled={loading || voting || selected !== null}
              aria-pressed={selected === option.id}
              onClick={() => void handleVote(option.id)}
              className={`relative min-h-12 h-auto w-full justify-start overflow-hidden whitespace-normal px-4 py-3 text-left disabled:opacity-100 ${
                selected === option.id ? "border-brand" : ""
              }`}
            >
              {selected !== null && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-brand-soft"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <span className="relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="min-w-0">{option.label}</span>
                {selected !== null && (
                  <span className="flex shrink-0 items-center gap-2 text-brand">
                    {selected === option.id && <Check />}
                    {percentage}%
                  </span>
                )}
              </span>
            </Button>
          );
        })}
      </div>

      <p role="status" className="mt-3 min-h-5 text-xs text-muted-foreground">
        {loading ? "Chargement des votes…" : message}
      </p>
    </article>
  );
}
