package cz.vh.lide.ws.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class PersonEntryDtos {

  private PersonEntryDtos() {
  }

  public record EntryWithRole(UUID id, String type, String title, String content,
      Instant occurredAt, String role) {
  }

  public record PersonWithRole(UUID id, String firstName, String lastName, String nickname,
      LocalDate birthDate, String phone, String email, String note, String role) {
  }
}
