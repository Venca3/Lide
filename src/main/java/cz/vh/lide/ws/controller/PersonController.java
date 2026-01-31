package cz.vh.lide.ws.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    personService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}