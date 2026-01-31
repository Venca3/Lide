package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "media_entry", uniqueConstraints = @UniqueConstraint(name = "uq_media_entry_media_entry", columnNames = {
    "media_id", "entry_id" }))
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MediaEntry extends BaseEntity {

  @Column(name = "caption", length = 300)
  private String caption;

  @Column(name = "sort_order")
  private Integer sortOrder;


  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "media_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Media media;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "entry_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Entry entry;

  public MediaEntry(UUID id, String caption,
      Integer sortOrder, Media media, Entry entry) {
    super();
    setId(id);
    this.caption = caption;
    this.sortOrder = sortOrder;
    this.media = media;
    this.entry = entry;
  }

}
