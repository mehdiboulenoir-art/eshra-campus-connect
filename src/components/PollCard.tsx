import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pollResults, useDemoPolls } from "@/lib/demo-polls";
import type { polls } from "@/lib/data";

export function PollCard({ poll }: { poll: (typeof polls)[number] }) {
  const { votes, vote } = useDemoPolls();
  const selected = votes[poll.id];
  const results = pollResults(poll.options, selected);
  return <article className="rounded-lg border bg-card p-5 shadow-card">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground">
      <span className="min-w-0">Clôture démo : {poll.ends}</span><span>{results.total} votes démo</span>
    </div>
    <h3 className="mt-3 text-xl">{poll.question}</h3>
    <div className="mt-4 space-y-2">
      {poll.options.map((option, index) => <Button key={option.label} variant="outline" disabled={selected !== undefined}
        aria-pressed={selected === index} onClick={() => vote(poll.id, index, poll.options.length)}
        className={`relative min-h-12 h-auto w-full justify-start overflow-hidden whitespace-normal px-4 py-3 text-left disabled:opacity-100 ${selected === index ? "border-brand" : ""}`}>
        {selected !== undefined && <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-brand-soft" style={{ width: `${results.percentages[index]}%` }} />}
        <span className="relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><span className="min-w-0">{option.label}</span>
          {selected !== undefined && <span className="flex shrink-0 items-center gap-2 text-brand">{selected === index && <Check aria-label="Votre choix" />}{results.percentages[index]}%</span>}
        </span>
      </Button>)}
    </div>
    <p role="status" className="mt-3 min-h-5 text-xs text-muted-foreground">{selected !== undefined ? "Vote de démonstration pris en compte — non enregistré." : "Sondage de démonstration · aucun vote réel enregistré."}</p>
  </article>;
}