package cz.vh.lide.db.filter;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EntryTagFilter {
  private UUID entryId;
  private List<UUID> entryIds;
  private UUID tagId;
  private List<UUID> tagIds;
  private Boolean includeDeleted;
}
