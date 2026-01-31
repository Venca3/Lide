package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.PersonEntry;
import cz.vh.lide.db.repository.EntryRepository;
import cz.vh.lide.db.repository.PersonEntryRepository;
import cz.vh.lide.db.repository.PersonRepository;
import cz.vh.lide.ws.dto.PersonEntryDtos.EntryWithRole;
import cz.vh.lide.ws.dto.PersonEntryDtos.PersonWithRole;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/personentry")
public class PersonEntryController {

  private final PersonEntryRepository personEntryRepository;
  private final PersonRepository personRepository;
  private final EntryRepository entryRepository;

  public PersonEntryController(PersonEntryRepository personEntryRepository,
      PersonRepository personRepository,
      EntryRepository entryRepository) {
    this.personEntryRepository = personEntryRepository;
    this.personRepository = personRepository;
    this.entryRepository = entryRepository;
  }

  // person -> entries (s role)
  @GetMapping("/person/{personId}/entries")
  public ResponseEntity<List<EntryWithRole>> listEntries(@PathVariable UUID personId) {
    var id = java.util.Objects.requireNonNull(personId, "personId");
    var links = personEntryRepository.findByPersonId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream().filter(l -> l.getDeletedAt() == null).toList();
    var entryIds = links.stream().map(l -> l.getEntry().getId()).toList();
    var entriesById = entryRepository.findAllById(java.util.Objects.requireNonNull(entryIds)).stream()
        .filter(e -> e.getDeletedAt() == null)
        .collect(java.util.stream.Collectors.toMap(e -> e.getId(), java.util.function.Function.identity()));
    var entries = links.stream()
        .filter(l -> entriesById.containsKey(l.getEntry().getId()))
        .map(l -> {
          var e = entriesById.get(l.getEntry().getId());
          return new EntryWithRole(e.getId(), e.getType(), e.getTitle(), e.getContent(), e.getOccurredAt(), l.getRole());
        })
        .toList();
    return ResponseEntity.ok(entries);
  }

  // entry -> persons (s role)
  @GetMapping("/entry/{entryId}/persons")
  public ResponseEntity<List<PersonWithRole>> listPersons(@PathVariable UUID entryId) {
    var id = java.util.Objects.requireNonNull(entryId, "entryId");
    var links = personEntryRepository.findByEntryId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream().filter(l -> l.getDeletedAt() == null).toList();
    var personIds = links.stream().map(l -> l.getPerson().getId()).toList();
    var personsById = personRepository.findAllById(java.util.Objects.requireNonNull(personIds)).stream()
        .filter(p -> p.getDeletedAt() == null)
        .collect(java.util.stream.Collectors.toMap(p -> p.getId(), java.util.function.Function.identity()));
    var persons = links.stream()
        .filter(l -> personsById.containsKey(l.getPerson().getId()))
        .map(l -> {
          var p = personsById.get(l.getPerson().getId());
          return new PersonWithRole(p.getId(), p.getFirstName(), p.getLastName(), p.getNickname(),
              p.getBirthDate(), p.getPhone(), p.getEmail(), p.getNote(), l.getRole());
        })
        .toList();
    return ResponseEntity.ok(persons);
  }

  // add link (role je query param; prázdné = null)
  @PostMapping("/person/{personId}/entries/{entryId}")
  public ResponseEntity<Void> add(
      @PathVariable UUID personId,
      @PathVariable UUID entryId,
      @RequestParam(required = false) String role) {
    var pId = java.util.Objects.requireNonNull(personId, "personId");
    var eId = java.util.Objects.requireNonNull(entryId, "entryId");
    var roleValue = role == null ? null : role.trim();
    if (roleValue == null || roleValue.isBlank()) {
      throw new IllegalArgumentException("Role is required");
    }

    var existing = personEntryRepository.findByPersonIdAndEntryId(pId, eId, roleValue);
    if (existing.isPresent()) {
      var link = existing.get();
      if (link.getDeletedAt() != null) {
        link.setDeletedAt(null);
        personEntryRepository.save(link);
      }
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

  // remove link (soft delete) - role musí odpovídat stejné kombinaci jako při add
  @DeleteMapping("/person/{personId}/entries/{entryId}")
  public ResponseEntity<Void> remove(@PathVariable UUID personId,
      @PathVariable UUID entryId,
      @RequestParam(required = false) String role) {
    var pId = java.util.Objects.requireNonNull(personId, "personId");
    var eId = java.util.Objects.requireNonNull(entryId, "entryId");
    var roleValue = role == null ? null : role.trim();
    if (roleValue == null || roleValue.isBlank()) {
      throw new IllegalArgumentException("Role is required");
    }

    var link = personEntryRepository.findByPersonIdAndEntryId(pId, eId, roleValue)
        .orElseThrow(() -> new IllegalArgumentException("PersonEntry link not found"));
    personEntryRepository.softDelete(java.util.Objects.requireNonNull(link.getId(), "link id"));

    return ResponseEntity.noContent().build();
  }
}
