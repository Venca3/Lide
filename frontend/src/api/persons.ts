import { apiGet } from "./http";

export type PersonListItem = {
  id: string;
  nickname: string;
};

export function getPersons(q?: string) {
  const qs = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiGet<PersonListItem[]>(`/api/persons${qs}`);
}
