package cz.vh.lide.db.filter;

import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EntryFilter {
  private String type;
  private String titleContains;
  private String contentContains;
  private Instant occurredFrom;
  private Instant occurredTo;
  private Boolean includeDeleted;
}
