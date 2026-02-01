package cz.vh.lide.ws.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import cz.vh.lide.core.service.TagService;
import cz.vh.lide.db.filter.TagFilter;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.TagDtos.TagCreate;
import cz.vh.lide.ws.dto.TagDtos.TagUpdate;
import cz.vh.lide.ws.dto.TagDtos.TagView;
import cz.vh.lide.ws.mapper.WsMapper;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for tag CRUD operations.
 */
@RestController
@RequestMapping("/api/tags")
public class TagController {

  private final TagService tagService;

  /**
   * Creates the controller with required services.
   *
   * @param tagService tag service
   */
  public TagController(TagService tagService) {
    this.tagService = tagService;
  }

  /**
   * Lists all tags without pagination.
   *
   * @return list of tags
   */
  @GetMapping
  public ResponseEntity<List<TagView>> list() {
    var items = tagService.list(Pageable.unpaged(), null)
        .getContent().stream()
        .map(WsMapper::toTagView)
        .toList();
    return ResponseEntity.ok(items);
  }

  /**
   * Lists tags with pagination, optional search, and sorting.
   *
   * @param q search query (name)
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of tags with pagination headers
   */
  @GetMapping(params = {"page", "size"})
  public ResponseEntity<List<TagView>> list(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    TagFilter filter = null;
    if (q != null && !q.isBlank()) {
      filter = TagFilter.builder()
          .nameContains(q)
          .build();
    }
    var pageRes = tagService.list(pageable, filter).map(WsMapper::toTagView);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  /**
   * Gets a single tag by id.
   *
   * @param id tag id
   *
   * @return tag view
   */
  @GetMapping("/{id}")
  public ResponseEntity<TagView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toTagView(tagService.get(id)));
  }

  /**
   * Creates a new tag.
   *
   * @param req tag data
   *
   * @return created tag
   */
  @PostMapping
  public ResponseEntity<TagView> create(@RequestBody TagCreate req) {
    var created = tagService.create(WsMapper.toTagDto(req));
    var location = URI.create("/api/tags/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toTagView(created));
  }

  /**
   * Updates a tag by id.
   *
   * @param id tag id
   * @param req update data
   *
   * @return updated tag
   */
  @PutMapping("/{id}")
  public ResponseEntity<TagView> update(@PathVariable UUID id, @RequestBody TagUpdate req) {
    var updated = tagService.update(id, WsMapper.toTagDto(req));
    return ResponseEntity.ok(WsMapper.toTagView(updated));
  }

  /**
   * Soft deletes a tag by id.
   *
   * @param id tag id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete tag", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    tagService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
