package cz.vh.lide.api;

import cz.vh.lide.api.dto.EntryDetailDtos.EntryDetailView;
import cz.vh.lide.api.dto.MediaEntryDtos.MediaWithLink;
import cz.vh.lide.api.dto.PersonEntryDtos.PersonWithRole;
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
@RequestMapping("/api/entryread")
public class EntryReadController {

  private final EntryRepository entryRepo;
  private final EntryTagRepository entryTagRepo;
  private final TagRepository tagRepo;

  private final PersonEntryRepository personEntryRepo;
  private final PersonRepository personRepo;

  private final MediaEntryRepository mediaEntryRepo;
  private final MediaRepository mediaRepo;

  public EntryReadController(
      EntryRepository entryRepo,
      EntryTagRepository entryTagRepo,
      TagRepository tagRepo,
      PersonEntryRepository personEntryRepo,
      PersonRepository personRepo,
      MediaEntryRepository mediaEntryRepo,
      MediaRepository mediaRepo) {
    this.entryRepo = entryRepo;
    this.entryTagRepo = entryTagRepo;
    this.tagRepo = tagRepo;
    this.personEntryRepo = personEntryRepo;
    this.personRepo = personRepo;
    this.mediaEntryRepo = mediaEntryRepo;
    this.mediaRepo = mediaRepo;
  }

  @GetMapping("/{entryId}")
  public ResponseEntity<?> detail(@PathVariable UUID entryId) {
    var e = entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    var tagIds = entryTagRepo.findAllByEntryIdAndDeletedAtIsNull(entryId)
        .stream().map(EntryTag::getTagId).toList();

    var tags = tagRepo.findAllById(tagIds).stream()
        .filter(t -> t.getDeletedAt() == null)
        .map(t -> new TagView(t.getId(), t.getName()))
        .toList();

    var peLinks = personEntryRepo.findAllByEntryIdAndDeletedAtIsNull(entryId);
    var personIds = peLinks.stream().map(PersonEntry::getPersonId).toList();

    var personsById = personRepo.findAllById(personIds).stream()
        .filter(p -> p.getDeletedAt() == null)
        .collect(Collectors.toMap(p -> p.getId(), Function.identity()));

    var persons = peLinks.stream()
        .filter(l -> personsById.containsKey(l.getPersonId()))
        .map(l -> {
          var p = personsById.get(l.getPersonId());
          return new PersonWithRole(
              p.getId(), p.getFirstName(), p.getLastName(), p.getNickname(),
              p.getBirthDate(), p.getPhone(), p.getEmail(), p.getNote(),
              l.getRole());
        })
        .toList();

    var meLinks = mediaEntryRepo.findAllByEntryIdAndDeletedAtIsNull(entryId).stream()
        .sorted(Comparator
            .comparing((MediaEntry l) -> l.getSortOrder(), Comparator.nullsLast(Integer::compareTo))
            .thenComparing(MediaEntry::getCreatedAt))
        .toList();

    var mediaIds = meLinks.stream().map(MediaEntry::getMediaId).toList();

    var mediaById = mediaRepo.findAllById(mediaIds).stream()
        .filter(m -> m.getDeletedAt() == null)
        .collect(Collectors.toMap(m -> m.getId(), Function.identity()));

    var media = meLinks.stream()
        .filter(l -> mediaById.containsKey(l.getMediaId()))
        .map(l -> {
          var m = mediaById.get(l.getMediaId());
          return new MediaWithLink(
              m.getId(), m.getMediaType(), m.getMimeType(), m.getUri(),
              m.getTitle(), m.getNote(), m.getTakenAt(),
              l.getCaption(), l.getSortOrder());
        })
        .toList();

    return ResponseEntity.ok(new EntryDetailView(
        e.getId(), e.getType(), e.getTitle(), e.getContent(), e.getOccurredAt(),
        tags, persons, media));
  }
}
