package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "entry_tag", uniqueConstraints = @UniqueConstraint(name = "uq_entry_tag_entry_tag", columnNames = {
    "entry_id", "tag_id" }))
@Getter
@Setter
@NoArgsConstructor
public class EntryTag {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "entry_id", nullable = false)
  private UUID entryId;

  @Column(name = "tag_id", nullable = false)
  private UUID tagId;

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
