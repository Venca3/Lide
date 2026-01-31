package cz.vh.lide.db.filter;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonTagFilter {
  private UUID personId;
  private List<UUID> personIds;
  private UUID tagId;
  private List<UUID> tagIds;
  private Boolean includeDeleted;
}
