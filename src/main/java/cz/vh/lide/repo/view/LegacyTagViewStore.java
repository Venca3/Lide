package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Tag;
import cz.vh.lide.repo.TagRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyTagViewStore implements TagViewStore {

  private final TagRepository tagRepository;

  public LegacyTagViewStore(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Override
  public List<Tag> findAllByDeletedAtIsNull() {
    return tagRepository.findAllByDeletedAtIsNull();
  }

  @Override
  public Optional<Tag> findByIdAndDeletedAtIsNull(UUID id) {
    return tagRepository.findByIdAndDeletedAtIsNull(id);
  }

  @Override
  public boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name) {
    return tagRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(name);
  }
}
