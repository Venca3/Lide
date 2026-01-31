package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "person_tag", uniqueConstraints = @UniqueConstraint(name = "uq_person_tag_person_tag", columnNames = {
    "person_id", "tag_id" }))
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class PersonTag extends BaseEntity {


  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "person_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Person person;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tag_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Tag tag;

  public PersonTag(UUID id, Person person,
      Tag tag) {
    super();
    setId(id);
    this.person = person;
    this.tag = tag;
  }

}
