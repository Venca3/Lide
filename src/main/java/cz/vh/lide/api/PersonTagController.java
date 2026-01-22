package cz.vh.lide.api;

import cz.vh.lide.api.dto.PersonDtos.PersonView;
import cz.vh.lide.api.dto.TagDtos.TagView;
import cz.vh.lide.domain.PersonTag;
import cz.vh.lide.repo.PersonRepository;
import cz.vh.lide.repo.PersonTagRepository;
import cz.vh.lide.repo.TagRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/personstags/")
public class PersonTagController {

  private final PersonRepository personRepo;
  private final TagRepository tagRepo;
  private final PersonTagRepository personTagRepo;

  public PersonTagController(PersonRepository personRepo, TagRepository tagRepo, PersonTagRepository personTagRepo) {
    this.personRepo = personRepo;
    this.tagRepo = tagRepo;
    this.personTagRepo = personTagRepo;
  }

  @GetMapping("/person/{personId}/tags")
  public ResponseEntity<?> list(@PathVariable UUID personId) {
    // 404 pokud person neexistuje
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));

    var tagIds = personTagRepo.findAllByPersonIdAndDeletedAtIsNull(personId)
        .stream().map(PersonTag::getTagId).toList();

    // jednoduché: natáhneme tagy a filtrujeme deleted
    var tags = tagRepo.findAllById(tagIds).stream()
        .filter(t -> t.getDeletedAt() == null)
        .map(t -> new TagView(t.getId(), t.getName()))
        .toList();

    return ResponseEntity.ok(tags);
  }

  @GetMapping("/tag/{tagId}/persons")
  public ResponseEntity<?> personsByTag(@PathVariable UUID tagId) {
    tagRepo.findByIdAndDeletedAtIsNull(tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));

    var personIds = personTagRepo.findAllByTagIdAndDeletedAtIsNull(tagId)
        .stream().map(pt -> pt.getPersonId()).toList();

    var persons = personRepo.findAllById(personIds).stream()
        .filter(p -> p.getDeletedAt() == null)
        .map(p -> new PersonView(
            p.getId(),
            p.getFirstName(),
            p.getLastName(),
            p.getNickname(),
            p.getBirthDate(),
            p.getPhone(),
            p.getEmail(),
            p.getNote()))
        .toList();

    return ResponseEntity.ok(persons);
  }

  @PostMapping("/person/{personId}/tag/{tagId}")
  public ResponseEntity<?> add(@PathVariable UUID personId, @PathVariable UUID tagId) {
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
    tagRepo.findByIdAndDeletedAtIsNull(tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));

    var existing = personTagRepo.findByPersonIdAndTagId(personId, tagId);

    if (existing.isPresent()) {
      var pt = existing.get();
      if (pt.getDeletedAt() != null) {
        pt.setDeletedAt(null); // undelete
        personTagRepo.save(pt);
      }
      return ResponseEntity.noContent().build();
    }

    PersonTag pt = new PersonTag();
    pt.setPersonId(personId);
    pt.setTagId(tagId);
    personTagRepo.save(pt);

    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/person/{personId}/tag/{tagId}")
  public ResponseEntity<?> remove(@PathVariable UUID personId, @PathVariable UUID tagId) {
    personRepo.findByIdAndDeletedAtIsNull(personId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
    tagRepo.findByIdAndDeletedAtIsNull(tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag not found"));

    var pt = personTagRepo.findByPersonIdAndTagIdAndDeletedAtIsNull(personId, tagId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tag is not assigned to this person"));

    pt.setDeletedAt(Instant.now());
    personTagRepo.save(pt);
    return ResponseEntity.noContent().build();
  }
}
