package cz.vh.lide.api;

import cz.vh.lide.api.dto.MediaEntryDtos.*;
import cz.vh.lide.domain.MediaEntry;
import cz.vh.lide.repo.EntryRepository;
import cz.vh.lide.repo.MediaEntryRepository;
import cz.vh.lide.repo.MediaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/mediaentry")
public class MediaEntryController {

  private final MediaRepository mediaRepo;
  private final EntryRepository entryRepo;
  private final MediaEntryRepository mediaEntryRepo;

  public MediaEntryController(MediaRepository mediaRepo, EntryRepository entryRepo,
      MediaEntryRepository mediaEntryRepo) {
    this.mediaRepo = mediaRepo;
    this.entryRepo = entryRepo;
    this.mediaEntryRepo = mediaEntryRepo;
  }

  // ENTRY -> MEDIA (list)
  @GetMapping("/entry/{entryId}/media")
  public ResponseEntity<?> listMedia(@PathVariable UUID entryId) {
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    var links = mediaEntryRepo.findAllByEntryIdAndDeletedAtIsNull(entryId);

    // seřaď podle sortOrder (nully na konec), pak createdAt
    links = links.stream()
        .sorted(Comparator
            .comparing((MediaEntry l) -> l.getSortOrder(), Comparator.nullsLast(Integer::compareTo))
            .thenComparing(MediaEntry::getCreatedAt))
        .toList();

    var mediaIds = links.stream().map(MediaEntry::getMediaId).toList();

    var mediaById = mediaRepo.findAllById(mediaIds).stream()
        .filter(m -> m.getDeletedAt() == null)
        .collect(Collectors.toMap(m -> m.getId(), Function.identity()));

    var result = links.stream()
        .filter(l -> mediaById.containsKey(l.getMediaId()))
        .map(l -> {
          var m = mediaById.get(l.getMediaId());
          return new MediaWithLink(
              m.getId(),
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

    return ResponseEntity.ok(result);
  }

  // MEDIA -> ENTRY (list)
  @GetMapping("/media/{mediaId}/entries")
  public ResponseEntity<?> listEntries(@PathVariable UUID mediaId) {
    mediaRepo.findByIdAndDeletedAtIsNull(mediaId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media not found"));

    var links = mediaEntryRepo.findAllByMediaIdAndDeletedAtIsNull(mediaId);

    var entryIds = links.stream().map(MediaEntry::getEntryId).toList();

    var entryById = entryRepo.findAllById(entryIds).stream()
        .filter(e -> e.getDeletedAt() == null)
        .collect(Collectors.toMap(e -> e.getId(), Function.identity()));

    var result = links.stream()
        .filter(l -> entryById.containsKey(l.getEntryId()))
        .map(l -> {
          var e = entryById.get(l.getEntryId());
          return new EntryWithLink(
              e.getId(),
              e.getType(),
              e.getTitle(),
              e.getContent(),
              e.getOccurredAt(),
              l.getCaption(),
              l.getSortOrder());
        })
        .toList();

    return ResponseEntity.ok(result);
  }

  // ADD (a když existuje, tak updatuj caption/sortOrder + undelete)
  @PostMapping("/entry/{entryId}/media/{mediaId}")
  public ResponseEntity<?> add(
      @PathVariable UUID entryId,
      @PathVariable UUID mediaId,
      @RequestBody(required = false) MediaEntryUpsert req) {
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));
    mediaRepo.findByIdAndDeletedAtIsNull(mediaId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media not found"));

    var existing = mediaEntryRepo.findByMediaIdAndEntryId(mediaId, entryId);

    if (existing.isPresent()) {
      var me = existing.get();
      if (me.getDeletedAt() != null)
        me.setDeletedAt(null);
      if (req != null) {
        me.setCaption(req.caption());
        me.setSortOrder(req.sortOrder());
      }
      mediaEntryRepo.save(me);
      return ResponseEntity.noContent().build();
    }

    MediaEntry me = new MediaEntry();
    me.setEntryId(entryId);
    me.setMediaId(mediaId);
    if (req != null) {
      me.setCaption(req.caption());
      me.setSortOrder(req.sortOrder());
    }
    mediaEntryRepo.save(me);
    return ResponseEntity.noContent().build();
  }

  // UPDATE vazby (jen caption/sortOrder)
  @PutMapping("/entry/{entryId}/media/{mediaId}")
  public ResponseEntity<?> update(
      @PathVariable UUID entryId,
      @PathVariable UUID mediaId,
      @RequestBody MediaEntryUpsert req) {
    if (req == null)
      throw new IllegalArgumentException("body is required");

    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));
    mediaRepo.findByIdAndDeletedAtIsNull(mediaId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media not found"));

    var me = mediaEntryRepo.findByMediaIdAndEntryIdAndDeletedAtIsNull(mediaId, entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media is not assigned to this entry"));

    me.setCaption(req.caption());
    me.setSortOrder(req.sortOrder());
    mediaEntryRepo.save(me);

    return ResponseEntity.noContent().build();
  }

  // REMOVE (soft delete)
  @DeleteMapping("/entry/{entryId}/media/{mediaId}")
  public ResponseEntity<?> remove(@PathVariable UUID entryId, @PathVariable UUID mediaId) {
    entryRepo.findByIdAndDeletedAtIsNull(entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));
    mediaRepo.findByIdAndDeletedAtIsNull(mediaId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media not found"));

    var me = mediaEntryRepo.findByMediaIdAndEntryIdAndDeletedAtIsNull(mediaId, entryId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media is not assigned to this entry"));

    me.setDeletedAt(Instant.now());
    mediaEntryRepo.save(me);

    return ResponseEntity.noContent().build();
  }
}
