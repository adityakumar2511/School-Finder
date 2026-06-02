export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const DEFAULT_SCHOOL_PAGE_LIMIT = 12;
export const DEFAULT_ADMIN_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 50;

export function parsePage(value: unknown, fallback = 1): number {
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseLimit(
  value: unknown,
  fallback: number,
  max = MAX_PAGE_LIMIT
): number {
  const parsed = parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(max, parsed);
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Standard paginated API envelope.
 * Includes legacy `alias` key when provided for backward compatibility.
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  alias?: string
) {
  const body: Record<string, unknown> = {
    data,
    pagination,
  };

  if (alias) {
    body[alias] = data;
  }

  return body;
}

export type CursorPaginationMeta = {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export function cursorPaginatedResponse<T>(
  data: T[],
  pagination: CursorPaginationMeta,
  alias?: string
) {
  const body: Record<string, unknown> = {
    data,
    pagination,
  };

  if (alias) {
    body[alias] = data;
  }

  return body;
}
