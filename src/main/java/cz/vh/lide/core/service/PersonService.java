package cz.vh.lide.core.service;

import cz.vh.lide.core.tools.JpaTools;
import cz.vh.lide.db.dto.PersonDto;
import cz.vh.lide.db.entity.Person;
import cz.vh.lide.db.entity.PersonEntry;
import cz.vh.lide.db.entity.PersonRelation;
import cz.vh.lide.db.entity.PersonTag;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.PersonFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.PersonEntryRepository;
import cz.vh.lide.db.repository.PersonRelationsRepository;
import cz.vh.lide.db.repository.PersonRepository;
import cz.vh.lide.db.repository.PersonTagRepository;
import cz.vh.lide.db.specification.PersonSpecifications;
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
public class PersonService {

  private final PersonRepository repository;
  private final PersonEntryService personEntryService;
  private final PersonTagService personTagService;
  private final PersonRelationService personRelationService;
  private final DbMapper dbMapper;

  public PersonService(@NonNull PersonRepository repository,
      @NonNull PersonEntryService personEntryService,
      @NonNull PersonTagService personTagService,
      @NonNull PersonRelationService personRelationService,
      @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.personEntryService = personEntryService;
    this.personTagService = personTagService;
    this.personRelationService = personRelationService;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new person.
   * 
   * @param personDto person data.
   * 
   * @return created person with assigned ID.
   */
  @NonNull
  @Transactional
  public PersonDto create(@NonNull PersonDto personDto) {
    dbValidator.validateCreateEntity(personDto, "Person");

    Person person = dbMapper.toPersonEntity(personDto);
    if (person == null) {
      throw new FatalDbException("Mapping PersonDto to Person entity resulted in null");
    }

    for (var d : personDto.getPersonEntries()) {
      PersonEntry entityEntry;
      if (d.getId() == null) {
        var created = personEntryService.create(d);
        entityEntry = personEntryService.getEntity(created.getId());
      } else {
        entityEntry = personEntryService.getEntity(d.getId());
      }
      JpaTools.safeLink(person, entityEntry, Person::getPersonEntries, PersonEntry::setPerson);
    }

    for (var d : personDto.getPersonTags()) {
      PersonTag entityEntry;
      if (d.getId() == null) {
        var created = personTagService.create(d);
        entityEntry = personTagService.getEntity(created.getId());
      } else {
        entityEntry = personTagService.getEntity(d.getId());
      }
      JpaTools.safeLink(person, entityEntry, Person::getPersonTags, PersonTag::setPerson);
    }

    for (var d : personDto.getRelationsOut()) {
      PersonRelation entityEntry;
      if (d.getId() == null) {
        var created = personRelationService.create(d);
        entityEntry = personRelationService.getEntity(created.getId());
      } else {
        entityEntry = personRelationService.getEntity(d.getId());
      }
      JpaTools.safeLink(person, entityEntry, Person::getRelationsOut, PersonRelation::setFromPerson);
    }

    for (var d : personDto.getRelationsIn()) {
      PersonRelation entityEntry;
      if (d.getId() == null) {
        var created = personRelationService.create(d);
        entityEntry = personRelationService.getEntity(created.getId());
      } else {
        entityEntry = personRelationService.getEntity(d.getId());
      }
      JpaTools.safeLink(person, entityEntry, Person::getRelationsIn, PersonRelation::setToPerson);
    }

    var savedPerson = repository.save(person);

    return dbMapper.toPersonDto(savedPerson);
  }

  /**
   * Updates a person (scalar fields only).
   *
   * @param id person id.
   * @param personDto updated person data.
   *
   * @return updated person.
   */
  @NonNull
  @Transactional
  public PersonDto update(@NonNull UUID id, @NonNull PersonDto personDto) {
    var entity = getEntity(id);
    dbMapper.updatePersonFromDto(personDto, entity);

    if (entity == null) {
      throw new FatalDbException("Mapping update PersonDto to Person entity resulted in null");
    }

    var savedPerson = repository.save(entity);
    return dbMapper.toPersonDto(savedPerson);
  }

  /**
   * Get person by id.
   * 
   * @param id person id.
   * 
   * @return person data.
   */
  @NonNull
  public PersonDto get(@NonNull UUID id) {
    return dbMapper.toPersonDto(getEntity(id));
  }

  /**
   * List persons with paging and optional filtering.
   *
   * @param filter filter criteria (nullable)
   * @param pageable paging/sorting configuration
   *
   * @return page of person DTOs
   */
  @NonNull
  @Transactional(readOnly = true)
  public Page<PersonDto> list(@NonNull Pageable pageable, PersonFilter filter) {
    var spec = Objects.requireNonNull(PersonSpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toPersonDto);
  }

  /**
   * Soft delete person by id.
   * 
   * @param id person id.
   */
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "Person");
    UUID entityId = Objects.requireNonNull(entity.getId(), "Person id must not be null");
    
    repository.softDelete(entityId);
  }

  /**
   * Get person entity by id or throw exception if not found.
   * 
   * @param id person id.
   * 
   * @return person entity.
   */
  @NonNull
  private Person getEntity(@NonNull UUID id) {
    return repository.findById(id)
    .orElseThrow(() -> new IllegalArgumentException("Person with id %s not found".formatted(id)));
  }

}
