package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.Entry;
import cz.vh.lide.db.filter.EntryFilter;

import org.springframework.data.jpa.domain.Specification;

public final class EntrySpecifications {

  private EntrySpecifications() {
  }

  public static Specification<Entry> build(EntryFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<Entry> spec = Specification.where(null);

    if (filter.getType() != null && !filter.getType().isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), filter.getType()));
    }

    if (filter.getTitleContains() != null && !filter.getTitleContains().isBlank()) {
      String value = "%" + filter.getTitleContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("title")), value));
    }

    if (filter.getContentContains() != null && !filter.getContentContains().isBlank()) {
      String value = "%" + filter.getContentContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("content")), value));
    }

    if (filter.getOccurredFrom() != null) {
      spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("occurredAt"), filter.getOccurredFrom()));
    }

    if (filter.getOccurredTo() != null) {
      spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("occurredAt"), filter.getOccurredTo()));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<Entry> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
