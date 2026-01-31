package cz.vh.lide.core.service;

import cz.vh.lide.core.tools.JpaTools;
import cz.vh.lide.db.dto.EntryDto;
import cz.vh.lide.db.filter.EntryFilter;
import cz.vh.lide.db.entity.Entry;
import cz.vh.lide.db.entity.EntryTag;
import cz.vh.lide.db.entity.MediaEntry;
import cz.vh.lide.db.entity.PersonEntry;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.EntryRepository;
import cz.vh.lide.db.specification.EntrySpecifications;
import cz.vh.lide.db.validator.dbValidator;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.NonNull;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@SuppressWarnings("unused")
public class EntryService {

  private final EntryRepository repository;
  private final EntryTagService entryTagService;
  private final PersonEntryService personEntryService;
  private final MediaEntryService mediaEntryService;
  private final DbMapper dbMapper;

  public EntryService(@NonNull EntryRepository repository,
      @NonNull EntryTagService entryTagService,
      @NonNull PersonEntryService personEntryService,
      @NonNull MediaEntryService mediaEntryService,
      @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.entryTagService = entryTagService;
    this.personEntryService = personEntryService;
    this.mediaEntryService = mediaEntryService;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new entry.
   *
   * @param entryDto entry data.
   *
   * @return created entry with assigned ID.
   */
  @NonNull
  @Transactional
  public EntryDto create(@NonNull EntryDto entryDto) {
    dbValidator.validateCreateEntity(entryDto, "Entry");

    Entry entry = dbMapper.toEntryEntity(entryDto);
    if (entry == null) {
      throw new FatalDbException("Mapping EntryDto to Entry entity resulted in null");
    }

    for (var d : entryDto.getEntryTags()) {
      EntryTag entityEntry;
      if (d.getId() == null) {
        var created = entryTagService.create(d);
        entityEntry = entryTagService.getEntity(created.getId());
      } else {
        entityEntry = entryTagService.getEntity(d.getId());
      }
      JpaTools.safeLink(entry, entityEntry, Entry::getEntryTags, EntryTag::setEntry);
    }

    for (var d : entryDto.getPersonEntries()) {
      PersonEntry entityEntry;
      if (d.getId() == null) {
        var created = personEntryService.create(d);
        entityEntry = personEntryService.getEntity(created.getId());
      } else {
        entityEntry = personEntryService.getEntity(d.getId());
      }
      JpaTools.safeLink(entry, entityEntry, Entry::getPersonEntries, PersonEntry::setEntry);
    }

    for (var d : entryDto.getMediaEntries()) {
      MediaEntry entityEntry;
      if (d.getId() == null) {
        var created = mediaEntryService.create(d);
        entityEntry = mediaEntryService.getEntity(created.getId());
      } else {
        entityEntry = mediaEntryService.getEntity(d.getId());
      }
      JpaTools.safeLink(entry, entityEntry, Entry::getMediaEntries, MediaEntry::setEntry);
    }

    var savedEntry = repository.save(entry);
    return dbMapper.toEntryDto(savedEntry);
  }

  /**
   * Updates an entry (scalar fields only).
   *
   * @param id entry id.
   * @param entryDto updated entry data.
   *
   * @return updated entry.
   */
  @NonNull
  @Transactional
  public EntryDto update(@NonNull UUID id, @NonNull EntryDto entryDto) {
    var entity = getEntity(id);
    dbMapper.updateEntryFromDto(entryDto, entity);

    if (entity == null) {
      throw new FatalDbException("Mapping update EntryDto to Entry entity resulted in null");
    }

    var savedEntry = repository.save(entity);
    return dbMapper.toEntryDto(savedEntry);
  }

  /**
   * Get entry by id.
   *
   * @param id entry id.
   *
   * @return entry data.
   */
  @NonNull
  public EntryDto get(@NonNull UUID id) {
    return dbMapper.toEntryDto(getEntity(id));
  }

  /**
   * Get entry list page not deleted.
   * 
   * @return list of entries.
   */
  @NonNull
  @Transactional(readOnly = true)
  public List<EntryDto> listNotDeleted() {
    Pageable pageable = Pageable.unpaged();
    var entities = repository.findByDeletedAtIsNull(pageable);
    return entities.stream()
        .map(dbMapper::toEntryDto)
        .toList();
  }

  /**
   * Get entry list pageable and filtered.
   *
   * @param filter filter criteria (nullable)
   * @param pageable paging/sorting configuration
   *
   * @return page of entry DTOs
   */
  @NonNull
  @Transactional(readOnly = true)
  public Page<EntryDto> list(@NonNull Pageable pageable, EntryFilter filter) {
    var spec = Objects.requireNonNull(EntrySpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toEntryDto);
  }

  /**
   * Soft delete entry by id.
   *
   * @param id entry id.
   */
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "Entry");
    UUID entityId = Objects.requireNonNull(entity.getId(), "Entry id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get entry entity by id or throw exception if not found.
   *
   * @param id entry id.
   *
   * @return entry entity.
   */
  @NonNull
  private Entry getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Entry with id %s not found".formatted(id)));
  }

}
