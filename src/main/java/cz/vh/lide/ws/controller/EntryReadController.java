package cz.vh.lide.ws.controller;

import cz.vh.lide.ws.dto.EntryDetailDtos.EntryDetailView;
import cz.vh.lide.ws.dto.EntryDetailDtos.MediaWithLink;
import cz.vh.lide.ws.dto.EntryDetailDtos.PersonWithRole;
import cz.vh.lide.ws.dto.TagDtos.TagView;
import cz.vh.lide.db.entity.*;
import cz.vh.lide.db.repository.*;

import org.springframework.data.domain.Pageable;
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
                var id = java.util.Objects.requireNonNull(entryId, "entryId");
                var e = entryRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));
        if (e.getDeletedAt() != null) {
            throw new ResponseStatusException(NOT_FOUND, "Entry not found");
        }

        var tagLinks = entryTagRepo.findByEntryId(id, Pageable.unpaged())
                .stream().filter(l -> l.getDeletedAt() == null).toList();
        var tagIds = tagLinks.stream().map(l -> l.getTag().getId()).toList();

        var tags = tagRepo.findAllById(java.util.Objects.requireNonNull(tagIds)).stream()
                .filter(t -> t.getDeletedAt() == null)
                .map(t -> new TagView(t.getId(), t.getName()))
                .toList();

        var peLinks = personEntryRepo.findByEntryId(id, Pageable.unpaged()).stream()
                .filter(l -> l.getDeletedAt() == null)
                .toList();
        var personIds = peLinks.stream().map(l -> l.getPerson().getId()).toList();

        var personsById = personRepo.findAllById(java.util.Objects.requireNonNull(personIds)).stream()
                .filter(p -> p.getDeletedAt() == null)
                .collect(Collectors.toMap(p -> p.getId(), Function.identity()));

        var persons = peLinks.stream()
                .filter(l -> personsById.containsKey(l.getPerson().getId()))
                .map(l -> {
                    var p = personsById.get(l.getPerson().getId());
                    return new PersonWithRole(
                            p.getId(),
                            l.getEntry().getId(),
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

        var meLinks = mediaEntryRepo.findByEntryId(id, Pageable.unpaged()).stream()
                .filter(l -> l.getDeletedAt() == null)
                .sorted(Comparator
                        .comparing((MediaEntry l) -> l.getSortOrder(), Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(MediaEntry::getCreatedAt))
                .toList();

        var mediaIds = meLinks.stream().map(l -> l.getMedia().getId()).toList();

        var mediaById = mediaRepo.findAllById(java.util.Objects.requireNonNull(mediaIds)).stream()
                .filter(m -> m.getDeletedAt() == null)
                .collect(Collectors.toMap(m -> m.getId(), Function.identity()));

        var media = meLinks.stream()
                .filter(l -> mediaById.containsKey(l.getMedia().getId()))
                .map(l -> {
                    var m = mediaById.get(l.getMedia().getId());
                    return new MediaWithLink(
                            m.getId(),
                            l.getEntry().getId(),
                            m.getMediaType(),
                            m.getMimeType(),
                            m.getUri(),
                            m.getTitle(),
                            m.getNote(),
                            m.getTakenAt(),
                            l.getCaption(),
                            l.getSortOrder());
                })
                .toList();

        return ResponseEntity.ok(new EntryDetailView(
                e.getId(), e.getType(), e.getTitle(), e.getContent(), e.getOccurredAt(),
                tags, persons, media));
    }
}
