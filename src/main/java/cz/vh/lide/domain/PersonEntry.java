package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "person_entry", uniqueConstraints = @UniqueConstraint(name = "uq_person_entry_person_entry_role", columnNames = {
    "person_id", "entry_id", "role" }))
@Getter
@Setter
@NoArgsConstructor
public class PersonEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "person_id", nullable = false)
  private UUID personId;

  @Column(name = "entry_id", nullable = false)
  private UUID entryId;

  @Column(name = "role", length = 50)
  private String role; // může být null

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
