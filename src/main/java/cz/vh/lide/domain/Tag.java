package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tag", uniqueConstraints = @UniqueConstraint(name = "uq_tag_name", columnNames = "name"))
@Getter
@Setter
@NoArgsConstructor
public class Tag {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "name", nullable = false, length = 120)
  private String name;

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
