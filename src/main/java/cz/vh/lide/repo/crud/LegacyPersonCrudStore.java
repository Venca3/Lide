package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Person;
import cz.vh.lide.repo.PersonRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyPersonCrudStore implements PersonCrudStore {

  private final PersonRepository personRepository;

  public LegacyPersonCrudStore(PersonRepository personRepository) {
    this.personRepository = personRepository;
  }

  @Override
  public Person save(Person person) {
    return personRepository.save(person);
  }

  @Override
  public Optional<Person> findById(UUID id) {
    return personRepository.findById(id);
  }

  @Override
  public Optional<Person> findByIdAndDeletedAtIsNull(UUID id) {
    return personRepository.findByIdAndDeletedAtIsNull(id);
  }

  @Override
  public boolean softDeleteById(UUID id) {
    var personOpt = personRepository.findByIdAndDeletedAtIsNull(id);
    if (personOpt.isEmpty()) {
      return false;
    }

    var person = personOpt.get();
    person.setDeletedAt(Instant.now());
    personRepository.save(person);
    return true;
  }
}
