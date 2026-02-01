import { apiDelete, apiGet, apiPost } from "./http";
import type { EntryDto } from "./entries";
import type { TagDto } from "./tags";

export type PagedResult<T> = { items: T[]; total: number; link?: string };

/**
 * Lists tags linked to an entry (no pagination)
 */
export function listTagsForEntry(entryId: string) {
  return apiGet<TagDto[]>(`/api/entriestags/entry/${entryId}/tags`);
}

/**
 * Lists tags linked to an entry (with pagination)
 */
export async function listTagsForEntryPaged(
  entryId: string,
  page = 0,
  size = 20
): Promise<PagedResult<TagDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/entriestags/entry/${entryId}/tags?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as TagDto[];
  return { items, total, link };
}

/**
 * Lists entries linked to a tag (no pagination)
 */
export function listEntriesForTag(tagId: string) {
  return apiGet<EntryDto[]>(`/api/entriestags/tag/${tagId}/entries`);
}

/**
 * Lists entries linked to a tag (with pagination)
 */
export async function listEntriesForTagPaged(
  tagId: string,
  page = 0,
  size = 20
): Promise<PagedResult<EntryDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/entriestags/tag/${tagId}/entries?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as EntryDto[];
  return { items, total, link };
}

/**
 * Adds a tag to an entry
 */
export function addTagToEntry(entryId: string, tagId: string) {
  return apiPost(`/api/entriestags/entry/${entryId}/tag/${tagId}`);
}

/**
 * Removes a tag from an entry
 */
export function removeTagFromEntry(entryId: string, tagId: string) {
  return apiDelete(`/api/entriestags/entry/${entryId}/tag/${tagId}`);
}
