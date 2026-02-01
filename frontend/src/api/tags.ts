import { apiDelete, apiGet, apiPutJson, apiPostJson } from "./http";
import { normalizeString } from "@/lib/stringNormalize";

export type TagDto = { id: string; name: string };

export type PagedResult<T> = { items: T[]; total: number; link?: string };

export function listTags() {
  return apiGet<TagDto[]>("/api/tags");
}

export async function listTagsPaged(q?: string, page = 0, size = 20): Promise<PagedResult<TagDto>> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/tags?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as TagDto[];
  return { items, total, link };
}

export function getTag(id: string) {
  return apiGet<TagDto>(`/api/tags/${id}`);
}

export function createTag(name: string) {
  return apiPostJson<TagDto>("/api/tags", { name: normalizeString(name) });
}

export function updateTag(id: string, name: string) {
  return apiPutJson<TagDto>(`/api/tags/${id}`, { name: normalizeString(name) });
}

export function deleteTag(id: string) {
  return apiDelete(`/api/tags/${id}`);
}
