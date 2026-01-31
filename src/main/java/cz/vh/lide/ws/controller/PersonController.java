package cz.vh.lide.ws.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import cz.vh.lide.core.service.PersonService;
import cz.vh.lide.ws.dto.PersonDtos.PersonCreate;
import cz.vh.lide.ws.dto.PersonDtos.PersonUpdate;
import cz.vh.lide.ws.dto.PersonDtos.PersonView;
import cz.vh.lide.ws.mapper.WsMapper;
import lombok.NonNull;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/persons")
public class PersonController {

  private final PersonService personService;

  public PersonController(@NonNull PersonService personService) {
    this.personService = personService;
  }

  @GetMapping
  public ResponseEntity<List<PersonView>> list() {
    var items = personService.list(org.springframework.data.domain.Pageable.unpaged(), null)
        .getContent().stream()
        .map(WsMapper::toPersonView)
        .toList();
    return ResponseEntity.ok(items);
  }

  @GetMapping(params = {"q", "page", "size"})
  public ResponseEntity<List<PersonView>> list(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    var pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page), Math.max(1, size));
    cz.vh.lide.db.filter.PersonFilter filter = null;
    if (q != null && !q.isBlank()) {
      filter = cz.vh.lide.db.filter.PersonFilter.builder()
          .firstNameContains(q)
          .lastNameContains(q)
          .nicknameContains(q)
          .emailContains(q)
          .phoneContains(q)
          .build();
    }
    var pageRes = personService.list(pageable, filter).map(WsMapper::toPersonView);
    long total = pageRes.getTotalElements();
    int number = pageRes.getNumber();
    int totalPages = pageRes.getTotalPages();
    var headers = new org.springframework.http.HttpHeaders();
    headers.add("X-Total-Count", String.valueOf(total));
    StringBuilder link = new StringBuilder();
    var base = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentRequest();
    if (number + 1 < totalPages) {
      var nextUri = base.replaceQueryParam("page", number + 1).replaceQueryParam("size", size).toUriString();
      link.append("<").append(nextUri).append(">; rel=\"next\"");
    }
    if (number > 0) {
      if (link.length() > 0) link.append(", ");
      var prevUri = base.replaceQueryParam("page", number - 1).replaceQueryParam("size", size).toUriString();
      link.append("<").append(prevUri).append(">; rel=\"prev\"");
    }
    if (link.length() > 0) headers.add("Link", link.toString());
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  @GetMapping("/{id}")
  public ResponseEntity<PersonView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toPersonView(personService.get(id)));
  }

  @PostMapping
  public ResponseEntity<PersonView> create(@RequestBody PersonCreate req) {
    var created = personService.create(WsMapper.toPersonDto(req));
    URI location = URI.create("/api/persons/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toPersonView(created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<PersonView> update(@PathVariable UUID id, @RequestBody PersonUpdate req) {
    var updated = personService.update(id, WsMapper.toPersonDto(req));
    return ResponseEntity.ok(WsMapper.toPersonView(updated));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete person", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    personService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}