package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Tag;
import cz.vh.lide.repo.TagRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyTagCrudStore implements TagCrudStore {

  private final TagRepository tagRepository;

  public LegacyTagCrudStore(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Override
  public Tag save(Tag tag) {
    return tagRepository.save(tag);
  }

  @Override
  public Optional<Tag> findById(UUID id) {
    return tagRepository.findById(id);
  }

  @Override
  public Optional<Tag> findByIdAndDeletedAtIsNull(UUID id) {
    return tagRepository.findByIdAndDeletedAtIsNull(id);
  }

  @Override
  public boolean softDeleteById(UUID id) {
    var tagOpt = tagRepository.findByIdAndDeletedAtIsNull(id);
    if (tagOpt.isEmpty()) {
      return false;
    }

    var tag = tagOpt.get();
    tag.setDeletedAt(Instant.now());
    tagRepository.save(tag);
    return true;
  }
}
