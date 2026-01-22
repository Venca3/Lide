package cz.vh.lide.repo;

import cz.vh.lide.domain.PersonRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PersonRelationRepository extends JpaRepository<PersonRelation, UUID> {

  Optional<PersonRelation> findByIdAndDeletedAtIsNull(UUID id);

  List<PersonRelation> findAllByFromPersonIdAndDeletedAtIsNull(UUID fromPersonId);

  List<PersonRelation> findAllByToPersonIdAndDeletedAtIsNull(UUID toPersonId);
}
