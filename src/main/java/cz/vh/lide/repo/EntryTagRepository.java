package cz.vh.lide.repo;

import cz.vh.lide.domain.EntryTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EntryTagRepository extends JpaRepository<EntryTag, UUID> {

  Optional<EntryTag> findByEntryIdAndTagId(UUID entryId, UUID tagId);

  Optional<EntryTag> findByEntryIdAndTagIdAndDeletedAtIsNull(UUID entryId, UUID tagId);

  List<EntryTag> findAllByEntryIdAndDeletedAtIsNull(UUID entryId);

  List<EntryTag> findAllByTagIdAndDeletedAtIsNull(UUID tagId);
}
