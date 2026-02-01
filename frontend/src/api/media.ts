import { apiDelete, apiGet, apiPostJson, apiPutJson } from "./http";

export type MediaDto = {
  id: string;
  mediaType: string;
  mimeType: string | null;
  uri: string;
  title: string | null;
  note: string | null;
  takenAt: string | null; // ISO datetime
};

export type MediaEntryCreateBinding = {
  mediaId?: string;
  entryId?: string;
  caption?: string;
  sortOrder?: number;
};

export type MediaCreate = {
  mediaType: string;
  mimeType?: string | null;
  uri: string;
  title?: string | null;
  note?: string | null;
  takenAt?: string | null;
  mediaEntries?: MediaEntryCreateBinding[];
};

export type MediaUpdate = {
  mediaType?: string | null;
  mimeType?: string | null;
  uri?: string | null;
  title?: string | null;
  note?: string | null;
  takenAt?: string | null;
};

export function listMedia() {
  return apiGet<MediaDto[]>("/api/media");
}

export type PagedResult<T> = { items: T[]; total: number; link?: string };

export async function listMediaPaged(q?: string, page = 0, size = 20): Promise<PagedResult<MediaDto>> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/media?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as MediaDto[];
  return { items, total, link };
}

export function getMedia(id: string) {
  return apiGet<MediaDto>(`/api/media/${id}`);
}

export function createMedia(body: MediaCreate) {
  return apiPostJson<MediaDto>("/api/media", body);
}

export function updateMedia(id: string, body: MediaUpdate) {
  return apiPutJson<MediaDto>(`/api/media/${id}`, body);
}

export function deleteMedia(id: string) {
  return apiDelete(`/api/media/${id}`);
}
