import { apiDelete, apiPost } from "./http";

export function addEntryToPerson(personId: string, entryId: string, role: string) {
  const r = role?.trim() ? role.trim() : "autor";
  return apiPost(
    `/api/personentry/person/${personId}/entries/${entryId}?role=${encodeURIComponent(r)}`
  );
}

export function removeEntryFromPerson(personId: string, entryId: string, role?: string | null) {
  const r = (role ?? "").trim();

  // pokud role není, nevolat BE "naslepo" – radši to stopnout hned:
  if (!r) {
    return Promise.reject(new Error("Role is required to delete a specific person-entry link."));
  }

  return apiDelete(
    `/api/personentry/person/${personId}/entries/${entryId}?role=${encodeURIComponent(r)}`
  );
}
