package cz.vh.lide.db.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "person")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class Person extends BaseEntity {

  @Column(name = "first_name", nullable = false, length = 100)
  private String firstName;

  @Column(name = "last_name", length = 100)
  private String lastName;

  @Column(name = "nickname", length = 100)
  private String nickname;

  @Column(name = "birth_date")
  private LocalDate birthDate;

  @Column(name = "phone", length = 50)
  private String phone;

  @Column(name = "email", length = 200)
  private String email;

  @Column(name = "note", columnDefinition = "text")
  private String note;


  @OneToMany(mappedBy = "person")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonEntry> personEntries = new ArrayList<>();

  @OneToMany(mappedBy = "person")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonTag> personTags = new ArrayList<>();

  @OneToMany(mappedBy = "fromPerson")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonRelation> relationsOut = new ArrayList<>();

  @OneToMany(mappedBy = "toPerson")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<PersonRelation> relationsIn = new ArrayList<>();

  public Person(UUID id, String firstName,
      String lastName, String nickname, LocalDate birthDate, String phone, String email,
      String note, List<PersonEntry> personEntries, List<PersonTag> personTags,
      List<PersonRelation> relationsOut, List<PersonRelation> relationsIn) {
    super();
    setId(id);
    this.firstName = firstName;
    this.lastName = lastName;
    this.nickname = nickname;
    this.birthDate = birthDate;
    this.phone = phone;
    this.email = email;
    this.note = note;
    this.personEntries = personEntries != null ? personEntries : new ArrayList<>();
    this.personTags = personTags != null ? personTags : new ArrayList<>();
    this.relationsOut = relationsOut != null ? relationsOut : new ArrayList<>();
    this.relationsIn = relationsIn != null ? relationsIn : new ArrayList<>();
  }

}
