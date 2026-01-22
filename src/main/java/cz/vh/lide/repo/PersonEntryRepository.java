package cz.vh.lide.repo;

import cz.vh.lide.domain.PersonEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PersonEntryRepository extends JpaRepository<PersonEntry, UUID> {

  // role != null
  Optional<PersonEntry> findByPersonIdAndEntryIdAndRole(UUID personId, UUID entryId, String role);

  Optional<PersonEntry> findByPersonIdAndEntryIdAndRoleAndDeletedAtIsNull(UUID personId, UUID entryId, String role);

  // role == null
  Optional<PersonEntry> findByPersonIdAndEntryIdAndRoleIsNull(UUID personId, UUID entryId);

  Optional<PersonEntry> findByPersonIdAndEntryIdAndRoleIsNullAndDeletedAtIsNull(UUID personId, UUID entryId);

  List<PersonEntry> findAllByPersonIdAndDeletedAtIsNull(UUID personId);

  List<PersonEntry> findAllByEntryIdAndDeletedAtIsNull(UUID entryId);
}
