/**
 * Public Supabase config (Next.js inlines NEXT_PUBLIC_* at build time).
 * Trims values and strips trailing slashes from the project URL.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  return { url, anonKey };
}
