package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "person_entry", uniqueConstraints = @UniqueConstraint(name = "uq_person_entry_person_entry_role", columnNames = {
    "person_id", "entry_id", "role" }))
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class PersonEntry extends BaseEntity {

  @Column(name = "role", length = 50)
  private String role; // může být null


  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "person_id", nullable = false)
  private Person person;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "entry_id", nullable = false)
  private Entry entry;

  public PersonEntry(UUID id, String role,
      Person person, Entry entry) {
    super();
    setId(id);
    this.role = role;
    this.person = person;
    this.entry = entry;
  }

}
