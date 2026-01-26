package cz.vh.lide.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "media")
@Getter
@Setter
@NoArgsConstructor
public class Media {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "media_type", nullable = false, length = 30)
  private String mediaType; // PHOTO, VIDEO, DOC, ...

  @Column(name = "mime_type", length = 120)
  private String mimeType;

  @Column(name = "uri", nullable = false, columnDefinition = "text")
  private String uri; // pro MVP např. file://..., s3://..., https://...

  @Column(name = "title", length = 200)
  private String title;

  @Column(name = "note", columnDefinition = "text")
  private String note;

  @Column(name = "taken_at")
  private Instant takenAt;

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
