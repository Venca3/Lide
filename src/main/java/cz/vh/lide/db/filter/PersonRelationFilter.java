package cz.vh.lide.db.filter;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonRelationFilter {
  private UUID fromPersonId;
  private List<UUID> fromPersonIds;
  private UUID toPersonId;
  private List<UUID> toPersonIds;
  private String type;
  private List<String> types;
  private Boolean includeDeleted;
}
