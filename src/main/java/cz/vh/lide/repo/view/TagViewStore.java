package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Tag;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagViewStore {

  List<Tag> findAllByDeletedAtIsNull();

  Optional<Tag> findByIdAndDeletedAtIsNull(UUID id);

  boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);
}
