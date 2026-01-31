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
public class PersonTagDto extends BaseDto {

  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private PersonDto person;

  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private TagDto tag;
}
