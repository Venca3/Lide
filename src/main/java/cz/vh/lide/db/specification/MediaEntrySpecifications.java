package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.MediaEntry;
import cz.vh.lide.db.filter.MediaEntryFilter;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class MediaEntrySpecifications {

  private MediaEntrySpecifications() {
  }

  public static Specification<MediaEntry> build(MediaEntryFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<MediaEntry> spec = Specification.where(null);

    if (filter.getMediaId() != null) {
      spec = spec.and(mediaIdEquals(filter.getMediaId()));
    }
    if (filter.getMediaIds() != null && !filter.getMediaIds().isEmpty()) {
      spec = spec.and(mediaIdIn(filter.getMediaIds()));
    }

    if (filter.getEntryId() != null) {
      spec = spec.and(entryIdEquals(filter.getEntryId()));
    }
    if (filter.getEntryIds() != null && !filter.getEntryIds().isEmpty()) {
      spec = spec.and(entryIdIn(filter.getEntryIds()));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<MediaEntry> mediaIdEquals(UUID mediaId) {
    return (root, query, cb) -> cb.equal(root.get("media").get("id"), mediaId);
  }

  private static Specification<MediaEntry> mediaIdIn(List<UUID> mediaIds) {
    return (root, query, cb) -> root.get("media").get("id").in(mediaIds);
  }

  private static Specification<MediaEntry> entryIdEquals(UUID entryId) {
    return (root, query, cb) -> cb.equal(root.get("entry").get("id"), entryId);
  }

  private static Specification<MediaEntry> entryIdIn(List<UUID> entryIds) {
    return (root, query, cb) -> root.get("entry").get("id").in(entryIds);
  }

  private static Specification<MediaEntry> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
