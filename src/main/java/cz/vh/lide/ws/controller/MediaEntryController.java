package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.Entry;
import cz.vh.lide.db.entity.Media;
import cz.vh.lide.db.entity.MediaEntry;
import cz.vh.lide.db.repository.EntryRepository;
import cz.vh.lide.db.repository.MediaEntryRepository;
import cz.vh.lide.db.repository.MediaRepository;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.MediaEntryDtos.EntryWithLink;
import cz.vh.lide.ws.dto.MediaEntryDtos.MediaEntryUpsert;
import cz.vh.lide.ws.dto.MediaEntryDtos.MediaWithLink;

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
 * REST controller for media-entry relation management.
 */
@RestController
@RequestMapping("/api/mediaentry")
public class MediaEntryController {

  private final MediaEntryRepository mediaEntryRepository;
  private final MediaRepository mediaRepository;
  private final EntryRepository entryRepository;

  /**
   * Creates the controller with required repositories.
   *
   * @param mediaEntryRepository media-entry repository
   * @param mediaRepository media repository
   * @param entryRepository entry repository
   */
  public MediaEntryController(MediaEntryRepository mediaEntryRepository,
      MediaRepository mediaRepository,
      EntryRepository entryRepository) {
    this.mediaEntryRepository = mediaEntryRepository;
    this.mediaRepository = mediaRepository;
    this.entryRepository = entryRepository;
  }

  /**
   * Lists media linked to an entry (no pagination).
   *
   * @param entryId entry id
   *
   * @return list of media with link data
   */
  @GetMapping("/entry/{entryId}/media")
  public ResponseEntity<List<MediaWithLink>> listMedia(@PathVariable UUID entryId) {
    var id = Objects.requireNonNull(entryId, "entryId");
    var links = mediaEntryRepository.findByEntryIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapMedia(links));
  }

  /**
   * Lists media linked to an entry (pagination + sort).
   *
   * @param entryId entry id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of media with link data and pagination headers
   */
  @GetMapping(value = "/entry/{entryId}/media", params = {"page", "size"})
  public ResponseEntity<List<MediaWithLink>> listMedia(
      @PathVariable UUID entryId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(entryId, "entryId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = mediaEntryRepository.findByEntryIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapMedia(pageRes.getContent()));
  }

  /**
   * Lists entries linked to media (no pagination).
   *
   * @param mediaId media id
   *
   * @return list of entries with link data
   */
  @GetMapping("/media/{mediaId}/entries")
  public ResponseEntity<List<EntryWithLink>> listEntries(@PathVariable UUID mediaId) {
    var id = Objects.requireNonNull(mediaId, "mediaId");
    var links = mediaEntryRepository.findByMediaIdAndDeletedAtIsNull(id, Pageable.unpaged()).getContent();
    return ResponseEntity.ok(mapEntries(links));
  }

  /**
   * Lists entries linked to media (pagination + sort).
   *
   * @param mediaId media id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of entries with link data and pagination headers
   */
  @GetMapping(value = "/media/{mediaId}/entries", params = {"page", "size"})
  public ResponseEntity<List<EntryWithLink>> listEntries(
      @PathVariable UUID mediaId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(mediaId, "mediaId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = mediaEntryRepository.findByMediaIdAndDeletedAtIsNull(id, pageable);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(mapEntries(pageRes.getContent()));
  }

  /**
   * Adds media to an entry (updates active link, creates new if only deleted exists).
   *
   * @param entryId entry id
   * @param mediaId media id
   * @param req optional link data (caption/sortOrder)
   *
   * @return 204 No Content
   */
  @PostMapping("/entry/{entryId}/media/{mediaId}")
  @Operation(summary = "Add entry-media link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> add(
      @PathVariable UUID entryId,
      @PathVariable UUID mediaId,
      @RequestBody(required = false) MediaEntryUpsert req) {
    var eId = Objects.requireNonNull(entryId, "entryId");
    var mId = Objects.requireNonNull(mediaId, "mediaId");
    var caption = req != null ? req.caption() : null;
    var sortOrder = req != null ? req.sortOrder() : null;
    var existingActive = mediaEntryRepository.findByEntryIdAndMediaIdAndDeletedAtIsNull(eId, mId);
    if (existingActive.isPresent()) {
      var link = existingActive.get();
      link.setCaption(caption);
      link.setSortOrder(sortOrder);
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

  /**
   * Updates entry-media link (caption/sortOrder).
   *
   * @param entryId entry id
   * @param mediaId media id
   * @param req link data
   *
   * @return 204 No Content
   */
  @PutMapping("/entry/{entryId}/media/{mediaId}")
  @Operation(summary = "Update entry-media link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> update(
      @PathVariable UUID entryId,
      @PathVariable UUID mediaId,
      @RequestBody MediaEntryUpsert req) {
    var eId = Objects.requireNonNull(entryId, "entryId");
    var mId = Objects.requireNonNull(mediaId, "mediaId");
    var link = mediaEntryRepository.findByEntryIdAndMediaIdAndDeletedAtIsNull(eId, mId)
        .orElseThrow(() -> new IllegalArgumentException("MediaEntry link not found"));
    link.setCaption(req.caption());
    link.setSortOrder(req.sortOrder());
    mediaEntryRepository.save(link);
    return ResponseEntity.noContent().build();
  }

  /**
   * Removes entry-media link (soft delete).
   *
   * @param entryId entry id
   * @param mediaId media id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/entry/{entryId}/media/{mediaId}")
  @Operation(summary = "Remove entry-media link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> remove(@PathVariable UUID entryId, @PathVariable UUID mediaId) {
    var eId = Objects.requireNonNull(entryId, "entryId");
    var mId = Objects.requireNonNull(mediaId, "mediaId");
    var link = mediaEntryRepository.findByEntryIdAndMediaIdAndDeletedAtIsNull(eId, mId)
        .orElseThrow(() -> new IllegalArgumentException("MediaEntry link not found"));
    mediaEntryRepository.softDelete(Objects.requireNonNull(link.getId(), "link id"));
    return ResponseEntity.noContent().build();
  }

  private List<MediaWithLink> mapMedia(List<MediaEntry> links) {
    var mediaIds = links.stream()
        .map(l -> l.getMedia() != null ? l.getMedia().getId() : null)
        .filter(Objects::nonNull)
        .toList();
    if (mediaIds.isEmpty()) {
      return List.of();
    }
    Map<UUID, Media> mediaById = mediaRepository.findAllById(mediaIds).stream()
        .filter(m -> m.getDeletedAt() == null)
        .collect(Collectors.toMap(Media::getId, Function.identity()));
    return links.stream()
        .filter(l -> l.getMedia() != null && mediaById.containsKey(l.getMedia().getId()))
        .map(l -> {
          var m = mediaById.get(l.getMedia().getId());
          return new MediaWithLink(m.getId(), l.getEntry().getId(), m.getMediaType(), m.getMimeType(),
              m.getUri(), m.getTitle(), m.getNote(), m.getTakenAt(), l.getCaption(), l.getSortOrder());
        })
        .toList();
  }

  private List<EntryWithLink> mapEntries(List<MediaEntry> links) {
    var entryIds = links.stream()
        .map(l -> l.getEntry() != null ? l.getEntry().getId() : null)
        .filter(Objects::nonNull)
        .toList();
    if (entryIds.isEmpty()) {
      return List.of();
    }
    Map<UUID, Entry> entryById = entryRepository.findAllById(entryIds).stream()
        .filter(e -> e.getDeletedAt() == null)
        .collect(Collectors.toMap(Entry::getId, Function.identity()));
    return links.stream()
        .filter(l -> l.getEntry() != null && entryById.containsKey(l.getEntry().getId()))
        .map(l -> {
          var e = entryById.get(l.getEntry().getId());
          return new EntryWithLink(e.getId(), l.getMedia().getId(), e.getType(), e.getTitle(),
              e.getContent(), e.getOccurredAt(), l.getCaption(), l.getSortOrder());
        })
        .toList();
  }
}
