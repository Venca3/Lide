package cz.vh.lide.db.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = false)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PersonRelationDto extends BaseDto {
  private String type;
  private String note;
  private LocalDate validFrom;
  private LocalDate validTo;
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private PersonDto fromPerson;

  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private PersonDto toPerson;
}
