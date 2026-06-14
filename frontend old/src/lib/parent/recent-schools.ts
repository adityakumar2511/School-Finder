export const RECENT_SCHOOLS_KEY = "schoolfinder_recent_schools";
export const MAX_RECENT_SCHOOLS = 6;

export type RecentSchoolEntry = {
  slug: string;
  name: string;
  city: string;
  logoUrl: string | null;
  viewedAt: number;
};

export function readRecentSchools(): RecentSchoolEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SCHOOLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSchoolEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentSchool(entry: Omit<RecentSchoolEntry, "viewedAt">): void {
  if (typeof window === "undefined") return;
  const existing = readRecentSchools().filter((s) => s.slug !== entry.slug);
  const next: RecentSchoolEntry[] = [
    { ...entry, viewedAt: Date.now() },
    ...existing,
  ].slice(0, MAX_RECENT_SCHOOLS);
  localStorage.setItem(RECENT_SCHOOLS_KEY, JSON.stringify(next));
}
