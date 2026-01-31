package cz.vh.lide.core.service;

import cz.vh.lide.db.dto.PersonRelationDto;
import cz.vh.lide.db.entity.PersonRelation;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.PersonRelationFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.PersonRelationsRepository;
import cz.vh.lide.db.specification.PersonRelationSpecifications;
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
public class PersonRelationService {

  private final PersonRelationsRepository repository;
  private final DbMapper dbMapper;

  public PersonRelationService(@NonNull PersonRelationsRepository repository, @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new person relation.
   *
   * @param personRelationDto relation data.
   *
   * @return created relation with assigned ID.
   */
  @NonNull
  @Transactional
  public PersonRelationDto create(@NonNull PersonRelationDto personRelationDto) {
    dbValidator.validateCreateEntity(personRelationDto, "PersonRelation");

    PersonRelation personRelation = dbMapper.toPersonRelationEntity(personRelationDto);
    if (personRelation == null) {
      throw new FatalDbException("Mapping PersonRelationDto to PersonRelation entity resulted in null");
    }

    // links are never created in binding entities

    var savedRelation = repository.save(personRelation);
    return dbMapper.toPersonRelationDto(savedRelation);
  }

  /**
   * Get person relation by id.
   *
   * @param id relation id.
   *
   * @return relation data.
   */
  @NonNull
  public PersonRelationDto get(@NonNull UUID id) {
    return dbMapper.toPersonRelationDto(getEntity(id));
  }

  /**
   * List person relations with paging and optional filtering.
   *
   * @param pageable paging/sorting configuration
   * @param filter filter criteria (nullable)
   *
   * @return page of relation DTOs
   */
  @NonNull
  public Page<PersonRelationDto> list(@NonNull Pageable pageable, PersonRelationFilter filter) {
    var spec = Objects.requireNonNull(PersonRelationSpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toPersonRelationDto);
  }

  /**
   * Soft delete person relation by id.
   *
   * @param id relation id.
   */
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "PersonRelation");
    UUID entityId = Objects.requireNonNull(entity.getId(), "PersonRelation id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get person relation entity by id or throw exception if not found.
   *
   * @param id relation id.
   *
   * @return relation entity.
   */
  @NonNull
  protected PersonRelation getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("PersonRelation with id %s not found".formatted(id)));
  }
}
