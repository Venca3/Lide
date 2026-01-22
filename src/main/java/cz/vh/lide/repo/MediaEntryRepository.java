package cz.vh.lide.repo;

import cz.vh.lide.domain.MediaEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaEntryRepository extends JpaRepository<MediaEntry, UUID> {

  Optional<MediaEntry> findByMediaIdAndEntryId(UUID mediaId, UUID entryId);

  Optional<MediaEntry> findByMediaIdAndEntryIdAndDeletedAtIsNull(UUID mediaId, UUID entryId);

  List<MediaEntry> findAllByEntryIdAndDeletedAtIsNull(UUID entryId);

  List<MediaEntry> findAllByMediaIdAndDeletedAtIsNull(UUID mediaId);
}
