package cz.vh.lide.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class EntryDetailDtos {

  public record EntryDetailView(
      UUID id,
      String type,
      String title,
      String content,
      Instant occurredAt,
      List<TagDtos.TagView> tags,
      List<PersonEntryDtos.PersonWithRole> persons,
      List<MediaEntryDtos.MediaWithLink> media) {
  }
}
