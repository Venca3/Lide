package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "entry_tag", uniqueConstraints = @UniqueConstraint(name = "uq_entry_tag_entry_tag", columnNames = {
    "entry_id", "tag_id" }))
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class EntryTag extends BaseEntity {


  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "entry_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Entry entry;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tag_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Tag tag;

  public EntryTag(UUID id, Entry entry, Tag tag) {
    super();
    setId(id);
    this.entry = entry;
    this.tag = tag;
  }

}
