import { apiDelete, apiPost } from "./http";

export function createTag(name: string) {
  return apiPost(`/api/tags?name=${encodeURIComponent(name.trim())}`);
}

export function deleteTag(tagId: string) {
  return apiDelete(`/api/tags/${tagId}`);
}
