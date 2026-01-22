package cz.vh.lide.api.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class PersonDetailDtos {

  public record PersonRelationView(
      UUID id,
      UUID fromPersonId,
      UUID toPersonId,
      String type,
      String note,
      LocalDate validFrom,
      LocalDate validTo,
      String otherPersonDisplayName) {
  }

  public record PersonDetailView(
      UUID id,
      String firstName,
      String lastName,
      String nickname,
      LocalDate birthDate,
      String phone,
      String email,
      String note,
      List<TagDtos.TagView> tags,
      List<PersonEntryDtos.EntryWithRole> entries,
      List<PersonRelationView> relationsOut, // from -> to
      List<PersonRelationView> relationsIn // to <- from
  ) {
  }
}
