package cz.vh.lide.api.dto;

import java.time.LocalDate;
import java.util.UUID;

public class PersonRelationDtos {

  public record RelationCreate(
      UUID fromPersonId,
      UUID toPersonId,
      String type,
      String note,
      LocalDate validFrom,
      LocalDate validTo) {
  }

  public record RelationView(
      UUID id,
      UUID fromPersonId,
      UUID toPersonId,
      String type,
      String note,
      LocalDate validFrom,
      LocalDate validTo) {
  }
}
