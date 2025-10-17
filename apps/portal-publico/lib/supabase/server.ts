import { createClient } from "@supabase/supabase-js";

type SupabaseServerClientOptions = {
  schema?: string;
};

export function createSupabaseServerClient({
  schema = "public"
}: SupabaseServerClientOptions = {}) {
  const url = process.env.SUPABASE_URL;
  // Use ANON key for public portal (more secure, read-only via RLS)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables. Please set SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema
    }
  });
}

