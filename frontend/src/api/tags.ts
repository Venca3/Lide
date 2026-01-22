import { apiDelete, apiGet, apiPutJson, apiPostJson } from "./http";

export type TagDto = { id: string; name: string };

export function listTags() {
  return apiGet<TagDto[]>("/api/tags");
}

export function createTag(name: string) {
  return apiPostJson<TagDto>("/api/tags", { name: name.trim() });
}

export function updateTag(id: string, name: string) {
  return apiPutJson<TagDto>(`/api/tags/${id}`, { name: name.trim() });
}

export function deleteTag(id: string) {
  return apiDelete(`/api/tags/${id}`);
}
