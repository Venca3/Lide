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

import cz.vh.lide.db.entity.PersonTag;

import java.util.Optional;
import java.util.UUID;

public interface PersonTagRepository extends JpaRepository<PersonTag, UUID>, JpaSpecificationExecutor<PersonTag> {
  /**
   * Find PersonTag by id.
   */
  @NonNull
  Optional<PersonTag> findById(@NonNull UUID id);

  /**
   * Find PersonTag by Person id and Tag id
   */
  @NonNull
  Optional<PersonTag> findByPersonIdAndTagId(@NonNull UUID personId, @NonNull UUID tagId);

  /**
   * Find all PersonTags by Tag id.
   */
  @NonNull
  Page<PersonTag> findByTagId(@NonNull UUID tagId, @NonNull Pageable pageable);

  /**
   * Find all PersonTags by Person id.
   */
  @NonNull
  Page<PersonTag> findByPersonId(@NonNull UUID personId, @NonNull Pageable pageable);

  /**
   * Pagable find all PersonTags not marked as deleted.
   */
  @NonNull
  Page<PersonTag> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all PersonTags marked as deleted.
   */
  @NonNull
  Page<PersonTag> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete PersonTag by id.
   */
  @Modifying
  @Transactional
  @Query("update PersonTag p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}