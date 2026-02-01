package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.Entry;
import cz.vh.lide.db.entity.EntryTag;
import cz.vh.lide.db.entity.Tag;
import cz.vh.lide.db.repository.EntryRepository;
import cz.vh.lide.db.repository.EntryTagRepository;
import cz.vh.lide.db.repository.TagRepository;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.EntryDtos.EntryView;
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
 * REST controller for entry-tag relation management.
 */
@RestController
@RequestMapping("/api/entriestags")
public class EntryTagController {

  private final EntryTagRepository entryTagRepository;
  private final EntryRepository entryRepository;
  private final TagRepository tagRepository;

  /**
   * Creates the controller with required repositories.
   *
   * @param entryTagRepository entry-tag repository
   * @param entryRepository entry repository
   * @param tagRepository tag repository
   */
  public EntryTagController(EntryTagRepository entryTagRepository,
      EntryRepository entryRepository,
      TagRepository tagRepository) {
    this.entryTagRepository = entryTagRepository;
    this.entryRepository = entryRepository;
    this.tagRepository = tagRepository;
  }

  /**
   * Lists tags linked to an entry without pagination.
   *
   * @param entryId entry id
   *
   * @return list of tags
   */
  @GetMapping("/entry/{entryId}/tags")
  public ResponseEntity<List<TagView>> listTags(@PathVariable UUID entryId) {
    var id = Objects.requireNonNull(entryId, "entryId");
    var links = entryTagRepository.findByEntryIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapTags(links));
  }

  /**
   * Lists tags linked to an entry with pagination and sorting.
   *
   * @param entryId entry id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of tags with pagination headers
   */
  @GetMapping(value = "/entry/{entryId}/tags", params = {"page", "size"})
  public ResponseEntity<List<TagView>> listTags(
      @PathVariable UUID entryId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(entryId, "entryId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = entryTagRepository.findByEntryIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapTags(pageRes.getContent()));
  }

  /**
   * Lists entries linked to a tag without pagination.
   *
   * @param tagId tag id
   *
   * @return list of entries
   */
  @GetMapping("/tag/{tagId}/entries")
  public ResponseEntity<List<EntryView>> listEntries(@PathVariable UUID tagId) {
    var id = Objects.requireNonNull(tagId, "tagId");
    var links = entryTagRepository.findByTagIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapEntries(links));
  }

  /**
   * Lists entries linked to a tag with pagination and sorting.
   *
   * @param tagId tag id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of entries with pagination headers
   */
  @GetMapping(value = "/tag/{tagId}/entries", params = {"page", "size"})
  public ResponseEntity<List<EntryView>> listEntries(
      @PathVariable UUID tagId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(tagId, "tagId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = entryTagRepository.findByTagIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapEntries(pageRes.getContent()));
  }

  /**
    * Adds a tag to an entry (creates a new link even if a deleted link exists).
   *
   * @param entryId entry id
   * @param tagId tag id
   *
   * @return 204 No Content
   */
  @PostMapping("/entry/{entryId}/tag/{tagId}")
  @Operation(summary = "Add tag to entry", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> add(@PathVariable UUID entryId, @PathVariable UUID tagId) {
    var eId = Objects.requireNonNull(entryId, "entryId");
    var tId = Objects.requireNonNull(tagId, "tagId");

    var existingActive = entryTagRepository.findByEntryIdAndTagIdAndDeletedAtIsNull(eId, tId);
    if (existingActive.isPresent()) {
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

  /**
   * Removes a tag from an entry (soft delete link).
   *
   * @param entryId entry id
   * @param tagId tag id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/entry/{entryId}/tag/{tagId}")
  @Operation(summary = "Remove tag from entry", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> remove(@PathVariable UUID entryId, @PathVariable UUID tagId) {
    var eId = Objects.requireNonNull(entryId, "entryId");
    var tId = Objects.requireNonNull(tagId, "tagId");
    var link = entryTagRepository.findByEntryIdAndTagId(eId, tId)
        .orElseThrow(() -> new IllegalArgumentException("EntryTag link not found"));
    entryTagRepository.softDelete(Objects.requireNonNull(link.getId(), "link id"));
    return ResponseEntity.noContent().build();
  }

  private List<TagView> mapTags(List<EntryTag> links) {
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

  private List<EntryView> mapEntries(List<EntryTag> links) {
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
    return entryIds.stream()
        .map(entriesById::get)
        .filter(Objects::nonNull)
        .map(e -> new EntryView(e.getId(), e.getType(), e.getTitle(), e.getContent(), e.getOccurredAt()))
        .toList();
  }
}
