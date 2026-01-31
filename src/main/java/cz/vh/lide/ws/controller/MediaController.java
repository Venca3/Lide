package cz.vh.lide.ws.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import cz.vh.lide.core.service.MediaService;
import cz.vh.lide.ws.dto.MediaDtos.MediaCreate;
import cz.vh.lide.ws.dto.MediaDtos.MediaUpdate;
import cz.vh.lide.ws.dto.MediaDtos.MediaView;
import cz.vh.lide.ws.mapper.WsMapper;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

  private final MediaService mediaService;

  public MediaController(MediaService mediaService) {
    this.mediaService = mediaService;
  }

  @GetMapping
  public ResponseEntity<List<MediaView>> list() {
    var items = mediaService.list(org.springframework.data.domain.Pageable.unpaged(), null)
        .getContent().stream()
        .map(WsMapper::toMediaView)
        .toList();
    return ResponseEntity.ok(items);
  }

  @GetMapping("/{id}")
  public ResponseEntity<MediaView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toMediaView(mediaService.get(id)));
  }

  @PostMapping
  public ResponseEntity<MediaView> create(@RequestBody MediaCreate req) {
    var created = mediaService.create(WsMapper.toMediaDto(req));
    var location = URI.create("/api/media/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toMediaView(created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<MediaView> update(@PathVariable UUID id, @RequestBody MediaUpdate req) {
    var updated = mediaService.update(id, WsMapper.toMediaDto(req));
    return ResponseEntity.ok(WsMapper.toMediaView(updated));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Soft delete media", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    mediaService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
