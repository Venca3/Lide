package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.Person;
import cz.vh.lide.db.entity.PersonTag;
import cz.vh.lide.db.entity.Tag;
import cz.vh.lide.db.repository.PersonRepository;
import cz.vh.lide.db.repository.PersonTagRepository;
import cz.vh.lide.db.repository.TagRepository;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.PersonDtos.PersonView;
import cz.vh.lide.ws.dto.TagDtos.TagView;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * REST controller for person-tag relation management.
 */
@RestController
@RequestMapping("/api/personstags")
public class PersonTagController {

  private final PersonTagRepository personTagRepository;
  private final PersonRepository personRepository;
  private final TagRepository tagRepository;

  /**
   * Creates the controller with required repositories.
   *
   * @param personTagRepository person-tag repository
   * @param personRepository person repository
   * @param tagRepository tag repository
   */
  public PersonTagController(PersonTagRepository personTagRepository,
      PersonRepository personRepository,
      TagRepository tagRepository) {
    this.personTagRepository = personTagRepository;
    this.personRepository = personRepository;
    this.tagRepository = tagRepository;
  }

  /**
   * Lists tags linked to a person without pagination.
   *
   * @param personId person id
   *
   * @return list of tags
   */
  @GetMapping("/person/{personId}/tags")
  public ResponseEntity<List<TagView>> list(@PathVariable UUID personId) {
    var id = Objects.requireNonNull(personId, "personId");
    var links = personTagRepository.findByPersonIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapTags(links));
  }

  /**
   * Lists tags linked to a person with pagination and sorting.
   *
   * @param personId person id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of tags with pagination headers
   */
  @GetMapping(value = "/person/{personId}/tags", params = {"page", "size"})
  public ResponseEntity<List<TagView>> list(
      @PathVariable UUID personId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(personId, "personId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = personTagRepository.findByPersonIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapTags(pageRes.getContent()));
  }

  /**
   * Lists persons linked to a tag without pagination.
   *
   * @param tagId tag id
   *
   * @return list of persons
   */
  @GetMapping("/tag/{tagId}/persons")
  public ResponseEntity<List<PersonView>> personsByTag(@PathVariable UUID tagId) {
    var id = Objects.requireNonNull(tagId, "tagId");
    var links = personTagRepository.findByTagIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapPersons(links));
  }

  /**
   * Lists persons linked to a tag with pagination and sorting.
   *
   * @param tagId tag id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of persons with pagination headers
   */
  @GetMapping(value = "/tag/{tagId}/persons", params = {"page", "size"})
  public ResponseEntity<List<PersonView>> personsByTag(
      @PathVariable UUID tagId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(tagId, "tagId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = personTagRepository.findByTagIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapPersons(pageRes.getContent()));
  }

  /**
   * Adds a tag to a person (creates a new link even if a deleted link exists).
   *
   * @param personId person id
   * @param tagId tag id
   *
   * @return 204 No Content
   */
  @PostMapping("/person/{personId}/tag/{tagId}")
  @Operation(summary = "Add person-tag link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> add(@PathVariable UUID personId, @PathVariable UUID tagId) {
    var pId = Objects.requireNonNull(personId, "personId");
    var tId = Objects.requireNonNull(tagId, "tagId");

    var existingActive = personTagRepository.findByPersonIdAndTagIdAndDeletedAtIsNull(pId, tId);
    if (existingActive.isPresent()) {
      return ResponseEntity.noContent().build();
    }

    var person = personRepository.findById(pId)
        .orElseThrow(() -> new IllegalArgumentException("Person not found"));
    var tag = tagRepository.findById(tId)
        .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

    var link = new PersonTag();
    link.setPerson(person);
    link.setTag(tag);
    personTagRepository.save(link);
    return ResponseEntity.noContent().build();
  }

  /**
   * Removes a tag from a person (soft delete link).
   *
   * @param personId person id
   * @param tagId tag id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/person/{personId}/tag/{tagId}")
  @Operation(summary = "Remove person-tag link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> remove(@PathVariable UUID personId, @PathVariable UUID tagId) {
    var pId = Objects.requireNonNull(personId, "personId");
    var tId = Objects.requireNonNull(tagId, "tagId");
    var link = personTagRepository.findByPersonIdAndTagIdAndDeletedAtIsNull(pId, tId)
        .orElseThrow(() -> new IllegalArgumentException("PersonTag link not found"));
    personTagRepository.softDelete(Objects.requireNonNull(link.getId(), "link id"));
    return ResponseEntity.noContent().build();
  }

  private List<TagView> mapTags(List<PersonTag> links) {
    var tagIds = links.stream()
        .map(l -> l.getTag() != null ? l.getTag().getId() : null)
        .filter(Objects::nonNull)
        .toList();
    if (tagIds.isEmpty()) {
      return List.of();
    }
    Map<UUID, Tag> tagsById = tagRepository.findAllById(tagIds).stream()
        .filter(t -> t.getDeletedAt() == null)
        .collect(Collectors.toMap(Tag::getId, Function.identity()));
    return tagIds.stream()
        .map(tagsById::get)
        .filter(Objects::nonNull)
        .map(t -> new TagView(t.getId(), t.getName()))
        .toList();
  }

  private List<PersonView> mapPersons(List<PersonTag> links) {
    var personIds = links.stream()
        .map(l -> l.getPerson() != null ? l.getPerson().getId() : null)
        .filter(Objects::nonNull)
        .toList();
    if (personIds.isEmpty()) {
      return List.of();
    }
    Map<UUID, Person> personsById = personRepository.findAllById(personIds).stream()
        .filter(p -> p.getDeletedAt() == null)
        .collect(Collectors.toMap(Person::getId, Function.identity()));
    return personIds.stream()
        .map(personsById::get)
        .filter(Objects::nonNull)
        .map(p -> new PersonView(p.getId(), p.getFirstName(), p.getLastName(), p.getNickname(),
            p.getBirthDate(), p.getPhone(), p.getEmail(), p.getNote()))
        .toList();
  }
}
