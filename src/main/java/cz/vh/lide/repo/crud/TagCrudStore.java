package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Tag;
import java.util.Optional;
import java.util.UUID;

public interface TagCrudStore {

  Tag save(Tag tag);

  Optional<Tag> findById(UUID id);

  Optional<Tag> findByIdAndDeletedAtIsNull(UUID id);

  /** @return true if entity existed and was (soft) deleted */
  boolean softDeleteById(UUID id);
}
