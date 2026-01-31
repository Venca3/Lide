package cz.vh.lide.ws.dto;

import java.time.Instant;
import java.util.UUID;

public final class MediaEntryDtos {

  private MediaEntryDtos() {
  }

  public record MediaWithLink(UUID mediaId, UUID entryId, String mediaType, String mimeType,
      String uri, String title, String note, Instant takenAt, String caption, Integer sortOrder) {
  }

  public record EntryWithLink(UUID entryId, UUID mediaId, String type, String title,
      String content, Instant occurredAt, String caption, Integer sortOrder) {
  }

  public record MediaEntryUpsert(String caption, Integer sortOrder) {
  }
}
