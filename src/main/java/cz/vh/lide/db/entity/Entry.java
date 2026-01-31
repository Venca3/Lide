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
@Table(name = "entry")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class Entry extends BaseEntity {

  @Column(name = "type", nullable = false, length = 30)
  private String type; // zatím String (MEMORY/STORY/NOTE/...)

  @Column(name = "title", length = 200)
  private String title;

  @Column(name = "content", nullable = false, columnDefinition = "text")
  private String content;

  @Column(name = "occurred_at")
  private Instant occurredAt;

  @OneToMany(mappedBy = "entry")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<EntryTag> entryTags = new ArrayList<>();

  @OneToMany(mappedBy = "entry")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonEntry> personEntries = new ArrayList<>();

  @OneToMany(mappedBy = "entry")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<MediaEntry> mediaEntries = new ArrayList<>();

  public Entry(UUID id, String type, String title, String content, Instant occurredAt,
      List<EntryTag> entryTags, List<PersonEntry> personEntries, List<MediaEntry> mediaEntries) {
    super();
    setId(id);
    this.type = type;
    this.title = title;
    this.content = content;
    this.occurredAt = occurredAt;
    this.entryTags = entryTags != null ? entryTags : new ArrayList<>();
    this.personEntries = personEntries != null ? personEntries : new ArrayList<>();
    this.mediaEntries = mediaEntries != null ? mediaEntries : new ArrayList<>();
  }

}
