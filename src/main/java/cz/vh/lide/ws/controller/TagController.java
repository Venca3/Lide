package cz.vh.lide.ws.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import cz.vh.lide.core.service.TagService;
import cz.vh.lide.ws.dto.TagDtos.TagCreate;
import cz.vh.lide.ws.dto.TagDtos.TagUpdate;
import cz.vh.lide.ws.dto.TagDtos.TagView;
import cz.vh.lide.ws.mapper.WsMapper;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
public class TagController {

  private final TagService tagService;

  public TagController(TagService tagService) {
    this.tagService = tagService;
  }

  @GetMapping
  public ResponseEntity<List<TagView>> list() {
    var items = tagService.list(org.springframework.data.domain.Pageable.unpaged(), null)
        .getContent().stream()
        .map(WsMapper::toTagView)
        .toList();
    return ResponseEntity.ok(items);
  }

  @GetMapping("/{id}")
  public ResponseEntity<TagView> get(@PathVariable UUID id) {
    return ResponseEntity.ok(WsMapper.toTagView(tagService.get(id)));
  }

  @PostMapping
  public ResponseEntity<TagView> create(@RequestBody TagCreate req) {
    var created = tagService.create(WsMapper.toTagDto(req));
    var location = URI.create("/api/tags/" + created.getId());
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.LOCATION, location.toString())
      .body(WsMapper.toTagView(created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<TagView> update(@PathVariable UUID id, @RequestBody TagUpdate req) {
    var updated = tagService.update(id, WsMapper.toTagDto(req));
    return ResponseEntity.ok(WsMapper.toTagView(updated));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
    tagService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
