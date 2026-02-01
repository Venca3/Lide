import { apiDelete, apiPost, apiPut } from "./http";
import { normalizeString } from "@/lib/stringNormalize";

export function addEntryToPerson(personId: string, entryId: string, role: string) {
  const r = normalizeString(role) || "autor";
  return apiPost(
    `/api/personentry/person/${personId}/entries/${entryId}?role=${encodeURIComponent(r)}`
  );
}

export function updateEntryRole(personId: string, entryId: string, oldRole: string, newRole: string) {
  const oldR = normalizeString(oldRole);
  const newR = normalizeString(newRole) || "autor";

  if (!oldR) {
    return Promise.reject(new Error("Old role is required to update a person-entry link."));
  }

  return apiPut(
    `/api/personentry/person/${personId}/entries/${entryId}?oldRole=${encodeURIComponent(oldR)}&newRole=${encodeURIComponent(newR)}`
  );
}

export function removeEntryFromPerson(personId: string, entryId: string, role?: string | null) {
  const r = normalizeString(role);

  // pokud role není, nevolat BE "naslepo" – radší to stopnout hned:
  if (!r) {
    return Promise.reject(new Error("Role is required to delete a specific person-entry link."));
  }

  return apiDelete(
    `/api/personentry/person/${personId}/entries/${entryId}?role=${encodeURIComponent(r)}`
  );
}
