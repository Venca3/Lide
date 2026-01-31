package cz.vh.lide.core.service;

import cz.vh.lide.db.dto.MediaEntryDto;
import cz.vh.lide.db.entity.MediaEntry;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.MediaEntryFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.MediaEntryRepository;
import cz.vh.lide.db.specification.MediaEntrySpecifications;
import cz.vh.lide.db.validator.dbValidator;
import java.util.Objects;
import java.util.UUID;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@SuppressWarnings("unused")
public class MediaEntryService {

  private final MediaEntryRepository repository;
  private final DbMapper dbMapper;

  public MediaEntryService(@NonNull MediaEntryRepository repository, @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new media-entry relation.
   *
   * @param mediaEntryDto relation data.
   *
   * @return created relation with assigned ID.
   */
  @NonNull
  @Transactional
  public MediaEntryDto create(@NonNull MediaEntryDto mediaEntryDto) {
    dbValidator.validateCreateEntity(mediaEntryDto, "MediaEntry");

    MediaEntry mediaEntry = dbMapper.toMediaEntryEntity(mediaEntryDto);
    if (mediaEntry == null) {
      throw new FatalDbException("Mapping MediaEntryDto to MediaEntry entity resulted in null");
    }

    // links are never created in binding entities

    var savedMediaEntry = repository.save(mediaEntry);
    return dbMapper.toMediaEntryDto(savedMediaEntry);
  }

  /**
   * Get media-entry relation by id.
   *
   * @param id relation id.
   *
   * @return relation data.
   */
  @NonNull
  public MediaEntryDto get(@NonNull UUID id) {
    return dbMapper.toMediaEntryDto(getEntity(id));
  }

  /**
   * List media-entry relations with paging and optional filtering.
   *
   * @param pageable paging/sorting configuration
   * @param filter filter criteria (nullable)
   *
   * @return page of media-entry DTOs
   */
  @NonNull
  public Page<MediaEntryDto> list(@NonNull Pageable pageable, MediaEntryFilter filter) {
    var spec = Objects.requireNonNull(MediaEntrySpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toMediaEntryDto);
  }

  /**
   * Soft delete media-entry relation by id.
   *
   * @param id relation id.
   */
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "MediaEntry");
    UUID entityId = Objects.requireNonNull(entity.getId(), "MediaEntry id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get media-entry entity by id or throw exception if not found.
   *
   * @param id relation id.
   *
   * @return relation entity.
   */
  @NonNull
  protected MediaEntry getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("MediaEntry with id %s not found".formatted(id)));
  }
}
