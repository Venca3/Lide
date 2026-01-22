import { apiGet } from "./http";

export type TagDto = { id: string; name: string };

export type EntryDto = {
  id: string;
  type: string;
  title: string;
  content?: string | null;
  occurredAt?: string | null; // ISO datetime
  role?: string | null; // person-entry role
};

export type RelationDto = {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: string;
  note?: string | null;
  validFrom?: string | null; // yyyy-mm-dd
  validTo?: string | null;
  otherPersonDisplayName?: string | null;
};

export type PersonRead = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  birthDate?: string | null; // yyyy-mm-dd
  phone?: string | null;
  email?: string | null;
  note?: string | null;

  tags: TagDto[];
  entries: EntryDto[];
  relationsOut: RelationDto[];
  relationsIn: RelationDto[];
};

export function getPersonRead(personId: string) {
  return apiGet<PersonRead>(`/api/personread/${personId}`);
}
