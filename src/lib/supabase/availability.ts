import "server-only";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function isSupabaseReachableQuickly(timeoutMs = 900): Promise<boolean> {
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${anonKey}`,
      },
      signal: controller.signal,
    });
    return response.ok || response.status === 401 || response.status === 404;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
