package cz.vh.lide.db.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.lang.NonNull;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import cz.vh.lide.db.entity.MediaEntry;

public interface MediaEntryRepository extends JpaRepository<MediaEntry, UUID>, JpaSpecificationExecutor<MediaEntry> {
  /**
   * Find MediaEntry by id.
   */
  @NonNull
  Optional<MediaEntry> findById(@NonNull UUID id);

  /**
   * Find MediaEntry by Media id and Entry id.
   */
  @NonNull
  Optional<MediaEntry> findByEntryIdAndMediaId(@NonNull UUID entryId, @NonNull UUID mediaId);

  /**
   * Find all MediaEntries by Media id.
   */
  @NonNull
  Page<MediaEntry> findByMediaId(@NonNull UUID mediaId, @NonNull Pageable pageable);

  /**
   * Find all MediaEntries by Entry id.
   */
  @NonNull
  Page<MediaEntry> findByEntryId(@NonNull UUID entryId, @NonNull Pageable pageable);

  /**
   * Pagable find all MediaEntries not marked as deleted.
   */
  @NonNull
  Page<MediaEntry> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all MediaEntries marked as deleted.
   */
  @NonNull
  Page<MediaEntry> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete MediaEntry by id.
   */
  @Modifying
  @Transactional
  @Query("update MediaEntry p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
