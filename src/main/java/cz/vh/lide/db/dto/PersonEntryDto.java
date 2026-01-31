package cz.vh.lide.db.dto;

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
public class PersonEntryDto extends BaseDto {
  private String role;
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private PersonDto person;

  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private EntryDto entry;
}
