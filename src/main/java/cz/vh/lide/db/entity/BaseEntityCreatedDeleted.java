package cz.vh.lide.db.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
public abstract class BaseEntityCreatedDeleted {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  protected UUID id;

  @Column(name = "created_at", nullable = false)
  @Setter(AccessLevel.NONE)
  protected Instant createdAt;

  @Column(name = "deleted_at")
  protected Instant deletedAt;

  protected BaseEntityCreatedDeleted(UUID id, Instant createdAt, Instant deletedAt) {
    this.id = id;
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
  }
}
