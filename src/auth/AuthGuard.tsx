
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "../lib/supabaseClient";

export function AuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      setAuthenticated(!error && !!data.session);
      setChecking(false);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setAuthenticated(!!session);
      setChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (checking) return;

    const isAuthPage =
      pathname === "/login" || pathname === "/signup";

    if (!authenticated && !isAuthPage) {
      void navigate({ to: "/login", replace: true });
    } else if (authenticated && isAuthPage) {
      void navigate({ to: "/", replace: true });
    }
  }, [authenticated, checking, navigate, pathname]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking your session…
        </p>
      </main>
    );
  }

  const isAuthPage =
    pathname === "/login" || pathname === "/signup";

  if (!authenticated && !isAuthPage) {
    return null;
  }

  if (authenticated && isAuthPage) {
    return null;
  }

  return <>{children}</>;
}
