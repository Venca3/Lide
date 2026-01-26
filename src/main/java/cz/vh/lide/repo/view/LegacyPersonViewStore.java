package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Person;
import cz.vh.lide.repo.PersonRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyPersonViewStore implements PersonViewStore {

  private final PersonRepository personRepository;

  public LegacyPersonViewStore(PersonRepository personRepository) {
    this.personRepository = personRepository;
  }

  @Override
  public List<Person> findAllByDeletedAtIsNull() {
    return personRepository.findAllByDeletedAtIsNull();
  }

  @Override
  public Optional<Person> findByIdAndDeletedAtIsNull(UUID id) {
    return personRepository.findByIdAndDeletedAtIsNull(id);
  }
}
