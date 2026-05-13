import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/** Browser client: persists auth to cookies so Next.js middleware / RSC see the session. */
const { url, anonKey } = getSupabasePublicEnv();

export const supabase = createBrowserClient(url, anonKey);
