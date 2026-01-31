package cz.vh.lide.ws.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class EntryDetailDtos {

  private EntryDetailDtos() {
  }

  public record EntryDetailView(UUID id, String type, String title, String content,
      Instant occurredAt,
      List<TagDtos.TagView> tags,
      List<PersonWithRole> persons,
      List<MediaWithLink> media) {
  }

  public record PersonWithRole(UUID personId, UUID entryId, String firstName, String lastName,
      String nickname, LocalDate birthDate, String phone, String email, String note, String role) {
  }

  public record MediaWithLink(UUID mediaId, UUID entryId, String mediaType, String mimeType,
      String uri, String title, String note, Instant takenAt, String caption, Integer sortOrder) {
  }
}
