import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function noStoreFetch(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  return fetch(input, {
    ...init,
    cache: "no-store",
  });
}

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: noStoreFetch,
      },
    });
  }

  return supabaseClient;
}

export function getSupabaseServerClientForToken(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: noStoreFetch,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
