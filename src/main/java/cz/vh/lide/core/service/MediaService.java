package cz.vh.lide.core.service;

import cz.vh.lide.core.tools.JpaTools;
import cz.vh.lide.db.dto.MediaDto;
import cz.vh.lide.db.dto.MediaEntryDto;
import cz.vh.lide.db.entity.Media;
import cz.vh.lide.db.entity.MediaEntry;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.MediaFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.MediaEntryRepository;
import cz.vh.lide.db.repository.MediaRepository;
import cz.vh.lide.db.specification.MediaSpecifications;
import cz.vh.lide.db.validator.dbValidator;
import java.util.Objects;
import java.util.UUID;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing media and their relations to entries.
 */
@Service
@Transactional(readOnly = true)
@SuppressWarnings("unused")
public class MediaService {

  private final MediaRepository repository;
  private final MediaEntryRepository mediaEntryRepository;
  private final MediaEntryService mediaEntryService;
  private final DbMapper dbMapper;

  /**
   * Creates the service with required dependencies.
   *
   * @param repository media repository
   * @param mediaEntryRepository media-entry repository
   * @param mediaEntryService media-entry relation service
   * @param dbMapper mapper between DTOs and entities
   */
  public MediaService(@NonNull MediaRepository repository,
      @NonNull MediaEntryRepository mediaEntryRepository,
      @NonNull MediaEntryService mediaEntryService,
      @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.mediaEntryRepository = mediaEntryRepository;
    this.mediaEntryService = mediaEntryService;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new media.
   *
   * @param dto media data.
   *
   * @return created media with assigned ID.
   */
  @NonNull
  @Transactional
  public MediaDto create(@NonNull MediaDto dto) {
    // 1) Validate input DTO for creation
    dbValidator.validateCreateEntity(dto, "Media");

    // 2) Map DTO to entity
    Media entity = dbMapper.toMediaEntity(dto);
    if (entity == null) {
      throw new FatalDbException("Mapping MediaDto to Media entity resulted in null");
    }

    // 3) Create/link media-entry relations
    for (var d : dto.getMediaEntries()) {
      MediaEntry entityMediaEntry;
      if (d.getId() == null) {
        MediaEntryDto created = mediaEntryService.create(d);
        entityMediaEntry = mediaEntryService.getEntity(created.getId());
      } else {
        entityMediaEntry = mediaEntryService.getEntity(d.getId());
      }
      JpaTools.safeLink(entity, entityMediaEntry, Media::getMediaEntries, MediaEntry::setMedia);
    }

    // 4) Persist and return DTO
    var savedEntity = repository.save(entity);
    return dbMapper.toMediaDto(savedEntity);
  }

  /**
   * Updates a media (scalar fields only).
   *
   * @param id media id.
   * @param dto updated media data.
   *
   * @return updated media.
   */
  @NonNull
  @Transactional
  public MediaDto update(@NonNull UUID id, @NonNull MediaDto dto) {
    var entity = getEntity(id);
    dbMapper.updateMediaFromDto(dto, entity);

    if (entity == null) {
      throw new FatalDbException("Mapping update MediaDto to Media entity resulted in null");
    }

    var savedEntity = repository.save(entity);
    return dbMapper.toMediaDto(savedEntity);
  }

  /**
   * Get media by id.
   *
   * @param id media id.
   *
   * @return media data.
   */
  @NonNull
  public MediaDto get(@NonNull UUID id) {
    return dbMapper.toMediaDto(getEntity(id));
  }

  /**
   * List media with paging and optional filtering.
   *
   * @param filter filter criteria (nullable)
   * @param pageable paging/sorting configuration
   *
   * @return page of media DTOs
   */
  @NonNull
  public Page<MediaDto> list(@NonNull Pageable pageable, MediaFilter filter) {
    var spec = Objects.requireNonNull(MediaSpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toMediaDto);
  }

  /**
   * Soft delete media by id.
   *
   * @param id media id.
   */
  @Transactional
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "Media");
    UUID entityId = Objects.requireNonNull(entity.getId(), "Media id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get media entity by id or throw exception if not found.
   *
   * @param id media id.
   *
   * @return media entity.
   */
  @NonNull
  private Media getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Media with id %s not found".formatted(id)));
  }
}
