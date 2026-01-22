package cz.vh.lide.api.dto;

import java.time.LocalDate;
import java.util.UUID;

public class PersonDtos {

  public record PersonCreate(
      String firstName,
      String lastName,
      String nickname,
      LocalDate birthDate,
      String phone,
      String email,
      String note) {
  }

  public record PersonUpdate(
      String firstName,
      String lastName,
      String nickname,
      LocalDate birthDate,
      String phone,
      String email,
      String note) {
  }

  public record PersonView(
      UUID id,
      String firstName,
      String lastName,
      String nickname,
      LocalDate birthDate,
      String phone,
      String email,
      String note) {
  }
}