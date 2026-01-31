package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "tag", uniqueConstraints = @UniqueConstraint(name = "uq_tag_name", columnNames = "name"))
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class Tag extends BaseEntity {

  @Column(name = "name", nullable = false, length = 120)
  private String name;


  @OneToMany(mappedBy = "tag")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<EntryTag> entryTags = new ArrayList<>();

  @OneToMany(mappedBy = "tag")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonTag> personTags = new ArrayList<>();

  public Tag(UUID id, String name,
      List<EntryTag> entryTags, List<PersonTag> personTags) {
    super();
    setId(id);
    this.name = name;
    this.entryTags = entryTags != null ? entryTags : new ArrayList<>();
    this.personTags = personTags != null ? personTags : new ArrayList<>();
  }

}
