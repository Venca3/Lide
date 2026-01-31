package cz.vh.lide.ws.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class PersonDtos {

  private PersonDtos() {
  }

  public record PersonView(UUID id, String firstName, String lastName, String nickname,
      LocalDate birthDate, String phone, String email, String note) {
  }

  public record PersonCreate(String firstName, String lastName, String nickname,
      LocalDate birthDate, String phone, String email, String note,
      List<BindingDtos.PersonEntryCreate> personEntries,
      List<BindingDtos.PersonTagCreate> personTags,
      List<BindingDtos.PersonRelationCreate> relationsOut,
      List<BindingDtos.PersonRelationCreate> relationsIn) {
  }

  public record PersonUpdate(String firstName, String lastName, String nickname,
      LocalDate birthDate, String phone, String email, String note) {
  }
}
