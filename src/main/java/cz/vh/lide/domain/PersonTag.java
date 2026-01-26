package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "person_tag", uniqueConstraints = @UniqueConstraint(name = "uq_person_tag_person_tag", columnNames = {
    "person_id", "tag_id" }))
@Getter
@Setter
@NoArgsConstructor
public class PersonTag {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "person_id", nullable = false)
  private UUID personId;

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
