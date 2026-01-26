package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Media;
import cz.vh.lide.repo.MediaRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyMediaCrudStore implements MediaCrudStore {

  private final MediaRepository mediaRepository;

  public LegacyMediaCrudStore(MediaRepository mediaRepository) {
    this.mediaRepository = mediaRepository;
  }

  @Override
  public Media save(Media media) {
    return mediaRepository.save(media);
  }

  @Override
  public Optional<Media> findById(UUID id) {
    return mediaRepository.findById(id);
  }

  @Override
  public Optional<Media> findByIdAndDeletedAtIsNull(UUID id) {
    return mediaRepository.findByIdAndDeletedAtIsNull(id);
  }

  @Override
  public boolean softDeleteById(UUID id) {
    var mediaOpt = mediaRepository.findByIdAndDeletedAtIsNull(id);
    if (mediaOpt.isEmpty()) {
      return false;
    }

    var media = mediaOpt.get();
    media.setDeletedAt(Instant.now());
    mediaRepository.save(media);
    return true;
  }
}
