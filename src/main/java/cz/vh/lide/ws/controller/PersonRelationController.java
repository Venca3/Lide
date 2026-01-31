package cz.vh.lide.ws.controller;

import cz.vh.lide.core.service.PersonRelationService;
import cz.vh.lide.db.dto.PersonDto;
import cz.vh.lide.db.dto.PersonRelationDto;
import cz.vh.lide.db.repository.PersonRelationsRepository;
import cz.vh.lide.ws.dto.PersonRelationDtos.RelationCreate;
import cz.vh.lide.ws.dto.PersonRelationDtos.RelationView;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/personrelation")
public class PersonRelationController {

  private final PersonRelationService personRelationService;
  private final PersonRelationsRepository personRelationsRepository;

  public PersonRelationController(PersonRelationService personRelationService,
      PersonRelationsRepository personRelationsRepository) {
    this.personRelationService = personRelationService;
    this.personRelationsRepository = personRelationsRepository;
  }

  @GetMapping("/from/{personId}")
  public ResponseEntity<List<RelationView>> listFrom(@PathVariable UUID personId) {
    var id = java.util.Objects.requireNonNull(personId, "personId");
    var relations = personRelationsRepository.findByFromPersonId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream().filter(r -> r.getDeletedAt() == null)
        .map(r -> new RelationView(r.getId(), r.getFromPerson().getId(), r.getToPerson().getId(),
            r.getType(), r.getNote(), r.getValidFrom(), r.getValidTo()))
        .toList();
    return ResponseEntity.ok(relations);
  }

  @GetMapping("/to/{personId}")
  public ResponseEntity<List<RelationView>> listTo(@PathVariable UUID personId) {
    var id = java.util.Objects.requireNonNull(personId, "personId");
    var relations = personRelationsRepository.findByToPersonId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream().filter(r -> r.getDeletedAt() == null)
        .map(r -> new RelationView(r.getId(), r.getFromPerson().getId(), r.getToPerson().getId(),
            r.getType(), r.getNote(), r.getValidFrom(), r.getValidTo()))
        .toList();
    return ResponseEntity.ok(relations);
  }

  @PostMapping
  public ResponseEntity<RelationView> create(@RequestBody RelationCreate req) {
    var dto = PersonRelationDto.builder()
        .fromPerson(PersonDto.builder().id(req.fromPersonId()).build())
        .toPerson(PersonDto.builder().id(req.toPersonId()).build())
        .type(req.type())
        .note(req.note())
        .validFrom(req.validFrom())
        .validTo(req.validTo())
        .build();
    var created = personRelationService.create(dto);
    var location = URI.create("/api/personrelation/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
        .body(new RelationView(created.getId(),
            created.getFromPerson() != null ? created.getFromPerson().getId() : null,
            created.getToPerson() != null ? created.getToPerson().getId() : null,
            created.getType(), created.getNote(), created.getValidFrom(), created.getValidTo()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    personRelationService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
