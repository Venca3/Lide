package cz.vh.lide.core.service;

import cz.vh.lide.db.dto.PersonEntryDto;
import cz.vh.lide.db.entity.PersonEntry;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.PersonEntryFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.PersonEntryRepository;
import cz.vh.lide.db.specification.PersonEntrySpecifications;
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
public class PersonEntryService {

  private final PersonEntryRepository repository;
  private final DbMapper dbMapper;

  public PersonEntryService(@NonNull PersonEntryRepository repository, @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new person-entry relation.
   *
   * @param personEntryDto relation data.
   *
   * @return created relation with assigned ID.
   */
  @NonNull
  @Transactional
  public PersonEntryDto create(@NonNull PersonEntryDto personEntryDto) {
    dbValidator.validateCreateEntity(personEntryDto, "PersonEntry");

    PersonEntry personEntry = dbMapper.toPersonEntryEntity(personEntryDto);
    if (personEntry == null) {
      throw new FatalDbException("Mapping PersonEntryDto to PersonEntry entity resulted in null");
    }

    // links are never created in binding entities

    var savedPersonEntry = repository.save(personEntry);
    return dbMapper.toPersonEntryDto(savedPersonEntry);
  }

  /**
   * Get person-entry relation by id.
   *
   * @param id relation id.
   *
   * @return relation data.
   */
  @NonNull
  public PersonEntryDto get(@NonNull UUID id) {
    return dbMapper.toPersonEntryDto(getEntity(id));
  }

  /**
   * List person-entry relations with paging and optional filtering.
   *
   * @param pageable paging/sorting configuration
   * @param filter filter criteria (nullable)
   *
   * @return page of person-entry DTOs
   */
  @NonNull
  @Transactional(readOnly = true)
  public Page<PersonEntryDto> list(@NonNull Pageable pageable, PersonEntryFilter filter) {
    var spec = Objects.requireNonNull(PersonEntrySpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toPersonEntryDto);
  }

  /**
   * Soft delete person-entry relation by id.
   *
   * @param id relation id.
   */
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "PersonEntry");
    UUID entityId = Objects.requireNonNull(entity.getId(), "PersonEntry id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get person-entry entity by id or throw exception if not found.
   *
   * @param id relation id.
   *
   * @return relation entity.
   */
  @NonNull
  protected PersonEntry getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("PersonEntry with id %s not found".formatted(id)));
  }
}
