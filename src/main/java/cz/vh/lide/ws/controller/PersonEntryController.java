package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.Entry;
import cz.vh.lide.db.entity.Person;
import cz.vh.lide.db.entity.PersonEntry;
import cz.vh.lide.db.repository.EntryRepository;
import cz.vh.lide.db.repository.PersonEntryRepository;
import cz.vh.lide.db.repository.PersonRepository;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.PersonEntryDtos.EntryWithRole;
import cz.vh.lide.ws.dto.PersonEntryDtos.PersonWithRole;

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
 * REST controller for person-entry relation management.
 */
@RestController
@RequestMapping("/api/personentry")
public class PersonEntryController {

  private final PersonEntryRepository personEntryRepository;
  private final PersonRepository personRepository;
  private final EntryRepository entryRepository;

  /**
   * Creates the controller with required repositories.
   *
   * @param personEntryRepository person-entry repository
   * @param personRepository person repository
   * @param entryRepository entry repository
   */
  public PersonEntryController(PersonEntryRepository personEntryRepository,
      PersonRepository personRepository,
      EntryRepository entryRepository) {
    this.personEntryRepository = personEntryRepository;
    this.personRepository = personRepository;
    this.entryRepository = entryRepository;
  }

  /**
   * Lists entries linked to a person with roles (no pagination).
   *
   * @param personId person id
   *
   * @return list of entries with roles
   */
  @GetMapping("/person/{personId}/entries")
  public ResponseEntity<List<EntryWithRole>> listEntries(@PathVariable UUID personId) {
    var id = Objects.requireNonNull(personId, "personId");
    var links = personEntryRepository.findByPersonIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapEntries(links));
  }

  /**
   * Lists entries linked to a person with roles (pagination + sort).
   *
   * @param personId person id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of entries with roles and pagination headers
   */
  @GetMapping(value = "/person/{personId}/entries", params = {"page", "size"})
  public ResponseEntity<List<EntryWithRole>> listEntries(
      @PathVariable UUID personId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(personId, "personId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = personEntryRepository.findByPersonIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapEntries(pageRes.getContent()));
  }

  /**
   * Lists persons linked to an entry with roles (no pagination).
   *
   * @param entryId entry id
   *
   * @return list of persons with roles
   */
  @GetMapping("/entry/{entryId}/persons")
  public ResponseEntity<List<PersonWithRole>> listPersons(@PathVariable UUID entryId) {
    var id = Objects.requireNonNull(entryId, "entryId");
    var links = personEntryRepository.findByEntryIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapPersons(links));
  }

  /**
   * Lists persons linked to an entry with roles (pagination + sort).
   *
   * @param entryId entry id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of persons with roles and pagination headers
   */
  @GetMapping(value = "/entry/{entryId}/persons", params = {"page", "size"})
  public ResponseEntity<List<PersonWithRole>> listPersons(
      @PathVariable UUID entryId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(entryId, "entryId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = personEntryRepository.findByEntryIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapPersons(pageRes.getContent()));
  }

  /**
   * Adds a person-entry link (creates a new link even if a deleted link exists).
   *
   * @param personId person id
   * @param entryId entry id
   * @param role role value (required)
   *
   * @return 204 No Content
   */
  @PostMapping("/person/{personId}/entries/{entryId}")
  @Operation(summary = "Add person-entry link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> add(
      @PathVariable UUID personId,
      @PathVariable UUID entryId,
      @RequestParam(required = false) String role) {
    var pId = Objects.requireNonNull(personId, "personId");
    var eId = Objects.requireNonNull(entryId, "entryId");
    var roleValue = role == null ? null : role.trim();
    if (roleValue == null || roleValue.isBlank()) {
      throw new IllegalArgumentException("Role is required");
    }

    var existingActive = personEntryRepository.findByPersonIdAndEntryIdAndRoleAndDeletedAtIsNull(pId, eId, roleValue);
    if (existingActive.isPresent()) {
      return ResponseEntity.noContent().build();
    }

    var person = personRepository.findById(pId)
        .orElseThrow(() -> new IllegalArgumentException("Person not found"));
    var entry = entryRepository.findById(eId)
        .orElseThrow(() -> new IllegalArgumentException("Entry not found"));

    var link = new PersonEntry();
    link.setPerson(person);
    link.setEntry(entry);
    link.setRole(roleValue);
    personEntryRepository.save(link);
    return ResponseEntity.noContent().build();
  }

  /**
   * Removes a person-entry link (soft delete).
   *
   * @param personId person id
   * @param entryId entry id
   * @param role role value (required)
   *
   * @return 204 No Content
   */
  @DeleteMapping("/person/{personId}/entries/{entryId}")
  @Operation(summary = "Remove person-entry link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> remove(@PathVariable UUID personId,
      @PathVariable UUID entryId,
      @RequestParam(required = false) String role) {
    var pId = Objects.requireNonNull(personId, "personId");
    var eId = Objects.requireNonNull(entryId, "entryId");
    var roleValue = role == null ? null : role.trim();
    if (roleValue == null || roleValue.isBlank()) {
      throw new IllegalArgumentException("Role is required");
    }

    var link = personEntryRepository.findByPersonIdAndEntryIdAndRoleAndDeletedAtIsNull(pId, eId, roleValue)
        .orElseThrow(() -> new IllegalArgumentException("PersonEntry link not found"));
    personEntryRepository.softDelete(Objects.requireNonNull(link.getId(), "link id"));

    return ResponseEntity.noContent().build();
  }

  private List<EntryWithRole> mapEntries(List<PersonEntry> links) {
    var entryIds = links.stream()
        .map(l -> l.getEntry() != null ? l.getEntry().getId() : null)
        .filter(Objects::nonNull)
        .toList();
    if (entryIds.isEmpty()) {
      return List.of();
    }
    Map<UUID, Entry> entriesById = entryRepository.findAllById(entryIds).stream()
        .filter(e -> e.getDeletedAt() == null)
        .collect(Collectors.toMap(Entry::getId, Function.identity()));
    return links.stream()
        .filter(l -> l.getEntry() != null && entriesById.containsKey(l.getEntry().getId()))
        .map(l -> {
          var e = entriesById.get(l.getEntry().getId());
          return new EntryWithRole(e.getId(), e.getType(), e.getTitle(), e.getContent(), e.getOccurredAt(), l.getRole());
        })
        .toList();
  }

  private List<PersonWithRole> mapPersons(List<PersonEntry> links) {
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
    return links.stream()
        .filter(l -> l.getPerson() != null && personsById.containsKey(l.getPerson().getId()))
        .map(l -> {
          var p = personsById.get(l.getPerson().getId());
          return new PersonWithRole(p.getId(), p.getFirstName(), p.getLastName(), p.getNickname(),
              p.getBirthDate(), p.getPhone(), p.getEmail(), p.getNote(), l.getRole());
        })
        .toList();
  }
}
