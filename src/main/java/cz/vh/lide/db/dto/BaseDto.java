package cz.vh.lide.db.dto;

import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Base data transfer object providing common auditing and identity fields.
 * <p>
 * Includes a unique identifier and timestamps for creation, last update,
 * and soft deletion lifecycle tracking.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public abstract class BaseDto {

  private UUID id;
  private Instant createdAt;
  private Instant updatedAt;
  private Instant deletedAt;
}
