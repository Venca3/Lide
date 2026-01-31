package cz.vh.lide.core.service;

import cz.vh.lide.db.dto.PersonTagDto;
import cz.vh.lide.db.entity.PersonTag;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.PersonTagFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.PersonTagRepository;
import cz.vh.lide.db.specification.PersonTagSpecifications;
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
public class PersonTagService {

  private final PersonTagRepository repository;
  private final DbMapper dbMapper;

  public PersonTagService(@NonNull PersonTagRepository repository, @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new person-tag relation.
   *
   * @param personTagDto relation data.
   *
   * @return created relation with assigned ID.
   */
  @NonNull
  @Transactional
  public PersonTagDto create(@NonNull PersonTagDto personTagDto) {
    dbValidator.validateCreateEntity(personTagDto, "PersonTag");

    PersonTag personTag = dbMapper.toPersonTagEntity(personTagDto);
    if (personTag == null) {
      throw new FatalDbException("Mapping PersonTagDto to PersonTag entity resulted in null");
    }

    // links are never created in binding entities

    var savedPersonTag = repository.save(personTag);
    return dbMapper.toPersonTagDto(savedPersonTag);
  }

  /**
   * Get person-tag relation by id.
   *
   * @param id relation id.
   *
   * @return relation data.
   */
  @NonNull
  public PersonTagDto get(@NonNull UUID id) {
    return dbMapper.toPersonTagDto(getEntity(id));
  }

  /**
   * List person-tag relations with paging and optional filtering.
   *
   * @param pageable paging/sorting configuration
   * @param filter filter criteria (nullable)
   *
   * @return page of person-tag DTOs
   */
  @NonNull
  @Transactional(readOnly = true)
  public Page<PersonTagDto> list(@NonNull Pageable pageable, PersonTagFilter filter) {
    var spec = Objects.requireNonNull(PersonTagSpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toPersonTagDto);
  }

  /**
   * Soft delete person-tag relation by id.
   *
   * @param id relation id.
   */
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "PersonTag");
    UUID entityId = Objects.requireNonNull(entity.getId(), "PersonTag id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get person-tag entity by id or throw exception if not found.
   *
   * @param id relation id.
   *
   * @return relation entity.
   */
  @NonNull
  protected PersonTag getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("PersonTag with id %s not found".formatted(id)));
  }
}
