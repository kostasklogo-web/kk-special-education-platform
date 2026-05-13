/**
 * FK embed `roles(code)` from PostgREST may be returned as an object or a
 * single-element array depending on typing / schema. Normalize for safe reads.
 */
export function embedSingleWithCode(embedded: unknown): { code: string } | null {
  if (embedded == null) return null;
  if (Array.isArray(embedded)) {
    const first = embedded[0];
    if (first && typeof first === "object" && first !== null && "code" in first) {
      const code = (first as { code: unknown }).code;
      if (typeof code === "string") return { code };
    }
    return null;
  }
  if (typeof embedded === "object" && embedded !== null && "code" in embedded) {
    const code = (embedded as { code: unknown }).code;
    if (typeof code === "string") return { code };
  }
  return null;
}
