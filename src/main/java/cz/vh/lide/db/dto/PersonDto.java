package cz.vh.lide.db.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

@Data
@EqualsAndHashCode(callSuper = false)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PersonDto extends BaseDto {
  private String firstName;
  private String lastName;
  private String nickname;
  private LocalDate birthDate;
  private String phone;
  private String email;
  private String note;
  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonEntryDto> personEntries = new ArrayList<>();

  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonTagDto> personTags = new ArrayList<>();

  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonRelationDto> relationsOut = new ArrayList<>();

  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonRelationDto> relationsIn = new ArrayList<>();
}
