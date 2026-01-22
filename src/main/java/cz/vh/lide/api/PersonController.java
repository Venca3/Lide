package cz.vh.lide.api;

import cz.vh.lide.api.dto.PersonDtos.*;
import cz.vh.lide.domain.Person;
import cz.vh.lide.repo.PersonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/persons")
public class PersonController {

  private final PersonRepository repo;

  public PersonController(PersonRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public ResponseEntity<?> list() {
    return ResponseEntity.ok(repo.findAllByDeletedAtIsNull().stream().map(this::toView).toList());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable UUID id) {
    return repo.findByIdAndDeletedAtIsNull(id)
        .map(p -> ResponseEntity.ok(toView(p)))
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody PersonCreate req) {
    if (req == null || req.firstName() == null || req.firstName().isBlank()) {
      return ResponseEntity.badRequest().body("firstName is required");
    }

    Person p = new Person();
    applyCreateOrUpdate(p, req.firstName(), req.lastName(), req.nickname(), req.birthDate(), req.phone(), req.email(),
        req.note());

    p = repo.save(p);
    return ResponseEntity
        .created(URI.create("/api/persons/" + p.getId()))
        .body(toView(p));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody PersonUpdate req) {
    return repo.findByIdAndDeletedAtIsNull(id)
        .map(p -> {
          // u update dovolíme i null hodnoty = přepíšeš na null
          applyCreateOrUpdate(p, req.firstName(), req.lastName(), req.nickname(), req.birthDate(), req.phone(),
              req.email(), req.note());
          Person saved = repo.save(p);
          return ResponseEntity.ok(toView(saved));
        })
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> softDelete(@PathVariable UUID id) {
    return repo.findByIdAndDeletedAtIsNull(id)
        .map(p -> {
          p.setDeletedAt(Instant.now());
          repo.save(p);
          return ResponseEntity.noContent().build();
        })
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Person not found"));
  }

  private void applyCreateOrUpdate(Person p,
      String firstName,
      String lastName,
      String nickname,
      java.time.LocalDate birthDate,
      String phone,
      String email,
      String note) {
    if (firstName != null)
      p.setFirstName(firstName);
    p.setLastName(lastName);
    p.setNickname(nickname);
    p.setBirthDate(birthDate);
    p.setPhone(phone);
    p.setEmail(email);
    p.setNote(note);
  }

  private PersonView toView(Person p) {
    return new PersonView(
        p.getId(),
        p.getFirstName(),
        p.getLastName(),
        p.getNickname(),
        p.getBirthDate(),
        p.getPhone(),
        p.getEmail(),
        p.getNote());
  }
}