import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Megaphone, Users, Pin, Clock, MapPin } from "lucide-react";
import { announcements, events, me, polls, clubs } from "@/lib/data";
import { card, chip } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { PollCard } from "@/components/PollCard";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Accueil — BDE ESHRA" },
    { name: "description", content: "Les dernières annonces du BDE ESHRA, les événements à venir, vos clubs et les sondages étudiants." },
    { property: "og:title", content: "Accueil — BDE ESHRA" },
    { property: "og:description", content: "Annonces, agenda et clubs : retrouvez la vie du campus ESHRA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});

function SectionHeading({ title, icon, to, label }: { title: string; icon: ReactNode; to: "/announcements" | "/events" | "/clubs" | "/polls"; label: string }) {
  return <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
    <h2 className="flex min-w-0 items-center gap-2 text-xl">{icon}<span className="min-w-0">{title}</span></h2>
    <Button asChild variant="link" className="h-auto shrink-0 p-0 text-xs sm:text-sm"><Link to={to}>{label}<ArrowRight /></Link></Button>
  </div>;
}

function Index() {
  const joinedClubs = clubs.filter((club) => me.clubs.includes(club.name));
  return <div className="space-y-8">
    <section className="border-b pb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">La vie du campus</p>
      <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Bienvenue au BDE ESHRA</h1>
      <p className="mt-2 text-sm text-muted-foreground">Les nouvelles du bureau, les rendez-vous du campus et vos clubs.</p>
    </section>

    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section aria-label="Dernières annonces" className="min-w-0">
        <SectionHeading title="Dernières annonces" icon={<Megaphone className="h-5 w-5 shrink-0 text-brand" />} to="/announcements" label="Tout voir" />
        <div className="space-y-3">
          {announcements.slice(0, 3).map((announcement) => <article key={announcement.id} className={`${card} ${announcement.pinned ? "border-brand/30" : ""}`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><span className="min-w-0 text-xs text-muted-foreground">{announcement.author} · {announcement.date}</span><span className={chip}>{announcement.tag}</span></div>
            <h3 className="mt-3 text-lg">{announcement.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{announcement.body}</p>
            {announcement.pinned && <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand"><Pin className="h-3 w-3" /> Épinglé</span>}
          </article>)}
        </div>
      </section>
      <section aria-label="Événements à venir" className="min-w-0">
        <SectionHeading title="Événements à venir" icon={<CalendarDays className="h-5 w-5 shrink-0 text-brand" />} to="/events" label="L’agenda" />
        <div className="space-y-3">
          {events.slice(0, 3).map((event) => <article key={event.id} className={card}>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><span className="text-center"><span className="block font-display text-2xl font-semibold leading-none">{event.date}</span><span className="text-xs">{event.month}</span></span></div>
              <div className="min-w-0"><span className={chip}>{event.category}</span><h3 className="mt-2 text-lg">{event.title}</h3></div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" />{event.time}</p><p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0">{event.place}</span></p></div>
            <Button asChild className="mt-4 min-h-11 w-full hover:bg-brand-deep"><Link to="/events">Voir l’événement<ArrowRight /></Link></Button>
          </article>)}
        </div>
      </section>
    </div>

    <section aria-label="Mes clubs">
      <SectionHeading title="Mes clubs" icon={<Users className="h-5 w-5 shrink-0 text-brand" />} to="/clubs" label="Explorer" />
      <div className="grid gap-4 lg:grid-cols-2">
        {joinedClubs.map((club) => <article key={club.id} className={`${card} flex min-w-0 flex-col`}>
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-soft text-2xl" aria-hidden="true">{club.emoji}</span><h3 className="min-w-0 text-lg">{club.name}</h3><span className={chip}>Membre démo</span></div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{club.desc}</p>
          <Button asChild variant="outline" className="mt-4 min-h-11 self-start border-brand/25 text-brand"><Link to="/clubs">Retrouver mon club<ArrowRight /></Link></Button>
        </article>)}
      </div>
    </section>

    <div className="grid items-start gap-8 xl:grid-cols-2">
      <section aria-label="Prochaines activités" className="min-w-0">
        <SectionHeading title="Prochaines activités" icon={<CalendarDays className="h-5 w-5 shrink-0 text-brand" />} to="/events" label="Tout voir" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {events.slice(3).map((activity) => <article key={activity.id} className={card}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><span className="min-w-0 text-xs font-semibold text-brand">{activity.date} {activity.month} · {activity.time}</span><span className={chip}>{activity.category}</span></div>
            <h3 className="mt-3 text-lg">{activity.title}</h3><p className="mt-2 text-sm text-muted-foreground">{activity.place}</p>
            <Button asChild variant="link" className="mt-3 h-auto p-0"><Link to="/events">Voir l’activité<ArrowRight /></Link></Button>
          </article>)}
        </div>
      </section>
      <section aria-label="Sondage du moment" className="min-w-0">
        <SectionHeading title="Sondage du moment" icon={<Users className="h-5 w-5 shrink-0 text-brand" />} to="/polls" label="Tous les sondages" />
        {polls[0] && <PollCard poll={polls[0]} />}
      </section>
    </div>
  </div>;
}
