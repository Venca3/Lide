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

import cz.vh.lide.db.entity.Media;

import java.util.Optional;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID>, JpaSpecificationExecutor<Media> {
  /**
   * Find Media by id.
   */
  @NonNull
  Optional<Media> findById(@NonNull UUID id);

  /**
   * Pagable find all Entries not marked as deleted.
   */
  @NonNull
  Page<Media> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all Entries marked as deleted.
   */
  @NonNull
  Page<Media> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete Media by id.
   */
  @Modifying
  @Transactional
  @Query("update Media p set p.deletedAt = current_timestamp where p.id = :id and p.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
