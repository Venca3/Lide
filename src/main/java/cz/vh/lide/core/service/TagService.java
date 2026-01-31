package cz.vh.lide.core.service;

import cz.vh.lide.core.tools.JpaTools;
import cz.vh.lide.db.dto.TagDto;
import cz.vh.lide.db.entity.EntryTag;
import cz.vh.lide.db.entity.PersonTag;
import cz.vh.lide.db.entity.Tag;
import cz.vh.lide.db.exception.FatalDbException;
import cz.vh.lide.db.filter.TagFilter;
import cz.vh.lide.db.mapper.DbMapper;
import cz.vh.lide.db.repository.EntryTagRepository;
import cz.vh.lide.db.repository.PersonTagRepository;
import cz.vh.lide.db.repository.TagRepository;
import cz.vh.lide.db.specification.TagSpecifications;
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
public class TagService {

  private final TagRepository repository;
  private final EntryTagService entryTagService;
  private final PersonTagService personTagService;
  private final DbMapper dbMapper;

  public TagService(@NonNull TagRepository repository,
      @NonNull EntryTagService entryTagService,
      @NonNull PersonTagService personTagService,
      @NonNull DbMapper dbMapper) {
    this.repository = repository;
    this.entryTagService = entryTagService;
    this.personTagService = personTagService;
    this.dbMapper = dbMapper;
  }

  /**
   * Creates a new tag.
   *
   * @param tagDto tag data.
   *
   * @return created tag with assigned ID.
   */
  @NonNull
  @Transactional
  public TagDto create(@NonNull TagDto tagDto) {
    dbValidator.validateCreateEntity(tagDto, "Tag");

    Tag tag = dbMapper.toTagEntity(tagDto);
    if (tag == null) {
      throw new FatalDbException("Mapping TagDto to Tag entity resulted in null");
    }

    for (var d : tagDto.getEntryTags()) {
      EntryTag entityEntry;
      if (d.getId() == null) {
        var created = entryTagService.create(d);
        entityEntry = entryTagService.getEntity(created.getId());
      } else {
        entityEntry = entryTagService.getEntity(d.getId());
      }
      JpaTools.safeLink(tag, entityEntry, Tag::getEntryTags, EntryTag::setTag);
    }

    for (var d : tagDto.getPersonTags()) {
      PersonTag entityEntry;
      if (d.getId() == null) {
        var created = personTagService.create(d);
        entityEntry = personTagService.getEntity(created.getId());
      } else {
        entityEntry = personTagService.getEntity(d.getId());
      }
      JpaTools.safeLink(tag, entityEntry, Tag::getPersonTags, PersonTag::setTag);
    }

    var savedTag = repository.save(tag);
    return dbMapper.toTagDto(savedTag);
  }

  /**
   * Updates a tag (scalar fields only).
   *
   * @param id tag id.
   * @param tagDto updated tag data.
   *
   * @return updated tag.
   */
  @NonNull
  @Transactional
  public TagDto update(@NonNull UUID id, @NonNull TagDto tagDto) {
    var entity = getEntity(id);
    dbMapper.updateTagFromDto(tagDto, entity);

    if (entity == null) {
      throw new FatalDbException("Mapping update TagDto to Tag entity resulted in null");
    }

    var savedTag = repository.save(entity);
    return dbMapper.toTagDto(savedTag);
  }

  /**
   * Get tag by id.
   *
   * @param id tag id.
   *
   * @return tag data.
   */
  @NonNull
  public TagDto get(@NonNull UUID id) {
    return dbMapper.toTagDto(getEntity(id));
  }

  /**
   * List tags with paging and optional filtering.
   *
   * @param filter filter criteria (nullable)
   * @param pageable paging/sorting configuration
   *
   * @return page of tag DTOs
   */
  @NonNull
  public Page<TagDto> list(@NonNull Pageable pageable, TagFilter filter) {
    var spec = Objects.requireNonNull(TagSpecifications.build(filter), "Specification must not be null");
    return repository.findAll(spec, pageable)
        .map(dbMapper::toTagDto);
  }

  /**
   * Soft delete tag by id.
   *
   * @param id tag id.
   */
  public void softDelete(@NonNull UUID id) {
    var entity = getEntity(id);
    dbValidator.validateCanDeletedEntity(entity, "Tag");
    UUID entityId = Objects.requireNonNull(entity.getId(), "Tag id must not be null");
    repository.softDelete(entityId);
  }

  /**
   * Get tag entity by id or throw exception if not found.
   *
   * @param id tag id.
   *
   * @return tag entity.
   */
  @NonNull
  protected Tag getEntity(@NonNull UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Tag with id %s not found".formatted(id)));
  }
}
