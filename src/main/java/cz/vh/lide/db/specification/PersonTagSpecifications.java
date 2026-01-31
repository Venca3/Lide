package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.PersonTag;
import cz.vh.lide.db.filter.PersonTagFilter;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class PersonTagSpecifications {

  private PersonTagSpecifications() {
  }

  public static Specification<PersonTag> build(PersonTagFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<PersonTag> spec = Specification.where(null);

    if (filter.getPersonId() != null) {
      spec = spec.and(personIdEquals(filter.getPersonId()));
    }
    if (filter.getPersonIds() != null && !filter.getPersonIds().isEmpty()) {
      spec = spec.and(personIdIn(filter.getPersonIds()));
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

  private static Specification<PersonTag> personIdEquals(UUID personId) {
    return (root, query, cb) -> cb.equal(root.get("person").get("id"), personId);
  }

  private static Specification<PersonTag> personIdIn(List<UUID> personIds) {
    return (root, query, cb) -> root.get("person").get("id").in(personIds);
  }

  private static Specification<PersonTag> tagIdEquals(UUID tagId) {
    return (root, query, cb) -> cb.equal(root.get("tag").get("id"), tagId);
  }

  private static Specification<PersonTag> tagIdIn(List<UUID> tagIds) {
    return (root, query, cb) -> root.get("tag").get("id").in(tagIds);
  }

  private static Specification<PersonTag> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
