package cz.vh.lide.api.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class PersonEntryDtos {

  // Entry s rolí (pro list entry u osoby)
  public record EntryWithRole(
      UUID id,
      String type,
      String title,
      String content,
      Instant occurredAt,
      String role) {
  }

  // Person s rolí (pro list osob u entry)
  public record PersonWithRole(
      UUID id,
      String firstName,
      String lastName,
      String nickname,
      LocalDate birthDate,
      String phone,
      String email,
      String note,
      String role) {
  }
}
