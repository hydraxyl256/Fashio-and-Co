/**
 * URL-driven pagination helpers. Used by every list page under /admin.
 */
export interface ParsedPage {
  page: number;
  pageSize: number;
}

export function parsePage(
  searchParams: { page?: string | null; pageSize?: string | null } | URLSearchParams,
  defaults: { pageSize?: number; maxPageSize?: number } = {},
): ParsedPage {
  const sp =
    searchParams instanceof URLSearchParams
      ? { page: searchParams.get('page'), pageSize: searchParams.get('pageSize') }
      : { page: searchParams.page, pageSize: searchParams.pageSize };

  const defaultSize = defaults.pageSize ?? 25;
  const maxSize = defaults.maxPageSize ?? 100;
  const rawSize = Number.parseInt(sp.pageSize ?? '', 10);
  const pageSize = Math.min(maxSize, Math.max(1, Number.isFinite(rawSize) ? rawSize : defaultSize));
  const rawPage = Number.parseInt(sp.page ?? '', 10);
  const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : 1);
  return { page, pageSize };
}

export interface PageSummary {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export function summarize(p: ParsedPage, total: number): PageSummary {
  const pageCount = Math.max(1, Math.ceil(total / p.pageSize));
  const page = Math.min(p.page, pageCount);
  return { ...p, total, pageCount };
}

export function buildHref(
  pathname: string,
  current: URLSearchParams,
  next: Record<string, string | number | null | undefined>,
): string {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(next)) {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
}
