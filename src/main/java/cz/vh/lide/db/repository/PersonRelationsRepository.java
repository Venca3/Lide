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

import cz.vh.lide.db.entity.PersonRelation;

import java.util.Optional;
import java.util.UUID;

public interface PersonRelationsRepository extends JpaRepository<PersonRelation, UUID>, JpaSpecificationExecutor<PersonRelation> {
  /**
   * Find PersonEntry by id.
   */
  @NonNull
  Optional<PersonRelation> findById(@NonNull UUID id);

  /**
   * Find PersonRelation by Person id fronmPersonId and toPersonId and type.
   */
  @NonNull
  Optional<PersonRelation> findByFromPersonIdAndToPersonIdAndType(@NonNull UUID fromPersonId, @NonNull UUID toPersonId, @NonNull String type);

  /**
   * Find all PersonRelations by Person id fromPersonId and toPersonId.
   */
  @NonNull
  Page<PersonRelation> findByFromPersonIdAndToPersonId(@NonNull UUID fromPersonId, @NonNull UUID toPersonId, @NonNull Pageable pageable);

  /**
   * Find all PersonRelations by Person id fromPersonId.
   */
  @NonNull
  Page<PersonRelation> findByFromPersonId(@NonNull UUID fromPersonId, @NonNull Pageable pageable);

  /**
   * Find all PersonRelations by Person id toPersonId.
   */
  @NonNull
  Page<PersonRelation> findByToPersonId(@NonNull UUID toPersonId, @NonNull Pageable pageable);

  /**
   * Pagable find all PersonRelations not marked as deleted.
   */
  @NonNull
  Page<PersonRelation> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all PersonRelations marked as deleted.
   */
  @NonNull
  Page<PersonRelation> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete PersonRelation by id.
   */
  @Modifying
  @Transactional
  @Query("update PersonRelation p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
