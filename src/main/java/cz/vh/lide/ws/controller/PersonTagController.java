package cz.vh.lide.ws.controller;

import cz.vh.lide.db.entity.PersonTag;
import cz.vh.lide.db.repository.PersonRepository;
import cz.vh.lide.db.repository.PersonTagRepository;
import cz.vh.lide.db.repository.TagRepository;
import cz.vh.lide.ws.dto.PersonDtos.PersonView;
import cz.vh.lide.ws.dto.TagDtos.TagView;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/personstags/")
public class PersonTagController {

  private final PersonTagRepository personTagRepository;
  private final PersonRepository personRepository;
  private final TagRepository tagRepository;

  public PersonTagController(PersonTagRepository personTagRepository,
      PersonRepository personRepository,
      TagRepository tagRepository) {
    this.personTagRepository = personTagRepository;
    this.personRepository = personRepository;
    this.tagRepository = tagRepository;
  }

  @GetMapping("/person/{personId}/tags")
  public ResponseEntity<List<TagView>> list(@PathVariable UUID personId) {
    var id = java.util.Objects.requireNonNull(personId, "personId");
    var links = personTagRepository.findByPersonId(id, org.springframework.data.domain.Pageable.unpaged())
        .stream().filter(l -> l.getDeletedAt() == null).toList();
    var tagIds = links.stream().map(l -> l.getTag().getId()).toList();
    var tags = tagRepository.findAllById(java.util.Objects.requireNonNull(tagIds)).stream()
        .filter(t -> t.getDeletedAt() == null)
        .map(t -> new TagView(t.getId(), t.getName()))
        .toList();
    return ResponseEntity.ok(tags);
  }

  @GetMapping("/tag/{tagId}/persons")
  public ResponseEntity<List<PersonView>> personsByTag(@PathVariable UUID tagId) {
    var id = java.util.Objects.requireNonNull(tagId, "tagId");
    var links = personTagRepository.findByTagId(id, org.springframework.data.domain.Pageable.unpaged())
      .stream().filter(l -> l.getDeletedAt() == null).toList();
    var personIds = links.stream().map(l -> l.getPerson().getId()).toList();
    var persons = personRepository.findAllById(java.util.Objects.requireNonNull(personIds)).stream()
      .filter(p -> p.getDeletedAt() == null)
      .map(p -> new PersonView(p.getId(), p.getFirstName(), p.getLastName(), p.getNickname(),
        p.getBirthDate(), p.getPhone(), p.getEmail(), p.getNote()))
      .toList();
    return ResponseEntity.ok(persons);
  }

  @PostMapping("/person/{personId}/tag/{tagId}")
  @Operation(summary = "Add person-tag link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> add(@PathVariable UUID personId, @PathVariable UUID tagId) {
    var pId = java.util.Objects.requireNonNull(personId, "personId");
    var tId = java.util.Objects.requireNonNull(tagId, "tagId");

    var existing = personTagRepository.findByPersonIdAndTagId(pId, tId);
    if (existing.isPresent()) {
      var link = existing.get();
      if (link.getDeletedAt() != null) {
        link.setDeletedAt(null);
        personTagRepository.save(link);
      }
      return ResponseEntity.noContent().build();
    }

    var person = personRepository.findById(pId)
        .orElseThrow(() -> new IllegalArgumentException("Person not found"));
    var tag = tagRepository.findById(tId)
        .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

    var link = new PersonTag();
    link.setPerson(person);
    link.setTag(tag);
    personTagRepository.save(link);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/person/{personId}/tag/{tagId}")
  @Operation(summary = "Remove person-tag link", responses = @ApiResponse(responseCode = "204", description = "No Content"))
  public ResponseEntity<Void> remove(@PathVariable UUID personId, @PathVariable UUID tagId) {
    var pId = java.util.Objects.requireNonNull(personId, "personId");
    var tId = java.util.Objects.requireNonNull(tagId, "tagId");
    var link = personTagRepository.findByPersonIdAndTagId(pId, tId)
        .orElseThrow(() -> new IllegalArgumentException("PersonTag link not found"));
    personTagRepository.softDelete(java.util.Objects.requireNonNull(link.getId(), "link id"));
    return ResponseEntity.noContent().build();
  }
}
