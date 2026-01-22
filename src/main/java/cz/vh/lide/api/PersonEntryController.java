package cz.vh.lide.api;

import cz.vh.lide.api.dto.PersonEntryDtos.*;
import cz.vh.lide.repo.EntryRepository;
import cz.vh.lide.repo.PersonEntryRepository;
import cz.vh.lide.repo.PersonRepository;
import cz.vh.lide.domain.PersonEntry;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/personentry")
public class PersonEntryController {

  private final PersonRepository personRepo;
  private final EntryRepository entryRepo;
  private final PersonEntryRepository personEntryRepo;

  public PersonEntryController(PersonRepository personRepo, EntryRepository entryRepo,
      PersonEntryRepository personEntryRepo) {
    this.personRepo = personRepo;
    this.entryRepo = entryRepo;
    this.personEntryRepo = personEntryRepo;
  }

  // person -> entries (s role)
  @GetMapping("/person/{personId}/entries")
  public ResponseEntity<?> listEntries(@PathVariable UUID personId) {
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));

    var links = personEntryRepo.findAllByPersonIdAndDeletedAtIsNull(personId);
    var entryIds = links.stream().map(PersonEntry::getEntryId).toList();

    var entries = entryRepo.findAllById(entryIds).stream()
        .filter(e -> e.getDeletedAt() == null)
        .collect(Collectors.toMap(e -> e.getId(), Function.identity()));

    var result = links.stream()
        .filter(l -> entries.containsKey(l.getEntryId()))
        .map(l -> {
          var e = entries.get(l.getEntryId());
          return new EntryWithRole(
              e.getId(),
              e.getType(),
              e.getTitle(),
              e.getContent(),
              e.getOccurredAt(),
              l.getRole());
        })
        .toList();

    return ResponseEntity.ok(result);
  }

  // entry -> persons (s role)
  @GetMapping("/entry/{entryId}/persons")
  public ResponseEntity<?> listPersons(@PathVariable UUID entryId) {
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    var links = personEntryRepo.findAllByEntryIdAndDeletedAtIsNull(entryId);
    var personIds = links.stream().map(PersonEntry::getPersonId).toList();

    var persons = personRepo.findAllById(personIds).stream()
        .filter(p -> p.getDeletedAt() == null)
        .collect(Collectors.toMap(p -> p.getId(), Function.identity()));

    var result = links.stream()
        .filter(l -> persons.containsKey(l.getPersonId()))
        .map(l -> {
          var p = persons.get(l.getPersonId());
          return new PersonWithRole(
              p.getId(),
              p.getFirstName(),
              p.getLastName(),
              p.getNickname(),
              p.getBirthDate(),
              p.getPhone(),
              p.getEmail(),
              p.getNote(),
              l.getRole());
        })
        .toList();

    return ResponseEntity.ok(result);
  }

  // add link (role je query param; prázdné = null)
  @PostMapping("/person/{personId}/entries/{entryId}")
  public ResponseEntity<?> add(
      @PathVariable UUID personId,
      @PathVariable UUID entryId,
      @RequestParam(required = false) String role) {
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    role = normalizeRole(role);

    Optional<PersonEntry> existing = (role == null)
        ? personEntryRepo.findByPersonIdAndEntryIdAndRoleIsNull(personId, entryId)
        : personEntryRepo.findByPersonIdAndEntryIdAndRole(personId, entryId, role);

    if (existing.isPresent()) {
      var pe = existing.get();
      if (pe.getDeletedAt() != null) {
        pe.setDeletedAt(null); // undelete
        personEntryRepo.save(pe);
      }
      return ResponseEntity.noContent().build();
    }

    PersonEntry pe = new PersonEntry();
    pe.setPersonId(personId);
    pe.setEntryId(entryId);
    pe.setRole(role);
    personEntryRepo.save(pe);

    return ResponseEntity.noContent().build();
  }

  // remove link (soft delete) - role musí odpovídat stejné kombinaci jako při add
  @DeleteMapping("/person/{personId}/entries/{entryId}")
  public ResponseEntity<?> remove(@PathVariable UUID personId,
      @PathVariable UUID entryId,
      @RequestParam(required = false) String role) {
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    role = normalizeRole(role);

    Optional<PersonEntry> link = (role == null)
        ? personEntryRepo.findByPersonIdAndEntryIdAndRoleIsNullAndDeletedAtIsNull(personId, entryId)
        : personEntryRepo.findByPersonIdAndEntryIdAndRoleAndDeletedAtIsNull(personId, entryId, role);

    var pe = link.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person is not assigned to this entry"));

    pe.setDeletedAt(Instant.now());
    personEntryRepo.save(pe);

    return ResponseEntity.noContent().build();
  }

  private static String normalizeRole(String role) {
    return (role == null || role.isBlank()) ? "DEFAULT" : role.trim();
  }
}
