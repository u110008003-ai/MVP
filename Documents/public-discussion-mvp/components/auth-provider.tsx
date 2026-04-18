"use client";

import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import type { ProfileRecord } from "@/lib/types";

type AuthContextValue = {
  session: Session | null;
  profile: ProfileRecord | null;
  loading: boolean;
  supabaseAvailable: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));

  const clearServerSession = useEffectEvent(async () => {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch {
      // Best-effort cleanup only.
    }
  });

  const loadProfileFromServer = useEffectEvent(async (accessToken: string) => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        setProfile(null);
        return;
      }

      const payload = (await response.json()) as { profile?: ProfileRecord | null };
      setProfile(payload.profile ?? null);
    } catch {
      setProfile(null);
    }
  });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const activeSession = data.session ?? null;
        setSession(activeSession);

        if (activeSession?.user) {
          await loadProfileFromServer(activeSession.access_token);
        } else {
          setProfile(null);
          await clearServerSession();
        }
      })
      .catch(() => {
        setSession(null);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (nextSession?.user) {
        void loadProfileFromServer(nextSession.access_token);
      } else {
        setProfile(null);
        void clearServerSession();
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        supabaseAvailable: Boolean(supabase),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
