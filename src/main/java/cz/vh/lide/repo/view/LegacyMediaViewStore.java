package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Media;
import cz.vh.lide.repo.MediaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyMediaViewStore implements MediaViewStore {

  private final MediaRepository mediaRepository;

  public LegacyMediaViewStore(MediaRepository mediaRepository) {
    this.mediaRepository = mediaRepository;
  }

  @Override
  public List<Media> findAllByDeletedAtIsNull() {
    return mediaRepository.findAllByDeletedAtIsNull();
  }

  @Override
  public Optional<Media> findByIdAndDeletedAtIsNull(UUID id) {
    return mediaRepository.findByIdAndDeletedAtIsNull(id);
  }
}
