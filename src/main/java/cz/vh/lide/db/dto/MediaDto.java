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
public class MediaDto extends BaseDto {
  private String mediaType;
  private String mimeType;
  private String uri;
  private String title;
  private String note;
  private Instant takenAt;

  @Builder.Default
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<MediaEntryDto> mediaEntries = new ArrayList<>();
}
