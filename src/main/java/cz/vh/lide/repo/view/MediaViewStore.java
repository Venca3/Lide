package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Media;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaViewStore {

  List<Media> findAllByDeletedAtIsNull();

  Optional<Media> findByIdAndDeletedAtIsNull(UUID id);
}
