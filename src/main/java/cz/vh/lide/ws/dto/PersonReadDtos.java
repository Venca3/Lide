package cz.vh.lide.ws.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class PersonReadDtos {

  private PersonReadDtos() {
  }

  public record PersonReadView(UUID id, String firstName, String lastName, String nickname,
      LocalDate birthDate, String phone, String email, String note,
      List<TagDtos.TagView> tags,
      List<EntryWithRole> entries,
      List<PersonRelationView> relationsOut,
      List<PersonRelationView> relationsIn) {
  }

  public record EntryWithRole(UUID id, String type, String title, String content,
      Instant occurredAt, String role) {
  }

  public record PersonRelationView(UUID id, UUID fromPersonId, UUID toPersonId, String type,
      String note, LocalDate validFrom, LocalDate validTo, String otherPersonDisplayName) {
  }
}
