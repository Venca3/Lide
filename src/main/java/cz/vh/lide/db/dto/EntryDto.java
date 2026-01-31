package cz.vh.lide.db.dto;

import java.time.Instant;
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
public class EntryDto extends BaseDto {
  private String type;
  private String title;
  private String content;
  private Instant occurredAt;
  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<EntryTagDto> entryTags = new ArrayList<>();

  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonEntryDto> personEntries = new ArrayList<>();

  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<MediaEntryDto> mediaEntries = new ArrayList<>();
}
