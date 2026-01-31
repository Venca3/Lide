package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.PersonRelation;
import cz.vh.lide.db.filter.PersonRelationFilter;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class PersonRelationSpecifications {

  private PersonRelationSpecifications() {
  }

  public static Specification<PersonRelation> build(PersonRelationFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<PersonRelation> spec = Specification.where(null);

    if (filter.getFromPersonId() != null) {
      spec = spec.and(fromPersonIdEquals(filter.getFromPersonId()));
    }
    if (filter.getFromPersonIds() != null && !filter.getFromPersonIds().isEmpty()) {
      spec = spec.and(fromPersonIdIn(filter.getFromPersonIds()));
    }

    if (filter.getToPersonId() != null) {
      spec = spec.and(toPersonIdEquals(filter.getToPersonId()));
    }
    if (filter.getToPersonIds() != null && !filter.getToPersonIds().isEmpty()) {
      spec = spec.and(toPersonIdIn(filter.getToPersonIds()));
    }

    if (filter.getType() != null && !filter.getType().isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), filter.getType()));
    }
    if (filter.getTypes() != null && !filter.getTypes().isEmpty()) {
      spec = spec.and((root, query, cb) -> root.get("type").in(filter.getTypes()));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<PersonRelation> fromPersonIdEquals(UUID id) {
    return (root, query, cb) -> cb.equal(root.get("fromPerson").get("id"), id);
  }

  private static Specification<PersonRelation> fromPersonIdIn(List<UUID> ids) {
    return (root, query, cb) -> root.get("fromPerson").get("id").in(ids);
  }

  private static Specification<PersonRelation> toPersonIdEquals(UUID id) {
    return (root, query, cb) -> cb.equal(root.get("toPerson").get("id"), id);
  }

  private static Specification<PersonRelation> toPersonIdIn(List<UUID> ids) {
    return (root, query, cb) -> root.get("toPerson").get("id").in(ids);
  }

  private static Specification<PersonRelation> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
