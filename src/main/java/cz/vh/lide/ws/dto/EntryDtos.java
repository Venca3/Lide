package cz.vh.lide.ws.dto;

import java.time.Instant;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public final class EntryDtos {

  private EntryDtos() {
  }

  public record EntryView(UUID id, String type, String title, String content, Instant occurredAt) {
  }

  public record EntryCreate(@NotBlank String type, String title, @NotBlank String content, Instant occurredAt,
      List<BindingDtos.EntryTagCreate> entryTags,
      List<BindingDtos.PersonEntryCreate> personEntries,
      List<BindingDtos.MediaEntryCreate> mediaEntries) {
  }

  public record EntryUpdate(@NotBlank String type, String title, @NotBlank String content, Instant occurredAt) {
  }
}
