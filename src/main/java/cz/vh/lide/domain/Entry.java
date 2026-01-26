package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "entry")
@Getter
@Setter
@NoArgsConstructor
public class Entry {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "type", nullable = false, length = 30)
  private String type; // zatím String (MEMORY/STORY/NOTE/...)

  @Column(name = "title", length = 200)
  private String title;

  @Column(name = "content", nullable = false, columnDefinition = "text")
  private String content;

  @Column(name = "occurred_at")
  private Instant occurredAt;

  @Column(name = "created_at", nullable = false)
  @Setter(AccessLevel.NONE)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  @Setter(AccessLevel.NONE)
  private Instant updatedAt;

  @Column(name = "deleted_at")
  private Instant deletedAt;

  @PrePersist
  void prePersist() {
    var now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
