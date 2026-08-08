export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function readSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return {
    url,
    publishableKey,
  };
}

export function getSupabasePublicConfig() {
  const config = readSupabasePublicConfig();

  if (!config) {
    throw new Error(
      "Supabase Auth non è configurato. Aggiungi NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return config;
}
