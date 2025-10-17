import { createClient } from "@supabase/supabase-js";

type SupabaseBrowserClientOptions = {
  schema?: string;
};

export function createSupabaseBrowserClient({
  schema = "public"
}: SupabaseBrowserClientOptions = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    db: {
      schema
    }
  });
}
