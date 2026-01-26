import { apiDelete, apiGet, apiPostJson, apiPutJson } from "./http";

export type EntryDto = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  occurredAt: string | null;
};

export type EntryCreate = {
  type: string;
  title?: string | null;
  content: string;
  occurredAt?: string | null;
};

export type EntryUpdate = {
  type?: string | null;
  title?: string | null;
  content?: string | null;
  occurredAt?: string | null;
};

export function listEntries() {
  return apiGet<EntryDto[]>("/api/entries");
}

export function getEntry(id: string) {
  return apiGet<EntryDto>(`/api/entries/${id}`);
}

export function createEntry(body: EntryCreate) {
  return apiPostJson<EntryDto>("/api/entries", body);
}

export function updateEntry(id: string, body: EntryUpdate) {
  return apiPutJson<EntryDto>(`/api/entries/${id}`, body);
}

export function deleteEntry(id: string) {
  return apiDelete(`/api/entries/${id}`);
}
