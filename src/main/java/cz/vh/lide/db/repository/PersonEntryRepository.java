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

import cz.vh.lide.db.entity.PersonEntry;

import java.util.Optional;
import java.util.UUID;

public interface PersonEntryRepository extends JpaRepository<PersonEntry, UUID>, JpaSpecificationExecutor<PersonEntry> {
  /**
   * Find PersonEntry by id.
   */
  @NonNull
  Optional<PersonEntry> findById(@NonNull UUID id);

  /**
   * Find PersonEntry by Person id and Entry id and role.
   */
  @NonNull
  Optional<PersonEntry> findByPersonIdAndEntryIdAndRole(@NonNull UUID personId, @NonNull UUID entryId, @NonNull String role);

  /**
   * Find all PersonEntries by Person id and Entry id.
   */
  @NonNull
  Page<PersonEntry> findByPersonIdAndEntryId(@NonNull UUID personId, @NonNull UUID entryId, @NonNull Pageable pageable);

  /**
   * Find all PersonEntries by Entry id.
   */
  @NonNull
  Page<PersonEntry> findByEntryId(@NonNull UUID entryId, @NonNull Pageable pageable);

  /**
   * Find all PersonEntries by Person id.
   */
  @NonNull
  Page<PersonEntry> findByPersonId(@NonNull UUID personId, @NonNull Pageable pageable);

  /**
   * Pagable find all PersonEntries not marked as deleted.
   */
  @NonNull
  Page<PersonEntry> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all PersonEntries marked as deleted.
   */
  @NonNull
  Page<PersonEntry> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete PersonEntry by id.
   */
  @Modifying
  @Transactional
  @Query("update PersonEntry p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
