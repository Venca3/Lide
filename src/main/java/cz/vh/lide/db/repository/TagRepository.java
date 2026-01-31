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

import cz.vh.lide.db.entity.Tag;

import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID>, JpaSpecificationExecutor<Tag> {
  /**
   * Find tag by id.
   */
  @NonNull
  Optional<Tag> findById(@NonNull UUID id);

  /**
   * Pagable find all persons not marked as deleted.
   */
  @NonNull
  Page<Tag> findByDeletedAtIsNull(@NonNull Pageable pageable);

  /**
   * Pagable find all persons marked as deleted.
   */
  @NonNull
  Page<Tag> findByDeletedAtIsNotNull(@NonNull Pageable pageable);

  /**
   * Soft delete tag by id.
   */
  @Modifying
  @Transactional
  @Query("update Tag t set t.deletedAt = current_timestamp where t.id = :id and t.deletedAt is null")
  int softDelete(@Param("id") @NonNull UUID id);
}
