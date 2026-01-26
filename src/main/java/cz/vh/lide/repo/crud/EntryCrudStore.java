package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Entry;
import java.util.Optional;
import java.util.UUID;

public interface EntryCrudStore {

  Entry save(Entry entry);

  Optional<Entry> findById(UUID id);

  Optional<Entry> findByIdAndDeletedAtIsNull(UUID id);

  /** @return true if entity existed and was (soft) deleted */
  boolean softDeleteById(UUID id);
}
