package cz.vh.lide.ws.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import cz.vh.lide.core.service.PersonService;
import cz.vh.lide.db.filter.PersonFilter;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.PersonDtos.PersonCreate;
import cz.vh.lide.ws.dto.PersonDtos.PersonUpdate;
import cz.vh.lide.ws.dto.PersonDtos.PersonView;
import cz.vh.lide.ws.mapper.WsMapper;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for person CRUD operations.
 */
@RestController
@RequestMapping("/api/persons")
public class PersonController {

  private final PersonService personService;

  /**
   * Creates the controller with required services.
   *
   * @param personService person service
   */
  public PersonController(PersonService personService) {
    this.personService = personService;
  }

  /**
   * Lists all persons without pagination.
   *
   * @return list of persons
   */
  @GetMapping
  public ResponseEntity<List<PersonView>> list() {
    var items = personService.list(Pageable.unpaged(), null)
        .getContent().stream()
        .map(WsMapper::toPersonView)
        .toList();
    return ResponseEntity.ok(items);
  }

  /**
   * Lists persons with pagination, optional search, and sorting.
   *
   * @param q search query (name, nickname, email, phone)
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of persons with pagination headers
   */
  @GetMapping(params = {"page", "size"})
  public ResponseEntity<List<PersonView>> list(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    PersonFilter filter = null;
    if (q != null && !q.isBlank()) {
      filter = PersonFilter.builder()
          .firstNameContains(q)
          .lastNameContains(q)
          .nicknameContains(q)
          .emailContains(q)
          .phoneContains(q)
          .build();
    }
    var pageRes = personService.list(pageable, filter).map(WsMapper::toPersonView);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  /**
   * Gets a single person by id.
   *
   * @param id person id
   *
   * @return person view
   */
  @GetMapping("/{id}")
  public ResponseEntity<PersonView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toPersonView(personService.get(id)));
  }

  /**
   * Creates a new person.
   *
   * @param req person data
   *
   * @return created person
   */
  @PostMapping
  public ResponseEntity<PersonView> create(@RequestBody PersonCreate req) {
    var created = personService.create(WsMapper.toPersonDto(req));
    URI location = URI.create("/api/persons/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toPersonView(created));
  }

  /**
   * Updates a person by id.
   *
   * @param id person id
   * @param req update data
   *
   * @return updated person
   */
  @PutMapping("/{id}")
  public ResponseEntity<PersonView> update(@PathVariable UUID id, @RequestBody PersonUpdate req) {
    var updated = personService.update(id, WsMapper.toPersonDto(req));
    return ResponseEntity.ok(WsMapper.toPersonView(updated));
  }

  /**
   * Soft deletes a person by id.
   *
   * @param id person id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete person", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    personService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}