import { apiGet } from "./http";
import type { TagDto } from "./tags";

export type PersonWithRole = {
  personId: string;
  entryId: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  birthDate: string | null; // YYYY-MM-DD
  phone: string | null;
  email: string | null;
  note: string | null;
  role: string;
};

export type MediaWithLink = {
  mediaId: string;
  entryId: string;
  mediaType: string;
  mimeType: string | null;
  uri: string;
  title: string | null;
  note: string | null;
  takenAt: string | null; // ISO datetime
  caption: string | null;
  sortOrder: number | null;
};

export type EntryDetailView = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  occurredAt: string | null; // ISO datetime
  tags: TagDto[];
  persons: PersonWithRole[];
  media: MediaWithLink[];
};

/**
 * Gets detailed entry view with all linked entities (tags, persons, media)
 */
export function getEntryDetail(entryId: string) {
  return apiGet<EntryDetailView>(`/api/entryread/${entryId}`);
}
