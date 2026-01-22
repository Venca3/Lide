import { apiDelete, apiPost } from "./http";

export function addTagToPerson(personId: string, tagId: string) {
  return apiPost(`/api/personstags/person/${personId}/tag/${tagId}`);
}

export function removeTagFromPerson(personId: string, tagId: string) {
  return apiDelete(`/api/personstags/person/${personId}/tag/${tagId}`);
}
