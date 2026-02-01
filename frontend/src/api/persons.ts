import { apiDelete, apiGet, apiPostJson, apiPutJson } from "./http";

export type PersonDto = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  birthDate: string | null; // "YYYY-MM-DD"
  phone: string | null;
  email: string | null;
  note: string | null;
};

export type PersonCreate = {
  firstName: string;
  lastName?: string | null;
  nickname?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
  personEntries?: any[];
  personTags?: any[];
  relationsOut?: any[];
  relationsIn?: any[];
};

export type PersonUpdate = {
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
};

export function listPersons() {
  return apiGet<PersonDto[]>("/api/persons");
}

export type PagedResult<T> = { items: T[]; total: number; link?: string };

export async function listPersonsPaged(q?: string, page = 0, size = 20): Promise<PagedResult<PersonDto>> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/persons?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as PersonDto[];
  return { items, total, link };
}

export function getPerson(id: string) {
  return apiGet<PersonDto>(`/api/persons/${id}`);
}

export function createPerson(body: PersonCreate) {
  return apiPostJson<PersonDto>("/api/persons", body);
}

export function updatePerson(id: string, body: PersonUpdate) {
  return apiPutJson<PersonDto>(`/api/persons/${id}`, body);
}

export function deletePerson(id: string) {
  return apiDelete(`/api/persons/${id}`);
}
