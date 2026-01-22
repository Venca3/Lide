package cz.vh.lide.api;

import cz.vh.lide.api.dto.EntryDetailDtos.EntryDetailView;
import cz.vh.lide.api.dto.EntryDtos.*;
import cz.vh.lide.api.dto.MediaEntryDtos.MediaWithLink;
import cz.vh.lide.api.dto.PersonEntryDtos.PersonWithRole;
import cz.vh.lide.api.dto.TagDtos.TagView;
import cz.vh.lide.domain.Entry;
import cz.vh.lide.domain.EntryTag;
import cz.vh.lide.domain.MediaEntry;
import cz.vh.lide.domain.PersonEntry;
import cz.vh.lide.repo.EntryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

  private final EntryRepository repo;

  public EntryController(EntryRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public ResponseEntity<?> list() {
    return ResponseEntity.ok(repo.findAllByDeletedAtIsNull().stream().map(this::toView).toList());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable UUID id) {
    var e = repo.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));
    return ResponseEntity.ok(toView(e));
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody EntryCreate req) {
    if (req == null || req.type() == null || req.type().isBlank()) {
      throw new IllegalArgumentException("type is required");
    }
    if (req.content() == null || req.content().isBlank()) {
      throw new IllegalArgumentException("content is required");
    }

    Entry e = new Entry();
    e.setType(req.type().trim());
    e.setTitle(req.title());
    e.setContent(req.content());
    e.setOccurredAt(req.occurredAt());

    e = repo.save(e);
    return ResponseEntity.created(URI.create("/api/entries/" + e.getId())).body(toView(e));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody EntryUpdate req) {
    var e = repo.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    if (req == null)
      throw new IllegalArgumentException("body is required");
    if (req.type() != null)
      e.setType(req.type().trim());
    if (req.title() != null)
      e.setTitle(req.title());
    if (req.content() != null)
      e.setContent(req.content());
    e.setOccurredAt(req.occurredAt());

    var saved = repo.save(e);
    return ResponseEntity.ok(toView(saved));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> softDelete(@PathVariable UUID id) {
    var e = repo.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Entry not found"));

    e.setDeletedAt(Instant.now());
    repo.save(e);
    return ResponseEntity.noContent().build();
  }

  private EntryView toView(Entry e) {
    return new EntryView(e.getId(), e.getType(), e.getTitle(), e.getContent(), e.getOccurredAt());
  }
}
