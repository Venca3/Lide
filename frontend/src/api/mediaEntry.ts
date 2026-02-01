import { apiDelete, apiGet, apiPostJson, apiPutJson } from "./http";

export type PagedResult<T> = { items: T[]; total: number; link?: string };

export type MediaWithLink = {
  mediaId: string;
  entryId: string;
  mediaType: string;
  mimeType: string | null;
  uri: string;
  title: string | null;
  note: string | null;
  takenAt: string | null; // ISO datetime
  caption: string | null;
  sortOrder: number | null;
};

export type EntryWithLink = {
  entryId: string;
  mediaId: string;
  type: string;
  title: string | null;
  content: string;
  occurredAt: string | null; // ISO datetime
  caption: string | null;
  sortOrder: number | null;
};

export type MediaEntryUpsert = {
  caption?: string | null;
  sortOrder?: number | null;
};

/**
 * Lists media linked to an entry (no pagination)
 */
export function listMediaForEntry(entryId: string) {
  return apiGet<MediaWithLink[]>(`/api/mediaentry/entry/${entryId}/media`);
}

/**
 * Lists media linked to an entry (with pagination)
 */
export async function listMediaForEntryPaged(
  entryId: string,
  page = 0,
  size = 20
): Promise<PagedResult<MediaWithLink>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/mediaentry/entry/${entryId}/media?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as MediaWithLink[];
  return { items, total, link };
}

/**
 * Lists entries linked to media (no pagination)
 */
export function listEntriesForMedia(mediaId: string) {
  return apiGet<EntryWithLink[]>(`/api/mediaentry/media/${mediaId}/entries`);
}

/**
 * Lists entries linked to media (with pagination)
 */
export async function listEntriesForMediaPaged(
  mediaId: string,
  page = 0,
  size = 20
): Promise<PagedResult<EntryWithLink>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/mediaentry/media/${mediaId}/entries?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as EntryWithLink[];
  return { items, total, link };
}

/**
 * Adds media to an entry (creates or updates link)
 */
export function addMediaToEntry(entryId: string, mediaId: string, data?: MediaEntryUpsert) {
  return apiPostJson(`/api/mediaentry/entry/${entryId}/media/${mediaId}`, data ?? {});
}

/**
 * Updates media-entry link metadata
 */
export function updateMediaEntryLink(entryId: string, mediaId: string, data: MediaEntryUpsert) {
  return apiPutJson(`/api/mediaentry/entry/${entryId}/media/${mediaId}`, data);
}

/**
 * Removes media from an entry
 */
export function removeMediaFromEntry(entryId: string, mediaId: string) {
  return apiDelete(`/api/mediaentry/entry/${entryId}/media/${mediaId}`);
}
