package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.EntryTag;
import cz.vh.lide.db.repository.EntryRepository;
import cz.vh.lide.db.repository.EntryTagRepository;
import cz.vh.lide.db.repository.TagRepository;
import cz.vh.lide.ws.dto.EntryDtos.EntryView;
import cz.vh.lide.ws.dto.TagDtos.TagView;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/entriestags")
public class EntryTagController {

  private final EntryTagRepository entryTagRepository;
  private final EntryRepository entryRepository;
  private final TagRepository tagRepository;

  public EntryTagController(EntryTagRepository entryTagRepository,
      EntryRepository entryRepository,
      TagRepository tagRepository) {
    this.entryTagRepository = entryTagRepository;
    this.entryRepository = entryRepository;
    this.tagRepository = tagRepository;
  }

  // entry -> tags
  @GetMapping("/entry/{entryId}/tags")
  public ResponseEntity<List<TagView>> listTags(@PathVariable UUID entryId) {
    var id = java.util.Objects.requireNonNull(entryId, "entryId");
    var links = entryTagRepository.findByEntryId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream()
        .filter(l -> l.getDeletedAt() == null)
        .toList();
    var tagIds = links.stream().map(l -> l.getTag().getId()).toList();
    var tags = tagRepository.findAllById(java.util.Objects.requireNonNull(tagIds)).stream()
        .filter(t -> t.getDeletedAt() == null)
        .map(t -> new TagView(t.getId(), t.getName()))
        .toList();
    return ResponseEntity.ok(tags);
  }

  // tag -> entries
  @GetMapping("/tag/{tagId}/entries")
  public ResponseEntity<List<EntryView>> listEntries(@PathVariable UUID tagId) {
    var id = java.util.Objects.requireNonNull(tagId, "tagId");
    var links = entryTagRepository.findByTagId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream()
        .filter(l -> l.getDeletedAt() == null)
        .toList();
    var entryIds = links.stream().map(l -> l.getEntry().getId()).toList();
    var entries = entryRepository.findAllById(java.util.Objects.requireNonNull(entryIds)).stream()
        .filter(e -> e.getDeletedAt() == null)
        .map(e -> new EntryView(e.getId(), e.getType(), e.getTitle(), e.getContent(), e.getOccurredAt()))
        .toList();
    return ResponseEntity.ok(entries);
  }

  // add tag to entry (undelete if exists)
  @PostMapping("/entry/{entryId}/tag/{tagId}")
  public ResponseEntity<Void> add(@PathVariable UUID entryId, @PathVariable UUID tagId) {
    var eId = java.util.Objects.requireNonNull(entryId, "entryId");
    var tId = java.util.Objects.requireNonNull(tagId, "tagId");

    var existing = entryTagRepository.findByEntryIdAndTagId(eId, tId);
    if (existing.isPresent()) {
      var link = existing.get();
      if (link.getDeletedAt() != null) {
        link.setDeletedAt(null);
        entryTagRepository.save(link);
      }
      return ResponseEntity.noContent().build();
    }

    var entry = entryRepository.findById(eId)
        .orElseThrow(() -> new IllegalArgumentException("Entry not found"));
    var tag = tagRepository.findById(tId)
        .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

    var link = new EntryTag();
    link.setEntry(entry);
    link.setTag(tag);
    entryTagRepository.save(link);

    return ResponseEntity.noContent().build();
  }

  // remove tag from entry (soft delete)
  @DeleteMapping("/entry/{entryId}/tag/{tagId}")
  public ResponseEntity<Void> remove(@PathVariable UUID entryId, @PathVariable UUID tagId) {
    var eId = java.util.Objects.requireNonNull(entryId, "entryId");
    var tId = java.util.Objects.requireNonNull(tagId, "tagId");
    var link = entryTagRepository.findByEntryIdAndTagId(eId, tId)
        .orElseThrow(() -> new IllegalArgumentException("EntryTag link not found"));
    entryTagRepository.softDelete(java.util.Objects.requireNonNull(link.getId(), "link id"));
    return ResponseEntity.noContent().build();
  }
}
