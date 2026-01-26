package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "media_entry", uniqueConstraints = @UniqueConstraint(name = "uq_media_entry_media_entry", columnNames = {
    "media_id", "entry_id" }))
@Getter
@Setter
@NoArgsConstructor
public class MediaEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "media_id", nullable = false)
  private UUID mediaId;

  @Column(name = "entry_id", nullable = false)
  private UUID entryId;

  @Column(name = "caption", length = 300)
  private String caption;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(name = "created_at", nullable = false)
  @Setter(AccessLevel.NONE)
  private Instant createdAt;

  @Column(name = "deleted_at")
  private Instant deletedAt;

  @PrePersist
  void prePersist() {
    createdAt = Instant.now();
  }
}
