import { apiDelete, apiGet, apiPostJson } from "./http";

export type PagedResult<T> = { items: T[]; total: number; link?: string };

export type PersonRelationDto = {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: string;
  note: string | null;
  validFrom: string | null; // YYYY-MM-DD
  validTo: string | null; // YYYY-MM-DD
};

export type PersonRelationCreate = {
  fromPersonId: string;
  toPersonId: string;
  type: string;
  note?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
};

/**
 * Lists outgoing relations for a person (no pagination)
 */
export function listRelationsFrom(personId: string) {
  return apiGet<PersonRelationDto[]>(`/api/personrelation/from/${personId}`);
}

/**
 * Lists outgoing relations for a person (with pagination)
 */
export async function listRelationsFromPaged(
  personId: string,
  page = 0,
  size = 20
): Promise<PagedResult<PersonRelationDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/personrelation/from/${personId}?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as PersonRelationDto[];
  return { items, total, link };
}

/**
 * Lists incoming relations for a person (no pagination)
 */
export function listRelationsTo(personId: string) {
  return apiGet<PersonRelationDto[]>(`/api/personrelation/to/${personId}`);
}

/**
 * Lists incoming relations for a person (with pagination)
 */
export async function listRelationsToPaged(
  personId: string,
  page = 0,
  size = 20
): Promise<PagedResult<PersonRelationDto>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `/api/personrelation/to/${personId}?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  const link = res.headers.get("Link") ?? undefined;
  const items = (await res.json()) as PersonRelationDto[];
  return { items, total, link };
}

/**
 * Creates a new person relation
 */
export function createPersonRelation(data: PersonRelationCreate) {
  return apiPostJson<PersonRelationDto>("/api/personrelation", data);
}

/**
 * Deletes a person relation
 */
export function deletePersonRelation(relationId: string) {
  return apiDelete(`/api/personrelation/${relationId}`);
}
