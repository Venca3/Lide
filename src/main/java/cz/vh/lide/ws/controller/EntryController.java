package cz.vh.lide.ws.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import cz.vh.lide.core.service.EntryService;
import cz.vh.lide.db.filter.EntryFilter;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.EntryDtos.EntryCreate;
import cz.vh.lide.ws.dto.EntryDtos.EntryUpdate;
import cz.vh.lide.ws.dto.EntryDtos.EntryView;
import cz.vh.lide.ws.mapper.WsMapper;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for entry CRUD operations.
 */
@RestController
@RequestMapping("/api/entries")
public class EntryController {

  private final EntryService entryService;

  /**
   * Creates the controller with required services.
   *
   * @param entryService entry service
   */
  public EntryController(EntryService entryService) {
    this.entryService = entryService;
  }

  /**
   * Lists all entries without pagination.
   *
   * @return list of entries
   */
  @GetMapping
  public ResponseEntity<List<EntryView>> list() {
    var items = entryService.list(Pageable.unpaged(), null)
        .getContent().stream()
        .map(WsMapper::toEntryView)
        .toList();
    return ResponseEntity.ok(items);
  }

  /**
   * Lists entries with pagination, optional search, and sorting.
   *
   * @param q search query (title/content)
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of entries with pagination headers
   */
  @GetMapping(params = {"page", "size"})
  public ResponseEntity<List<EntryView>> list(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    EntryFilter filter = null;
    if (q != null && !q.isBlank()) {
      filter = EntryFilter.builder()
          .titleContains(q)
          .contentContains(q)
          .build();
    }
    var pageRes = entryService.list(pageable, filter).map(WsMapper::toEntryView);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  /**
   * Gets a single entry by id.
   *
   * @param id entry id
   *
   * @return entry view
   */
  @GetMapping("/{id}")
  public ResponseEntity<EntryView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toEntryView(entryService.get(id)));
  }

  /**
   * Creates a new entry.
   *
   * @param req entry data
   *
   * @return created entry
   */
  @PostMapping
  public ResponseEntity<EntryView> create(@RequestBody EntryCreate req) {
    var created = entryService.create(WsMapper.toEntryDto(req));
    var location = URI.create("/api/entries/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toEntryView(created));
  }

  /**
   * Updates an entry by id.
   *
   * @param id entry id
   * @param req update data
   *
   * @return updated entry
   */
  @PutMapping("/{id}")
  public ResponseEntity<EntryView> update(@PathVariable UUID id, @RequestBody EntryUpdate req) {
    var updated = entryService.update(id, WsMapper.toEntryDto(req));
    return ResponseEntity.ok(WsMapper.toEntryView(updated));
  }

  /**
   * Soft deletes an entry by id.
   *
   * @param id entry id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete entry", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    entryService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
