export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function parsePaginatedResponse<T>(
  json: Record<string, unknown>,
  legacyKey: string
): { items: T[]; pagination: PaginationMeta } {
  const items = (json.data ?? json[legacyKey] ?? []) as T[];
  const pagination = (json.pagination ?? {
    page: 1,
    limit: items.length,
    total: items.length,
    totalPages: 1,
  }) as PaginationMeta;

  return { items, pagination };
}
