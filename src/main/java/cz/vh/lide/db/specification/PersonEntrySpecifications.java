package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.PersonEntry;
import cz.vh.lide.db.filter.PersonEntryFilter;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class PersonEntrySpecifications {

  private PersonEntrySpecifications() {
  }

  public static Specification<PersonEntry> build(PersonEntryFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<PersonEntry> spec = Specification.where(null);

    if (filter.getPersonId() != null) {
      spec = spec.and(personIdEquals(filter.getPersonId()));
    }
    if (filter.getPersonIds() != null && !filter.getPersonIds().isEmpty()) {
      spec = spec.and(personIdIn(filter.getPersonIds()));
    }

    if (filter.getEntryId() != null) {
      spec = spec.and(entryIdEquals(filter.getEntryId()));
    }
    if (filter.getEntryIds() != null && !filter.getEntryIds().isEmpty()) {
      spec = spec.and(entryIdIn(filter.getEntryIds()));
    }

    if (filter.getRole() != null && !filter.getRole().isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), filter.getRole()));
    }
    if (filter.getRoles() != null && !filter.getRoles().isEmpty()) {
      spec = spec.and((root, query, cb) -> root.get("role").in(filter.getRoles()));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<PersonEntry> personIdEquals(UUID personId) {
    return (root, query, cb) -> cb.equal(root.get("person").get("id"), personId);
  }

  private static Specification<PersonEntry> personIdIn(List<UUID> personIds) {
    return (root, query, cb) -> root.get("person").get("id").in(personIds);
  }

  private static Specification<PersonEntry> entryIdEquals(UUID entryId) {
    return (root, query, cb) -> cb.equal(root.get("entry").get("id"), entryId);
  }

  private static Specification<PersonEntry> entryIdIn(List<UUID> entryIds) {
    return (root, query, cb) -> root.get("entry").get("id").in(entryIds);
  }

  private static Specification<PersonEntry> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
