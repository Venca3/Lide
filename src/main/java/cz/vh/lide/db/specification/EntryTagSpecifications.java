package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.EntryTag;
import cz.vh.lide.db.filter.EntryTagFilter;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class EntryTagSpecifications {

  private EntryTagSpecifications() {
  }

  public static Specification<EntryTag> build(EntryTagFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<EntryTag> spec = Specification.where(null);

    if (filter.getEntryId() != null) {
      spec = spec.and(entryIdEquals(filter.getEntryId()));
    }
    if (filter.getEntryIds() != null && !filter.getEntryIds().isEmpty()) {
      spec = spec.and(entryIdIn(filter.getEntryIds()));
    }

    if (filter.getTagId() != null) {
      spec = spec.and(tagIdEquals(filter.getTagId()));
    }
    if (filter.getTagIds() != null && !filter.getTagIds().isEmpty()) {
      spec = spec.and(tagIdIn(filter.getTagIds()));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<EntryTag> entryIdEquals(UUID entryId) {
    return (root, query, cb) -> cb.equal(root.get("entry").get("id"), entryId);
  }

  private static Specification<EntryTag> entryIdIn(List<UUID> entryIds) {
    return (root, query, cb) -> root.get("entry").get("id").in(entryIds);
  }

  private static Specification<EntryTag> tagIdEquals(UUID tagId) {
    return (root, query, cb) -> cb.equal(root.get("tag").get("id"), tagId);
  }

  private static Specification<EntryTag> tagIdIn(List<UUID> tagIds) {
    return (root, query, cb) -> root.get("tag").get("id").in(tagIds);
  }

  private static Specification<EntryTag> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
