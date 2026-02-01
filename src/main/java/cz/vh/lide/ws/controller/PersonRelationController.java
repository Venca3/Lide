package cz.vh.lide.ws.controller;

import cz.vh.lide.core.service.PersonRelationService;
import cz.vh.lide.db.dto.PersonDto;
import cz.vh.lide.db.dto.PersonRelationDto;
import cz.vh.lide.db.repository.PersonRelationsRepository;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.PersonRelationDtos.RelationCreate;
import cz.vh.lide.ws.dto.PersonRelationDtos.RelationView;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.net.URI;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * REST controller for person relation management.
 */
@RestController
@RequestMapping("/api/personrelation")
public class PersonRelationController {

  private final PersonRelationService personRelationService;
  private final PersonRelationsRepository personRelationsRepository;

  /**
   * Creates the controller with required services.
   *
   * @param personRelationService person relation service
   * @param personRelationsRepository person relation repository
   */
  public PersonRelationController(PersonRelationService personRelationService,
      PersonRelationsRepository personRelationsRepository) {
    this.personRelationService = personRelationService;
    this.personRelationsRepository = personRelationsRepository;
  }

  /**
   * Lists outgoing relations for a person (no pagination).
   *
   * @param personId person id
   *
   * @return list of relations
   */
  @GetMapping("/from/{personId}")
  public ResponseEntity<List<RelationView>> listFrom(@PathVariable UUID personId) {
    var id = Objects.requireNonNull(personId, "personId");
    var relations = personRelationsRepository.findByFromPersonIdAndDeletedAtIsNull(id, Pageable.unpaged())
        .map(r -> new RelationView(r.getId(), r.getFromPerson().getId(), r.getToPerson().getId(),
            r.getType(), r.getNote(), r.getValidFrom(), r.getValidTo()))
        .getContent();
    return ResponseEntity.ok(relations);
  }

  /**
   * Lists outgoing relations for a person (pagination + sort).
   *
   * @param personId person id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of relations with pagination headers
   */
  @GetMapping(value = "/from/{personId}", params = {"page", "size"})
  public ResponseEntity<List<RelationView>> listFrom(
      @PathVariable UUID personId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(personId, "personId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = personRelationsRepository.findByFromPersonIdAndDeletedAtIsNull(id, pageable)
        .map(r -> new RelationView(r.getId(), r.getFromPerson().getId(), r.getToPerson().getId(),
            r.getType(), r.getNote(), r.getValidFrom(), r.getValidTo()));
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  /**
   * Lists incoming relations for a person (no pagination).
   *
   * @param personId person id
   *
   * @return list of relations
   */
  @GetMapping("/to/{personId}")
  public ResponseEntity<List<RelationView>> listTo(@PathVariable UUID personId) {
    var id = Objects.requireNonNull(personId, "personId");
    var relations = personRelationsRepository.findByToPersonIdAndDeletedAtIsNull(id, Pageable.unpaged())
        .map(r -> new RelationView(r.getId(), r.getFromPerson().getId(), r.getToPerson().getId(),
            r.getType(), r.getNote(), r.getValidFrom(), r.getValidTo()))
        .getContent();
    return ResponseEntity.ok(relations);
  }

  /**
   * Lists incoming relations for a person (pagination + sort).
   *
   * @param personId person id
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of relations with pagination headers
   */
  @GetMapping(value = "/to/{personId}", params = {"page", "size"})
  public ResponseEntity<List<RelationView>> listTo(
      @PathVariable UUID personId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var id = Objects.requireNonNull(personId, "personId");
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    var pageRes = personRelationsRepository.findByToPersonIdAndDeletedAtIsNull(id, pageable)
        .map(r -> new RelationView(r.getId(), r.getFromPerson().getId(), r.getToPerson().getId(),
            r.getType(), r.getNote(), r.getValidFrom(), r.getValidTo()));
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  /**
   * Creates a new person relation.
   *
   * @param req relation data
   *
   * @return created relation
   */
  @PostMapping
  public ResponseEntity<RelationView> create(@RequestBody RelationCreate req) {
    var fromId = Objects.requireNonNull(req.fromPersonId(), "fromPersonId");
    var toId = Objects.requireNonNull(req.toPersonId(), "toPersonId");
    var type = Objects.requireNonNull(req.type(), "type");
    var existingActive = personRelationsRepository.findByFromPersonIdAndToPersonIdAndTypeAndDeletedAtIsNull(
      fromId, toId, type);
    if (existingActive.isPresent()) {
      return ResponseEntity.noContent().build();
    }
    var dto = PersonRelationDto.builder()
        .fromPerson(PersonDto.builder().id(fromId).build())
        .toPerson(PersonDto.builder().id(toId).build())
        .type(type)
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

  /**
   * Soft deletes a person relation by id.
   *
   * @param id relation id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete person relation", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    personRelationService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
