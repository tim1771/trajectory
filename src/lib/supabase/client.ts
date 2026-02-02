import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase credentials not set. Running in demo mode.");
    // Return a mock client for demo purposes
    return createBrowserClient<Database>(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient<Database>(url, key);
}
