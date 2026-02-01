import { apiDelete, apiGet, apiPostJson, apiPutJson } from "./http";

export type EntryDto = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  occurredAt: string | null;
};

export type EntryCreateBinding = {
  entryId?: string;
  tagId?: string;
};

export type PersonEntryCreateBinding = {
  personId?: string;
  entryId?: string;
  role?: string;
};

export type MediaEntryCreateBinding = {
  mediaId?: string;
  entryId?: string;
  caption?: string;
  sortOrder?: number;
};

export type EntryCreate = {
  type: string;
  title?: string | null;
  content: string;
  occurredAt?: string | null;
  entryTags?: EntryCreateBinding[];
  personEntries?: PersonEntryCreateBinding[];
  mediaEntries?: MediaEntryCreateBinding[];
};

export type EntryUpdate = {
  type: string;
  title?: string | null;
  content: string;
  occurredAt?: string | null;
};

export function listEntries() {
  return apiGet<EntryDto[]>("/api/entries");
}

export type PagedResult<T> = { items: T[]; total: number; link?: string };

export async function listEntriesPaged(q?: string, page = 0, size = 20): Promise<PagedResult<EntryDto>> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/entries?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as EntryDto[];
  return { items, total, link };
}

export function getEntry(id: string) {
  return apiGet<EntryDto>(`/api/entries/${id}`);
}

export function createEntry(body: EntryCreate) {
  return apiPostJson<EntryDto>("/api/entries", body);
}

export function updateEntry(id: string, body: EntryUpdate) {
  return apiPutJson<EntryDto>(`/api/entries/${id}`, body);
}

export function deleteEntry(id: string) {
  return apiDelete(`/api/entries/${id}`);
}
