package cz.vh.lide.api;

import cz.vh.lide.api.dto.EntryDtos.EntryView;
import cz.vh.lide.api.dto.TagDtos.TagView;
import cz.vh.lide.domain.EntryTag;
import cz.vh.lide.repo.EntryRepository;
import cz.vh.lide.repo.EntryTagRepository;
import cz.vh.lide.repo.TagRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/entriestags")
public class EntryTagController {

  private final EntryRepository entryRepo;
  private final TagRepository tagRepo;
  private final EntryTagRepository entryTagRepo;

  public EntryTagController(EntryRepository entryRepo, TagRepository tagRepo, EntryTagRepository entryTagRepo) {
    this.entryRepo = entryRepo;
    this.tagRepo = tagRepo;
    this.entryTagRepo = entryTagRepo;
  }

  // entry -> tags
  @GetMapping("/entry/{entryId}/tags")
  public ResponseEntity<?> listTags(@PathVariable UUID entryId) {
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    var tagIds = entryTagRepo.findAllByEntryIdAndDeletedAtIsNull(entryId)
        .stream().map(EntryTag::getTagId).toList();

    var tags = tagRepo.findAllById(tagIds).stream()
        .filter(t -> t.getDeletedAt() == null)
        .map(t -> new TagView(t.getId(), t.getName()))
        .toList();

    return ResponseEntity.ok(tags);
  }

  // tag -> entries
  @GetMapping("/tag/{tagId}/entries")
  public ResponseEntity<?> listEntries(@PathVariable UUID tagId) {
    tagRepo.findByIdAndDeletedAtIsNull(tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));

    var entryIds = entryTagRepo.findAllByTagIdAndDeletedAtIsNull(tagId)
        .stream().map(EntryTag::getEntryId).toList();

    var entries = entryRepo.findAllById(entryIds).stream()
        .filter(e -> e.getDeletedAt() == null)
        .map(e -> new EntryView(
            e.getId(),
            e.getType(),
            e.getTitle(),
            e.getContent(),
            e.getOccurredAt()))
        .toList();

    return ResponseEntity.ok(entries);
  }

  // add tag to entry (undelete if exists)
  @PostMapping("/entry/{entryId}/tag/{tagId}")
  public ResponseEntity<?> add(@PathVariable UUID entryId, @PathVariable UUID tagId) {
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));
    tagRepo.findByIdAndDeletedAtIsNull(tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));

    var existing = entryTagRepo.findByEntryIdAndTagId(entryId, tagId);

    if (existing.isPresent()) {
      var et = existing.get();
      if (et.getDeletedAt() != null) {
        et.setDeletedAt(null); // undelete
        entryTagRepo.save(et);
      }
      return ResponseEntity.noContent().build();
    }

    EntryTag et = new EntryTag();
    et.setEntryId(entryId);
    et.setTagId(tagId);
    entryTagRepo.save(et);

    return ResponseEntity.noContent().build();
  }

  // remove tag from entry (soft delete)
  @DeleteMapping("/entry/{entryId}/tag/{tagId}")
  public ResponseEntity<?> remove(@PathVariable UUID entryId, @PathVariable UUID tagId) {
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));
    tagRepo.findByIdAndDeletedAtIsNull(tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));

    var et = entryTagRepo.findByEntryIdAndTagIdAndDeletedAtIsNull(entryId, tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag is not assigned to this entry"));

    et.setDeletedAt(Instant.now());
    entryTagRepo.save(et);

    return ResponseEntity.noContent().build();
  }
}
