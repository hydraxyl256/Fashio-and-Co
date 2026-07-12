/**
 * Slug helpers for admin product/collection/category forms.
 *
 * `slugify` is intentionally conservative: lowercase ASCII letters,
 * digits, and dashes only. Names that are purely non-Latin fall back
 * to a random suffix.
 */
export function slugify(input: string): string {
  const cleaned = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining marks
    .toLowerCase()
    .replace(/['"`’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  if (cleaned.length > 0) return cleaned;
  // Fallback for non-Latin input — keep a short random hash so we still
  // produce a unique-looking slug.
  return `item-${Math.random().toString(36).slice(2, 8)}`;
}

export type SlugCollision = { desired: string; reserved: string };

/**
 * Given a desired slug and a set of existing slugs (case-insensitive),
 * return the next free slug. Returns the desired slug itself if it is
 * available.
 */
export function nextAvailableSlug(desired: string, existing: readonly string[]): string {
  const taken = new Set(existing.map((s) => s.toLowerCase()));
  if (!taken.has(desired.toLowerCase())) return desired;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${desired}-${n}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  // Defensive — vanishingly unlikely.
  return `${desired}-${Date.now()}`;
}
