package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "person_relation")
@Getter
@Setter
@NoArgsConstructor
public class PersonRelation {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "from_person_id", nullable = false)
  private UUID fromPersonId;

  @Column(name = "to_person_id", nullable = false)
  private UUID toPersonId;

  @Column(name = "type", nullable = false, length = 50)
  private String type;

  @Column(name = "note", columnDefinition = "text")
  private String note;

  @Column(name = "valid_from")
  private LocalDate validFrom;

  @Column(name = "valid_to")
  private LocalDate validTo;

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
