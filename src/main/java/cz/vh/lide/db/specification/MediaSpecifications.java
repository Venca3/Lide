package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.Media;
import cz.vh.lide.db.filter.MediaFilter;

import org.springframework.data.jpa.domain.Specification;

public final class MediaSpecifications {

  private MediaSpecifications() {
  }

  public static Specification<Media> build(MediaFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<Media> spec = Specification.where(null);

    if (filter.getMediaType() != null && !filter.getMediaType().isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("mediaType"), filter.getMediaType()));
    }

    if (filter.getMimeType() != null && !filter.getMimeType().isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("mimeType"), filter.getMimeType()));
    }

    if (filter.getTitleContains() != null && !filter.getTitleContains().isBlank()) {
      String value = "%" + filter.getTitleContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("title")), value));
    }

    if (filter.getUriContains() != null && !filter.getUriContains().isBlank()) {
      String value = "%" + filter.getUriContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("uri")), value));
    }

    if (filter.getTakenFrom() != null) {
      spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("takenAt"), filter.getTakenFrom()));
    }

    if (filter.getTakenTo() != null) {
      spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("takenAt"), filter.getTakenTo()));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<Media> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
