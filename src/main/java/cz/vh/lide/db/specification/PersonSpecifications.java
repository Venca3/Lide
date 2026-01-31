package cz.vh.lide.db.specification;

import cz.vh.lide.db.entity.Person;
import cz.vh.lide.db.filter.PersonFilter;

import org.springframework.data.jpa.domain.Specification;

public final class PersonSpecifications {

  private PersonSpecifications() {
  }

  public static Specification<Person> build(PersonFilter filter) {
    if (filter == null) {
      return notDeleted();
    }

    Specification<Person> spec = Specification.where(null);

    if (filter.getFirstNameContains() != null && !filter.getFirstNameContains().isBlank()) {
      String value = "%" + filter.getFirstNameContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("firstName")), value));
    }

    if (filter.getLastNameContains() != null && !filter.getLastNameContains().isBlank()) {
      String value = "%" + filter.getLastNameContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("lastName")), value));
    }

    if (filter.getNicknameContains() != null && !filter.getNicknameContains().isBlank()) {
      String value = "%" + filter.getNicknameContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("nickname")), value));
    }

    if (filter.getPhoneContains() != null && !filter.getPhoneContains().isBlank()) {
      String value = "%" + filter.getPhoneContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("phone")), value));
    }

    if (filter.getEmailContains() != null && !filter.getEmailContains().isBlank()) {
      String value = "%" + filter.getEmailContains().trim().toLowerCase() + "%";
      spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("email")), value));
    }

    if (filter.getBornFrom() != null) {
      spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("birthDate"), filter.getBornFrom()));
    }

    if (filter.getBornTo() != null) {
      spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("birthDate"), filter.getBornTo()));
    }

    if (filter.getIncludeDeleted() == null || !filter.getIncludeDeleted()) {
      spec = spec.and(notDeleted());
    }

    return spec;
  }

  private static Specification<Person> notDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
  }
}
