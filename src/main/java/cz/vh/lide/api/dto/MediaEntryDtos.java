package cz.vh.lide.api.dto;

import java.time.Instant;
import java.util.UUID;

public class MediaEntryDtos {

  // request body pro add/update vazby
  public record MediaEntryUpsert(
      String caption,
      Integer sortOrder) {
  }

  // pro list media u entry
  public record MediaWithLink(
      UUID id,
      String mediaType,
      String mimeType,
      String uri,
      String title,
      String note,
      Instant takenAt,
      String caption,
      Integer sortOrder) {
  }

  // pro list entry u media
  public record EntryWithLink(
      UUID id,
      String type,
      String title,
      String content,
      Instant occurredAt,
      String caption,
      Integer sortOrder) {
  }
}
