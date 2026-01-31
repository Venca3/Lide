package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.MediaEntry;
import cz.vh.lide.db.repository.EntryRepository;
import cz.vh.lide.db.repository.MediaEntryRepository;
import cz.vh.lide.db.repository.MediaRepository;
import cz.vh.lide.ws.dto.MediaEntryDtos.EntryWithLink;
import cz.vh.lide.ws.dto.MediaEntryDtos.MediaEntryUpsert;
import cz.vh.lide.ws.dto.MediaEntryDtos.MediaWithLink;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mediaentry")
public class MediaEntryController {

  private final MediaEntryRepository mediaEntryRepository;
  private final MediaRepository mediaRepository;
  private final EntryRepository entryRepository;

  public MediaEntryController(MediaEntryRepository mediaEntryRepository,
      MediaRepository mediaRepository,
      EntryRepository entryRepository) {
    this.mediaEntryRepository = mediaEntryRepository;
    this.mediaRepository = mediaRepository;
    this.entryRepository = entryRepository;
  }

  // ENTRY -> MEDIA (list)
  @GetMapping("/entry/{entryId}/media")
  public ResponseEntity<List<MediaWithLink>> listMedia(@PathVariable UUID entryId) {
    var id = java.util.Objects.requireNonNull(entryId, "entryId");
    var links = mediaEntryRepository.findByEntryId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream().filter(l -> l.getDeletedAt() == null).toList();
    var mediaIds = links.stream().map(l -> l.getMedia().getId()).toList();
    var mediaById = mediaRepository.findAllById(java.util.Objects.requireNonNull(mediaIds)).stream()
        .filter(m -> m.getDeletedAt() == null)
        .collect(java.util.stream.Collectors.toMap(m -> m.getId(), java.util.function.Function.identity()));

    var media = links.stream()
        .filter(l -> mediaById.containsKey(l.getMedia().getId()))
        .map(l -> {
          var m = mediaById.get(l.getMedia().getId());
          return new MediaWithLink(m.getId(), l.getEntry().getId(), m.getMediaType(), m.getMimeType(),
              m.getUri(), m.getTitle(), m.getNote(), m.getTakenAt(), l.getCaption(), l.getSortOrder());
        })
        .toList();
    return ResponseEntity.ok(media);
  }

  // MEDIA -> ENTRY (list)
  @GetMapping("/media/{mediaId}/entries")
  public ResponseEntity<List<EntryWithLink>> listEntries(@PathVariable UUID mediaId) {
    var id = java.util.Objects.requireNonNull(mediaId, "mediaId");
    var links = mediaEntryRepository.findByMediaId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream().filter(l -> l.getDeletedAt() == null).toList();
    var entryIds = links.stream().map(l -> l.getEntry().getId()).toList();
    var entryById = entryRepository.findAllById(java.util.Objects.requireNonNull(entryIds)).stream()
        .filter(e -> e.getDeletedAt() == null)
        .collect(java.util.stream.Collectors.toMap(e -> e.getId(), java.util.function.Function.identity()));

    var entries = links.stream()
        .filter(l -> entryById.containsKey(l.getEntry().getId()))
        .map(l -> {
          var e = entryById.get(l.getEntry().getId());
          return new EntryWithLink(e.getId(), l.getMedia().getId(), e.getType(), e.getTitle(),
              e.getContent(), e.getOccurredAt(), l.getCaption(), l.getSortOrder());
        })
        .toList();
    return ResponseEntity.ok(entries);
  }

  // ADD (a když existuje, tak updatuj caption/sortOrder + undelete)
  @PostMapping("/entry/{entryId}/media/{mediaId}")
  @Operation(summary = "Add entry-media link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> add(
      @PathVariable UUID entryId,
      @PathVariable UUID mediaId,
      @RequestBody(required = false) MediaEntryUpsert req) {
    var eId = java.util.Objects.requireNonNull(entryId, "entryId");
    var mId = java.util.Objects.requireNonNull(mediaId, "mediaId");
    var caption = req != null ? req.caption() : null;
    var sortOrder = req != null ? req.sortOrder() : null;
    var existing = mediaEntryRepository.findByEntryIdAndMediaId(eId, mId);
    if (existing.isPresent()) {
      var link = existing.get();
      link.setCaption(caption);
      link.setSortOrder(sortOrder);
      if (link.getDeletedAt() != null) {
        link.setDeletedAt(null);
      }
      mediaEntryRepository.save(link);
      return ResponseEntity.noContent().build();
    }

    var entry = entryRepository.findById(eId)
        .orElseThrow(() -> new IllegalArgumentException("Entry not found"));
    var media = mediaRepository.findById(mId)
        .orElseThrow(() -> new IllegalArgumentException("Media not found"));

    var link = new MediaEntry();
    link.setEntry(entry);
    link.setMedia(media);
    link.setCaption(caption);
    link.setSortOrder(sortOrder);
    mediaEntryRepository.save(link);
    return ResponseEntity.noContent().build();
  }

  // UPDATE vazby (jen caption/sortOrder)
  @PutMapping("/entry/{entryId}/media/{mediaId}")
  @Operation(summary = "Update entry-media link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> update(
      @PathVariable UUID entryId,
      @PathVariable UUID mediaId,
      @RequestBody MediaEntryUpsert req) {
    var eId = java.util.Objects.requireNonNull(entryId, "entryId");
    var mId = java.util.Objects.requireNonNull(mediaId, "mediaId");
    var link = mediaEntryRepository.findByEntryIdAndMediaId(eId, mId)
        .orElseThrow(() -> new IllegalArgumentException("MediaEntry link not found"));
    link.setCaption(req.caption());
    link.setSortOrder(req.sortOrder());
    mediaEntryRepository.save(link);
    return ResponseEntity.noContent().build();
  }

  // REMOVE (soft delete)
  @DeleteMapping("/entry/{entryId}/media/{mediaId}")
  @Operation(summary = "Remove entry-media link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> remove(@PathVariable UUID entryId, @PathVariable UUID mediaId) {
    var eId = java.util.Objects.requireNonNull(entryId, "entryId");
    var mId = java.util.Objects.requireNonNull(mediaId, "mediaId");
    var link = mediaEntryRepository.findByEntryIdAndMediaId(eId, mId)
        .orElseThrow(() -> new IllegalArgumentException("MediaEntry link not found"));
    mediaEntryRepository.softDelete(java.util.Objects.requireNonNull(link.getId(), "link id"));
    return ResponseEntity.noContent().build();
  }
}
