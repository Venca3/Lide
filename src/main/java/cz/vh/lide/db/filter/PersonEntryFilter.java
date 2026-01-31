package cz.vh.lide.db.filter;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonEntryFilter {
  private UUID personId;
  private List<UUID> personIds;
  private UUID entryId;
  private List<UUID> entryIds;
  private String role;
  private List<String> roles;
  private Boolean includeDeleted;
}
