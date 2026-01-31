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

import cz.vh.lide.db.entity.Entry;

import java.util.Optional;
import java.util.UUID;

public interface EntryRepository extends JpaRepository<Entry, UUID>, JpaSpecificationExecutor<Entry> {
  /**
   * Find Entry by id.
   */
  @NonNull
  Optional<Entry> findById(@NonNull UUID id);

  /**
   * Pagable find all Entries not marked as deleted.
   */
  @NonNull
  Page<Entry> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all Entries marked as deleted.
   */
  @NonNull
  Page<Entry> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete Entry by id.
   */
  @Modifying
  @Transactional
  @Query("update Entry p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
