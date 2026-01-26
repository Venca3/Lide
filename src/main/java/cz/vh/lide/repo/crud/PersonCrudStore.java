package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Person;
import java.util.Optional;
import java.util.UUID;

public interface PersonCrudStore {

  Person save(Person person);

  Optional<Person> findById(UUID id);

  Optional<Person> findByIdAndDeletedAtIsNull(UUID id);

  /** @return true if entity existed and was (soft) deleted */
  boolean softDeleteById(UUID id);
}
