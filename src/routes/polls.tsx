import { PollCard } from "@/components/PollCard";
import { createFileRoute } from "@tanstack/react-router";
import { polls } from "@/lib/data";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/polls")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sondages — BDE ESHRA" },
      { name: "description", content: "Votez et donnez votre avis sur la vie étudiante à l'ESHRA." },
      { property: "og:title", content: "Sondages — BDE ESHRA" },
      { property: "og:description", content: "Votre voix compte : participez aux sondages du BDE." },
    ],
  }),
  component: Page,
});

function Page() {
  return <>
    <PageHeader eyebrow="Votre avis" title="Sondages" />
    <div className="space-y-4">{polls.map((poll) => <PollCard key={poll.id} poll={poll} />)}</div>
  </>;
}
