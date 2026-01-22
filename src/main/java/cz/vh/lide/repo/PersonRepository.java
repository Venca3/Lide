package cz.vh.lide.repo;

import cz.vh.lide.domain.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PersonRepository extends JpaRepository<Person, UUID> {

  List<Person> findAllByDeletedAtIsNull();

  Optional<Person> findByIdAndDeletedAtIsNull(UUID id);
}
