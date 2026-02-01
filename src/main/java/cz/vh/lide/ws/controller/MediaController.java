package cz.vh.lide.ws.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import cz.vh.lide.core.service.MediaService;
import cz.vh.lide.db.filter.MediaFilter;
import cz.vh.lide.ws.controller.tools.ControllerTools;
import cz.vh.lide.ws.dto.MediaDtos.MediaCreate;
import cz.vh.lide.ws.dto.MediaDtos.MediaUpdate;
import cz.vh.lide.ws.dto.MediaDtos.MediaView;
import cz.vh.lide.ws.mapper.WsMapper;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for media CRUD operations.
 */
@RestController
@RequestMapping("/api/media")
public class MediaController {

  private final MediaService mediaService;

  /**
   * Creates the controller with required services.
   *
   * @param mediaService media service
   */
  public MediaController(MediaService mediaService) {
    this.mediaService = mediaService;
  }

  /**
   * Lists all media without pagination.
   *
   * @return list of media
   */
  @GetMapping
  public ResponseEntity<List<MediaView>> list() {
    var items = mediaService.list(Pageable.unpaged(), null)
        .getContent().stream()
        .map(WsMapper::toMediaView)
        .toList();
    return ResponseEntity.ok(items);
  }

  /**
   * Lists media with pagination, optional search, and sorting.
   *
   * @param q search query (title, note, uri)
   * @param page page index (0-based)
   * @param size page size
   * @param sort sort parameters (field,dir)
   *
   * @return list of media with pagination headers
   */
  @GetMapping(params = {"page", "size"})
  public ResponseEntity<List<MediaView>> list(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) List<String> sort) {
    var pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), ControllerTools.parseSort(sort));
    MediaFilter filter = null;
    if (q != null && !q.isBlank()) {
        filter = MediaFilter.builder()
          .titleContains(q)
          .uriContains(q)
          .build();
    }
    var pageRes = mediaService.list(pageable, filter).map(WsMapper::toMediaView);
    var headers = ControllerTools.buildPaginationHeaders(pageRes, size);
    return ResponseEntity.ok().headers(headers).body(pageRes.getContent());
  }

  /**
   * Gets a single media item by id.
   *
   * @param id media id
   *
   * @return media view
   */
  @GetMapping("/{id}")
  public ResponseEntity<MediaView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toMediaView(mediaService.get(id)));
  }

  /**
   * Creates a new media item.
   *
   * @param req media data
   *
   * @return created media item
   */
  @PostMapping
  public ResponseEntity<MediaView> create(@RequestBody MediaCreate req) {
    var created = mediaService.create(WsMapper.toMediaDto(req));
    var location = URI.create("/api/media/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toMediaView(created));
  }

  /**
   * Updates a media item by id.
   *
   * @param id media id
   * @param req update data
   *
   * @return updated media item
   */
  @PutMapping("/{id}")
  public ResponseEntity<MediaView> update(@PathVariable UUID id, @RequestBody MediaUpdate req) {
    var updated = mediaService.update(id, WsMapper.toMediaDto(req));
    return ResponseEntity.ok(WsMapper.toMediaView(updated));
  }

  /**
   * Soft deletes a media item by id.
   *
   * @param id media id
   *
   * @return 204 No Content
   */
  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete media", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    mediaService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
