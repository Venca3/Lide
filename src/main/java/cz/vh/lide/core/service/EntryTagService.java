package cz.vh.lide.core.service;

import cz.vh.lide.db.dto.EntryTagDto;
import cz.vh.lide.db.entity.EntryTag;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.EntryTagFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.EntryTagRepository;
import cz.vh.lide.db.specification.EntryTagSpecifications;
import cz.vh.lide.db.validator.dbValidator;
import java.util.Objects;
import java.util.UUID;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing entry-tag relations.
 */
@Service
@Transactional(readOnly = true)
@SuppressWarnings("unused")
public class EntryTagService {

  private final EntryTagRepository repository;
  private final DbMapper dbMapper;

  /**
   * Creates the service with required dependencies.
   *
   * @param repository entry-tag repository
   * @param dbMapper mapper between DTOs and entities
   */
  public EntryTagService(@NonNull EntryTagRepository repository, @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new entry-tag relation.
   *
   * @param entryTagDto relation data.
   *
   * @return created relation with assigned ID.
   */
  @NonNull
  @Transactional
  public EntryTagDto create(@NonNull EntryTagDto entryTagDto) {
    dbValidator.validateCreateEntity(entryTagDto, "EntryTag");

    EntryTag entryTag = dbMapper.toEntryTagEntity(entryTagDto);
    if (entryTag == null) {
      throw new FatalDbException("Mapping EntryTagDto to EntryTag entity resulted in null");
    }

    // links are never created in binding entities

    var savedEntryTag = repository.save(entryTag);
    return dbMapper.toEntryTagDto(savedEntryTag);
  }

  /**
   * Get entry-tag relation by id.
   *
   * @param id relation id.
   *
   * @return relation data.
   */
  @NonNull
  public EntryTagDto get(@NonNull UUID id) {
    return dbMapper.toEntryTagDto(getEntity(id));
  }

  /**
   * List entry-tag relations with paging and optional filtering.
   *
   * @param pageable paging/sorting configuration
   * @param filter filter criteria (nullable)
   *
   * @return page of entry-tag DTOs
   */
  @NonNull
  public Page<EntryTagDto> list(@NonNull Pageable pageable, EntryTagFilter filter) {
    var spec = Objects.requireNonNull(EntryTagSpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toEntryTagDto);
  }

  /**
   * Soft delete entry-tag relation by id.
   *
   * @param id relation id.
   */
  @Transactional
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "EntryTag");
    UUID entityId = Objects.requireNonNull(entity.getId(), "EntryTag id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get entry-tag entity by id or throw exception if not found.
   *
   * @param id relation id.
   *
   * @return relation entity.
   */
  @NonNull
  protected EntryTag getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("EntryTag with id %s not found".formatted(id)));
  }
}
