
import {
  Link,
  Outlet,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";

import {
  Home,
  Megaphone,
  CalendarDays,
  Users,
  BarChart3,
  Lightbulb,
  MessageCircle,
  User,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import logo from "@/assets/bde-eshra-logo.png.asset.json";
import { DemoPollProvider } from "@/lib/demo-polls";

const nav = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/announcements", label: "Annonces", icon: Megaphone },
  { to: "/events", label: "Événements", icon: CalendarDays },
  { to: "/clubs", label: "Clubs", icon: Users },
  { to: "/polls", label: "Sondages", icon: BarChart3 },
  { to: "/suggestions", label: "Suggestions", icon: Lightbulb },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

const mobileNav = [nav[0], nav[2], nav[3], nav[6], nav[7]];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src="/favicon.png"
        alt="Logo officiel du BDE ESHRA"
        className="h-14 w-14 shrink-0 object-contain"
      />

      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold">
          BDE ESHRA
        </span>
        <span className="block text-[10px] uppercase tracking-[0.15em] opacity-75">
          Vie étudiante
        </span>
      </span>
    </Link>
  );
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  const path = useRouterState({
    select: (state) => state.location.pathname,
  });

  const current = nav.find((item) => item.to === path);

  const loadUnreadCount = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { data: memberships, error } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (error || !memberships) {
      console.error("Could not load unread messages:", error?.message);
      return;
    }

    let total = 0;

    for (const membership of memberships) {
      let query = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", membership.conversation_id)
        .neq("sender_id", user.id);

      if (membership.last_read_at) {
        query = query.gt("created_at", membership.last_read_at);
      }

      const { count, error: countError } = await query;

      if (!countError) {
        total += count ?? 0;
      }
    }

    setUnreadCount(total);
  }, []);

  useEffect(() => {
    void loadUnreadCount();

    const channel = supabase
      .channel("app-unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          void loadUnreadCount();
        }
      )
      .subscribe();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUnreadCount();
    });

    return () => {
      void supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [loadUnreadCount]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      setLoggingOut(false);
      return;
    }

    await navigate({ to: "/login", replace: true });
  }

  function NotificationBadge() {
    if (unreadCount === 0) return null;

    return (
      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  }

  return (
    <div className="min-h-screen md:flex">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-primary text-primary-foreground md:flex ${
          collapsed ? "w-20 p-3" : "w-64 p-5"
        }`}
      >
        {collapsed ? (
          <Link to="/" aria-label="BDE ESHRA — Accueil">
            <img
              src={logo.url}
              alt="BDE ESHRA"
              className="h-14 w-14 object-contain"
            />
          </Link>
        ) : (
          <Logo />
        )}

        <nav
          aria-label="Navigation principale"
          className="mt-9 flex flex-col gap-1.5"
        >
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              title={collapsed ? label : undefined}
              aria-label={label}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
              activeProps={{
                className: "!bg-primary-foreground !text-primary font-semibold",
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />

              {!collapsed && <span>{label}</span>}

              {to === "/messages" && (
                <NotificationBadge />
              )}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <div className="mt-auto space-y-3 border-t border-primary-foreground/20 pt-5">
            <p className="text-xs leading-relaxed text-primary-foreground/75">
              École Supérieure d'Hôtellerie et de Restauration d'Alger
            </p>

            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full justify-start gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Déconnexion..." : "Déconnexion"}
            </Button>
          </div>
        )}

        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Déconnexion"
            title="Déconnexion"
            className="mt-auto text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 hidden h-20 items-center justify-between border-b bg-card px-8 md:flex">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                collapsed ? "Développer le menu" : "Réduire le menu"
              }
              title={collapsed ? "Développer le menu" : "Réduire le menu"}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>

            <span className="text-sm text-muted-foreground">
              Campus
              <span className="mx-2 text-border">/</span>
              <span className="font-semibold text-foreground">
                {current?.label}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/messages"
              aria-label={`Messages, ${unreadCount} unread`}
              className="relative rounded-full p-2 text-muted-foreground hover:bg-accent"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              aria-label="Mon profil"
              className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand"
            >
              YB
            </Link>
          </div>
        </header>

        <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-primary px-4 py-3 text-primary-foreground md:hidden">
          <Logo />

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="rounded-lg border border-primary-foreground/30 px-3 py-2 text-xs"
            >
              Admin
            </Link>

            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Déconnexion"
              title="Déconnexion"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
          <DemoPollProvider>
            <Outlet />
          </DemoPollProvider>
        </main>
      </div>

      <Toaster theme="light" position="top-center" />

      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card p-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {mobileNav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="relative flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] text-muted-foreground"
            activeProps={{
              className: "!text-brand bg-brand-soft",
            }}
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {to === "/messages" && unreadCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
          {eyebrow}
        </p>

        <h1 className="mt-1 text-3xl font-semibold md:text-4xl">
          {title}
        </h1>
      </div>

      {children}
    </div>
  );
}

export const card =
  "rounded-lg border bg-card p-5 shadow-card";

export const brandBtn =
  "inline-flex h-auto items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-deep";

export const ghostBtn =
  "inline-flex h-auto items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-accent";

export const chip =
  "inline-flex shrink-0 items-center rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand";
