package cz.vh.lide.ws.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import cz.vh.lide.core.service.EntryService;
import cz.vh.lide.ws.dto.EntryDtos.EntryCreate;
import cz.vh.lide.ws.dto.EntryDtos.EntryUpdate;
import cz.vh.lide.ws.dto.EntryDtos.EntryView;
import cz.vh.lide.ws.mapper.WsMapper;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

  private final EntryService entryService;

  public EntryController(EntryService entryService) {
    this.entryService = entryService;
  }

  @GetMapping
  public ResponseEntity<List<EntryView>> list() {
    var items = entryService.listNotDeleted().stream()
        .map(WsMapper::toEntryView)
        .toList();
    return ResponseEntity.ok(items);
  }

  @GetMapping(params = {"page", "size"})
  public ResponseEntity<List<EntryView>> list(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    var pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page), Math.max(1, size));
    cz.vh.lide.db.filter.EntryFilter filter = null;
    if (q != null && !q.isBlank()) {
      filter = cz.vh.lide.db.filter.EntryFilter.builder()
          .titleContains(q)
          .contentContains(q)
          .build();
    }
    var pageRes = entryService.list(pageable, filter).map(WsMapper::toEntryView);
    long total = pageRes.getTotalElements();
    int number = pageRes.getNumber();
    int totalPages = pageRes.getTotalPages();
    var headers = new org.springframework.http.HttpHeaders();
    headers.add("X-Total-Count", String.valueOf(total));
    StringBuilder link = new StringBuilder();
    var base = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentRequest();
    if (totalPages > 0 && number > 0) {
      var firstUri = base.replaceQueryParam("page", 0).replaceQueryParam("size", size).toUriString();
      link.append("<").append(firstUri).append(">; rel=\"first\"");
    }
    if (number > 0) {
      if (link.length() > 0) link.append(", ");
      var prevUri = base.replaceQueryParam("page", number - 1).replaceQueryParam("size", size).toUriString();
      link.append("<").append(prevUri).append(">; rel=\"prev\"");
    }
    if (number + 1 < totalPages) {
      if (link.length() > 0) link.append(", ");
      var nextUri = base.replaceQueryParam("page", number + 1).replaceQueryParam("size", size).toUriString();
      link.append("<").append(nextUri).append(">; rel=\"next\"");
    }
    if (totalPages > 0 && number + 1 < totalPages) {
      if (link.length() > 0) link.append(", ");
      var lastUri = base.replaceQueryParam("page", Math.max(0, totalPages - 1)).replaceQueryParam("size", size).toUriString();
      link.append("<").append(lastUri).append(">; rel=\"last\"");
    }
    if (link.length() > 0) headers.add("Link", link.toString());
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  @GetMapping("/{id}")
  public ResponseEntity<EntryView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toEntryView(entryService.get(id)));
  }

  @PostMapping
  public ResponseEntity<EntryView> create(@RequestBody EntryCreate req) {
    var created = entryService.create(WsMapper.toEntryDto(req));
    var location = URI.create("/api/entries/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toEntryView(created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<EntryView> update(@PathVariable UUID id, @RequestBody EntryUpdate req) {
    var updated = entryService.update(id, WsMapper.toEntryDto(req));
    return ResponseEntity.ok(WsMapper.toEntryView(updated));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete entry", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    entryService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
