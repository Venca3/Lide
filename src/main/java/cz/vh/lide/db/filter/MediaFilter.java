package cz.vh.lide.db.filter;

import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MediaFilter {
  private String mediaType;
  private String mimeType;
  private String titleContains;
  private String uriContains;
  private Instant takenFrom;
  private Instant takenTo;
  private Boolean includeDeleted;
}
