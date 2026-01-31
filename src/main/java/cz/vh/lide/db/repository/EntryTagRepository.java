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

import cz.vh.lide.db.entity.EntryTag;

import java.util.Optional;
import java.util.UUID;

public interface EntryTagRepository extends JpaRepository<EntryTag, UUID>, JpaSpecificationExecutor<EntryTag> {
  /**
   * Find EntryTag by id.
   */
  @NonNull
  Optional<EntryTag> findById(@NonNull UUID id);

  /**
   * Find EntryTag by Entry id and Tag id.
   */
  @NonNull
  Optional<EntryTag> findByEntryIdAndTagId(@NonNull UUID entryId, @NonNull UUID tagId);

  /**
   * Find all EntryTags by Entry id.
   */
  @NonNull
  Page<EntryTag> findByEntryId(@NonNull UUID entryId, @NonNull Pageable pageable);

  /**
   * Find all EntryTags by Tag id.
   */
  @NonNull
  Page<EntryTag> findByTagId(@NonNull UUID tagId, @NonNull Pageable pageable);

  /**
   * Pagable find all Entries not marked as deleted.
   */
  @NonNull
  Page<EntryTag> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all Entries marked as deleted.
   */
  @NonNull
  Page<EntryTag> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete EntryTag by id.
   */
  @Modifying
  @Transactional
  @Query("update EntryTag p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
