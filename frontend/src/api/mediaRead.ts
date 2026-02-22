import { apiGet } from "./http";
import { API_ENDPOINTS } from "@/lib/constants";

export type EntryWithLink = {
  entryId: string;
  mediaId: string;
  type: string;
  title: string | null;
  content: string;
  occurredAt: string | null; // ISO datetime
  caption: string | null;
  sortOrder: number | null;
};

export type MediaDetailView = {
  id: string;
  mediaType: string;
  mimeType: string | null;
  uri: string;
  title: string | null;
  note: string | null;
  takenAt: string | null; // ISO datetime
  entries: EntryWithLink[];
};

// fetch media with linked entries
export function getMediaDetail(mediaId: string) {
  return apiGet<MediaDetailView>(`${API_ENDPOINTS.MEDIA}/${mediaId}/detail`);
}
