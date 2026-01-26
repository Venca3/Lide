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
