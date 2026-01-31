package cz.vh.lide.db.repository;

import org.springframework.lang.NonNull;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import cz.vh.lide.db.entity.Person;

import java.util.Optional;
import java.util.UUID;

public interface PersonRepository extends JpaRepository<Person, UUID>, JpaSpecificationExecutor<Person> {
  /**
   * Find person by id.
   */
  @NonNull
  Optional<Person> findById(@NonNull UUID id);

  /**
   * Pagable find all persons not marked as deleted.
   */
  @NonNull
  Page<Person> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all persons marked as deleted.
   */
  @NonNull
  Page<Person> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete person by id.
   */
  @Modifying
  @Transactional
  @Query("update Person p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
