package cz.vh.lide.repo;

import cz.vh.lide.domain.PersonTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PersonTagRepository extends JpaRepository<PersonTag, UUID> {

  Optional<PersonTag> findByPersonIdAndTagId(UUID personId, UUID tagId);

  List<PersonTag> findAllByPersonIdAndDeletedAtIsNull(UUID personId);

  List<PersonTag> findAllByTagIdAndDeletedAtIsNull(UUID tagId);

  Optional<PersonTag> findByPersonIdAndTagIdAndDeletedAtIsNull(UUID personId, UUID tagId);
}
