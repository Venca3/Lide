package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.Tag;
import cz.vh.lide.db.filter.TagFilter;

import org.springframework.data.jpa.domain.Specification;

public final class TagSpecifications {

  private TagSpecifications() {
  }

  public static Specification<Tag> build(TagFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<Tag> spec = Specification.where(null);

    if (filter.getNameContains() != null && !filter.getNameContains().isBlank()) {
      String value = "%" + filter.getNameContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), value));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<Tag> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
