package cz.vh.lide.api;

import cz.vh.lide.api.dto.TagDtos.*;
import cz.vh.lide.domain.Tag;
import cz.vh.lide.repo.TagRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
public class TagController {

  private final TagRepository repo;

  public TagController(TagRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public ResponseEntity<?> list() {
    return ResponseEntity.ok(repo.findAllByDeletedAtIsNull().stream().map(this::toView).toList());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable UUID id) {
    return repo.findByIdAndDeletedAtIsNull(id)
        .map(t -> ResponseEntity.ok(toView(t)))
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody TagCreate req) {
    if (req == null || req.name() == null || req.name().isBlank()) {
      return ResponseEntity.badRequest().body("name is required");
    }
    String name = req.name().trim();

    if (repo.existsByNameIgnoreCaseAndDeletedAtIsNull(name)) {
      return ResponseEntity.status(409).body("tag already exists");
    }

    Tag t = new Tag();
    t.setName(name);

    try {
      t = repo.save(t);
    } catch (DataIntegrityViolationException e) {
      // kdyby se to potkalo v race condition
      return ResponseEntity.status(409).body("tag already exists");
    }

    return ResponseEntity
        .created(URI.create("/api/tags/" + t.getId()))
        .body(toView(t));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody TagUpdate req) {
    if (req == null || req.name() == null || req.name().isBlank()) {
      return ResponseEntity.badRequest().body("name is required");
    }
    String name = req.name().trim();

    return repo.findByIdAndDeletedAtIsNull(id)
        .map(t -> {
          // pokud přejmenováváš na existující tag
          if (repo.existsByNameIgnoreCaseAndDeletedAtIsNull(name) && !t.getName().equalsIgnoreCase(name)) {
            return ResponseEntity.status(409).body("tag already exists");
          }
          t.setName(name);
          try {
            Tag saved = repo.save(t);
            return ResponseEntity.ok(toView(saved));
          } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body("tag already exists");
          }
        })
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> softDelete(@PathVariable UUID id) {
    return repo.findByIdAndDeletedAtIsNull(id)
        .map(t -> {
          t.setDeletedAt(Instant.now());
          repo.save(t);
          return ResponseEntity.noContent().build();
        })
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));
  }

  private TagView toView(Tag t) {
    return new TagView(t.getId(), t.getName());
  }
}
