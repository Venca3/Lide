package cz.vh.lide.api;

import cz.vh.lide.api.dto.PersonRelationDtos.*;
import cz.vh.lide.domain.PersonRelation;
import cz.vh.lide.repo.PersonRelationRepository;
import cz.vh.lide.repo.PersonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/personrelation")
public class PersonRelationController {

  private final PersonRepository personRepo;
  private final PersonRelationRepository repo;

  public PersonRelationController(PersonRepository personRepo, PersonRelationRepository repo) {
    this.personRepo = personRepo;
    this.repo = repo;
  }

  @GetMapping("/from/{personId}")
  public ResponseEntity<?> listFrom(@PathVariable UUID personId) {
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));

    var res = repo.findAllByFromPersonIdAndDeletedAtIsNull(personId).stream()
        .map(this::toView).toList();

    return ResponseEntity.ok(res);
  }

  @GetMapping("/to/{personId}")
  public ResponseEntity<?> listTo(@PathVariable UUID personId) {
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));

    var res = repo.findAllByToPersonIdAndDeletedAtIsNull(personId).stream()
        .map(this::toView).toList();

    return ResponseEntity.ok(res);
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody RelationCreate req) {
    if (req == null)
      throw new IllegalArgumentException("body is required");
    if (req.fromPersonId() == null)
      throw new IllegalArgumentException("fromPersonId is required");
    if (req.toPersonId() == null)
      throw new IllegalArgumentException("toPersonId is required");
    if (req.type() == null || req.type().isBlank())
      throw new IllegalArgumentException("type is required");

    personRepo.findByIdAndDeletedAtIsNull(req.fromPersonId())
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "From person not found"));

    personRepo.findByIdAndDeletedAtIsNull(req.toPersonId())
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "To person not found"));

    PersonRelation r = new PersonRelation();
    r.setFromPersonId(req.fromPersonId());
    r.setToPersonId(req.toPersonId());
    r.setType(req.type().trim());
    r.setNote(req.note());
    r.setValidFrom(req.validFrom());
    r.setValidTo(req.validTo());

    r = repo.save(r);
    return ResponseEntity.created(URI.create("/api/personrelation/" + r.getId())).body(toView(r));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> softDelete(@PathVariable UUID id) {
    var r = repo.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Relation not found"));

    r.setDeletedAt(Instant.now());
    repo.save(r);

    return ResponseEntity.noContent().build();
  }

  private RelationView toView(PersonRelation r) {
    return new RelationView(
        r.getId(),
        r.getFromPersonId(),
        r.getToPersonId(),
        r.getType(),
        r.getNote(),
        r.getValidFrom(),
        r.getValidTo());
  }
}
