package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "media")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class Media extends BaseEntity {

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


  @OneToMany(mappedBy = "media")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<MediaEntry> mediaEntries = new ArrayList<>();

  public Media(UUID id, String mediaType,
      String mimeType, String uri, String title, String note, Instant takenAt,
      List<MediaEntry> mediaEntries) {
    super();
    setId(id);
    this.mediaType = mediaType;
    this.mimeType = mimeType;
    this.uri = uri;
    this.title = title;
    this.note = note;
    this.takenAt = takenAt;
    this.mediaEntries = mediaEntries != null ? mediaEntries : new ArrayList<>();
  }

}
