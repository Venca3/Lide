package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "person_relation")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class PersonRelation extends BaseEntity {

  @Column(name = "type", nullable = false, length = 50)
  private String type;

  @Column(name = "note", columnDefinition = "text")
  private String note;

  @Column(name = "valid_from")
  private LocalDate validFrom;

  @Column(name = "valid_to")
  private LocalDate validTo;


  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "from_person_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Person fromPerson;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "to_person_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Person toPerson;

  public PersonRelation(UUID id,
      String type, String note, LocalDate validFrom, LocalDate validTo, Person fromPerson,
      Person toPerson) {
    super();
    setId(id);
    this.type = type;
    this.note = note;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.fromPerson = fromPerson;
    this.toPerson = toPerson;
  }

}
