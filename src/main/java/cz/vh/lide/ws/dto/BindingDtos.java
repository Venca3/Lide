package cz.vh.lide.ws.dto;

import java.time.LocalDate;
import java.util.UUID;

public final class BindingDtos {

  private BindingDtos() {
  }

  public record EntryTagCreate(UUID entryId, UUID tagId) {
  }

  public record PersonEntryCreate(UUID personId, UUID entryId, String role) {
  }

  public record MediaEntryCreate(UUID mediaId, UUID entryId, String caption, Integer sortOrder) {
  }

  public record PersonTagCreate(UUID personId, UUID tagId) {
  }

  public record PersonRelationCreate(UUID fromPersonId, UUID toPersonId, String type, String note,
      LocalDate validFrom, LocalDate validTo) {
  }
}
