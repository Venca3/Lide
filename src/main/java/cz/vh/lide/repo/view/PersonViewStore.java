package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Person;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PersonViewStore {

  List<Person> findAllByDeletedAtIsNull();

  Optional<Person> findByIdAndDeletedAtIsNull(UUID id);
}
