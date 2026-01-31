package cz.vh.lide.ws.controller;

import cz.vh.lide.ws.dto.PersonReadDtos.EntryWithRole;
import cz.vh.lide.ws.dto.PersonReadDtos.PersonReadView;
import cz.vh.lide.ws.dto.PersonReadDtos.PersonRelationView;
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
@RequestMapping("/api/personread")
public class PersonReadController {

    private final PersonRepository personRepo;

    private final PersonTagRepository personTagRepo;
    private final TagRepository tagRepo;

    private final PersonEntryRepository personEntryRepo;
    private final EntryRepository entryRepo;

    private final PersonRelationsRepository personRelationRepo;

    public PersonReadController(
            PersonRepository personRepo,
            PersonTagRepository personTagRepo,
            TagRepository tagRepo,
            PersonEntryRepository personEntryRepo,
            EntryRepository entryRepo,
            PersonRelationsRepository personRelationRepo) {
        this.personRepo = personRepo;
        this.personTagRepo = personTagRepo;
        this.tagRepo = tagRepo;
        this.personEntryRepo = personEntryRepo;
        this.entryRepo = entryRepo;
        this.personRelationRepo = personRelationRepo;
    }

    @GetMapping("/{personId}")
    public ResponseEntity<?> detail(@PathVariable UUID personId) {
                var id = java.util.Objects.requireNonNull(personId, "personId");
                var p = personRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
        if (p.getDeletedAt() != null) {
            throw new ResponseStatusException(NOT_FOUND, "Person not found");
        }

        // TAGS
        var tagLinks = personTagRepo.findByPersonId(id, Pageable.unpaged())
                .stream().filter(l -> l.getDeletedAt() == null).toList();
        var tagIds = tagLinks.stream().map(l -> l.getTag().getId()).toList();

        var tags = tagRepo.findAllById(java.util.Objects.requireNonNull(tagIds)).stream()
                .filter(t -> t.getDeletedAt() == null)
                .map(t -> new TagView(t.getId(), t.getName()))
                .toList();

        // ENTRIES + ROLE
        var peLinks = personEntryRepo.findByPersonId(id, Pageable.unpaged())
                .stream().filter(l -> l.getDeletedAt() == null).toList();
        var entryIds = peLinks.stream().map(l -> l.getEntry().getId()).toList();

        var entriesById = entryRepo.findAllById(java.util.Objects.requireNonNull(entryIds)).stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toMap(e -> e.getId(), Function.identity()));

        var entries = peLinks.stream()
                                .filter(l -> entriesById.containsKey(l.getEntry().getId()))
                .map(l -> {
                                        var e = entriesById.get(l.getEntry().getId());
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
        var relOut = personRelationRepo.findByFromPersonId(id, Pageable.unpaged())
                .stream().filter(r -> r.getDeletedAt() == null).toList();
        var relIn = personRelationRepo.findByToPersonId(id, Pageable.unpaged())
                .stream().filter(r -> r.getDeletedAt() == null).toList();

        // načteme “druhé strany” kvůli jménu
        var otherIds = new HashSet<UUID>();
        relOut.forEach(r -> otherIds.add(r.getToPerson().getId()));
        relIn.forEach(r -> otherIds.add(r.getFromPerson().getId()));

        var otherPersonsById = personRepo.findAllById(java.util.Objects.requireNonNull(otherIds)).stream()
                .filter(x -> x.getDeletedAt() == null)
                .collect(Collectors.toMap(x -> x.getId(), Function.identity()));

        var outViews = relOut.stream()
                .map(r -> toRelationView(r, otherPersonsById.get(r.getToPerson().getId())))
                .toList();

        var inViews = relIn.stream()
                .map(r -> toRelationView(r, otherPersonsById.get(r.getFromPerson().getId())))
                .toList();

        return ResponseEntity.ok(new PersonReadView(
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
                r.getFromPerson().getId(),
                r.getToPerson().getId(),
                r.getType(),
                r.getNote(),
                r.getValidFrom(),
                r.getValidTo(),
                display);
    }
}
