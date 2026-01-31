package cz.vh.lide.db.dto;

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
public class TagDto extends BaseDto {
  private String name;
  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<EntryTagDto> entryTags = new ArrayList<>();

  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonTagDto> personTags = new ArrayList<>();
}
