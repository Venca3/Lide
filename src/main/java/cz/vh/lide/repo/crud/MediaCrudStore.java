package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Media;
import java.util.Optional;
import java.util.UUID;

public interface MediaCrudStore {

  Media save(Media media);

  Optional<Media> findById(UUID id);

  Optional<Media> findByIdAndDeletedAtIsNull(UUID id);

  /** @return true if entity existed and was (soft) deleted */
  boolean softDeleteById(UUID id);
}
