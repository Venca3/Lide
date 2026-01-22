package cz.vh.lide.api;

import cz.vh.lide.api.dto.MediaDtos.*;
import cz.vh.lide.domain.Media;
import cz.vh.lide.repo.MediaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/media")
public class MediaController {

  private final MediaRepository repo;

  public MediaController(MediaRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public ResponseEntity<?> list() {
    return ResponseEntity.ok(repo.findAllByDeletedAtIsNull().stream().map(this::toView).toList());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable UUID id) {
    var m = repo.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media not found"));
    return ResponseEntity.ok(toView(m));
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody MediaCreate req) {
    if (req == null || req.mediaType() == null || req.mediaType().isBlank()) {
      throw new IllegalArgumentException("mediaType is required");
    }
    if (req.uri() == null || req.uri().isBlank()) {
      throw new IllegalArgumentException("uri is required");
    }

    Media m = new Media();
    m.setMediaType(req.mediaType().trim());
    m.setMimeType(req.mimeType());
    m.setUri(req.uri());
    m.setTitle(req.title());
    m.setNote(req.note());
    m.setTakenAt(req.takenAt());

    m = repo.save(m);
    return ResponseEntity.created(URI.create("/api/media/" + m.getId())).body(toView(m));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody MediaUpdate req) {
    var m = repo.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media not found"));

    if (req == null)
      throw new IllegalArgumentException("body is required");

    if (req.mediaType() != null)
      m.setMediaType(req.mediaType().trim());
    if (req.mimeType() != null)
      m.setMimeType(req.mimeType());
    if (req.uri() != null)
      m.setUri(req.uri());
    if (req.title() != null)
      m.setTitle(req.title());
    if (req.note() != null)
      m.setNote(req.note());
    m.setTakenAt(req.takenAt());

    var saved = repo.save(m);
    return ResponseEntity.ok(toView(saved));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> softDelete(@PathVariable UUID id) {
    var m = repo.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Media not found"));

    m.setDeletedAt(Instant.now());
    repo.save(m);
    return ResponseEntity.noContent().build();
  }

  private MediaView toView(Media m) {
    return new MediaView(
        m.getId(),
        m.getMediaType(),
        m.getMimeType(),
        m.getUri(),
        m.getTitle(),
        m.getNote(),
        m.getTakenAt());
  }
}
