import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only: uses the service role key to bypass RLS for user upserts.
// Never import this from a client component.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return client;
}
