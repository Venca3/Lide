package cz.vh.lide.ws.dto;

import java.time.LocalDate;
import java.util.UUID;

public final class PersonRelationDtos {

  private PersonRelationDtos() {
  }

  public record RelationView(UUID id, UUID fromPersonId, UUID toPersonId, String type,
      String note, LocalDate validFrom, LocalDate validTo) {
  }

  public record RelationCreate(UUID fromPersonId, UUID toPersonId, String type,
      String note, LocalDate validFrom, LocalDate validTo) {
  }

  public record RelationUpdate(String type, String note, LocalDate validFrom, LocalDate validTo) {
  }
}
