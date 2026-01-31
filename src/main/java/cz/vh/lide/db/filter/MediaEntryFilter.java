package cz.vh.lide.db.filter;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MediaEntryFilter {
  private UUID mediaId;
  private List<UUID> mediaIds;
  private UUID entryId;
  private List<UUID> entryIds;
  private Boolean includeDeleted;
}
