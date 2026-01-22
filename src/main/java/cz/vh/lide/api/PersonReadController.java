package cz.vh.lide.api;

import cz.vh.lide.api.dto.PersonDetailDtos.*;
import cz.vh.lide.api.dto.PersonEntryDtos.EntryWithRole;
import cz.vh.lide.api.dto.TagDtos.TagView;
import cz.vh.lide.domain.*;
import cz.vh.lide.repo.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/personread")
public class PersonReadController {

  private final PersonRepository personRepo;

  private final PersonTagRepository personTagRepo;
  private final TagRepository tagRepo;

  private final PersonEntryRepository personEntryRepo;
  private final EntryRepository entryRepo;

  private final PersonRelationRepository personRelationRepo;

  public PersonReadController(
      PersonRepository personRepo,
      PersonTagRepository personTagRepo,
      TagRepository tagRepo,
      PersonEntryRepository personEntryRepo,
      EntryRepository entryRepo,
      PersonRelationRepository personRelationRepo) {
    this.personRepo = personRepo;
    this.personTagRepo = personTagRepo;
    this.tagRepo = tagRepo;
    this.personEntryRepo = personEntryRepo;
    this.entryRepo = entryRepo;
    this.personRelationRepo = personRelationRepo;
  }

  @GetMapping("/{personId}")
  public ResponseEntity<?> detail(@PathVariable UUID personId) {
    var p = personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));

    // TAGS
    var tagIds = personTagRepo.findAllByPersonIdAndDeletedAtIsNull(personId)
        .stream().map(PersonTag::getTagId).toList();

    var tags = tagRepo.findAllById(tagIds).stream()
        .filter(t -> t.getDeletedAt() == null)
        .map(t -> new TagView(t.getId(), t.getName()))
        .toList();

    // ENTRIES + ROLE
    var peLinks = personEntryRepo.findAllByPersonIdAndDeletedAtIsNull(personId);
    var entryIds = peLinks.stream().map(PersonEntry::getEntryId).toList();

    var entriesById = entryRepo.findAllById(entryIds).stream()
        .filter(e -> e.getDeletedAt() == null)
        .collect(Collectors.toMap(e -> e.getId(), Function.identity()));

    var entries = peLinks.stream()
        .filter(l -> entriesById.containsKey(l.getEntryId()))
        .map(l -> {
          var e = entriesById.get(l.getEntryId());
          return new EntryWithRole(
              e.getId(),
              e.getType(),
              e.getTitle(),
              e.getContent(),
              e.getOccurredAt(),
              l.getRole());
        })
        .toList();

    // RELATIONS (out + in)
    var relOut = personRelationRepo.findAllByFromPersonIdAndDeletedAtIsNull(personId);
    var relIn = personRelationRepo.findAllByToPersonIdAndDeletedAtIsNull(personId);

    // načteme “druhé strany” kvůli jménu
    var otherIds = new HashSet<UUID>();
    relOut.forEach(r -> otherIds.add(r.getToPersonId()));
    relIn.forEach(r -> otherIds.add(r.getFromPersonId()));

    var otherPersonsById = personRepo.findAllById(otherIds).stream()
        .filter(x -> x.getDeletedAt() == null)
        .collect(Collectors.toMap(x -> x.getId(), Function.identity()));

    var outViews = relOut.stream()
        .map(r -> toRelationView(r, otherPersonsById.get(r.getToPersonId())))
        .toList();

    var inViews = relIn.stream()
        .map(r -> toRelationView(r, otherPersonsById.get(r.getFromPersonId())))
        .toList();

    return ResponseEntity.ok(new PersonDetailView(
        p.getId(),
        p.getFirstName(),
        p.getLastName(),
        p.getNickname(),
        p.getBirthDate(),
        p.getPhone(),
        p.getEmail(),
        p.getNote(),
        tags,
        entries,
        outViews,
        inViews));
  }

  private PersonRelationView toRelationView(PersonRelation r, Person other) {
    String display = null;
    if (other != null) {
      display = ((other.getFirstName() == null ? "" : other.getFirstName()) + " " +
          (other.getLastName() == null ? "" : other.getLastName()))
          .trim();
      if (display.isBlank())
        display = other.getNickname();
    }

    return new PersonRelationView(
        r.getId(),
        r.getFromPersonId(),
        r.getToPersonId(),
        r.getType(),
        r.getNote(),
        r.getValidFrom(),
        r.getValidTo(),
        display);
  }
}
