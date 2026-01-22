import { apiGet } from "./http";

export type EntrySearchItem = {
  id: string;
  type: string;
  title: string;
  content?: string | null;
  occurredAt?: string | null;
};

export function getEntries(q?: string) {
  const qs = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiGet<EntrySearchItem[]>(`/api/entries${qs}`);
}
