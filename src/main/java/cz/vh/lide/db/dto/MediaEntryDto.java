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
public class MediaEntryDto extends BaseDto {
  private String caption;
  private Integer sortOrder;
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private MediaDto media;

  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private EntryDto entry;
}
