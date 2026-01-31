package cz.vh.lide.db.filter;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TagFilter {
  private String nameContains;
  private Boolean includeDeleted;
}
