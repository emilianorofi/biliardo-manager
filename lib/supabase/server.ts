import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function createClient() {
  const { url, publishableKey } =
    getSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              cookieStore.set(name, value, options);
            }
          );
        } catch {
          // I Server Component non possono scrivere cookie.
          // Il Proxy aggiorna comunque la sessione nel browser.
        }
      },
    },
  });
}
