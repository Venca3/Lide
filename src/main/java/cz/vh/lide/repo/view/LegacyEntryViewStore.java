package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Entry;
import cz.vh.lide.repo.EntryRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyEntryViewStore implements EntryViewStore {

  private final EntryRepository entryRepository;

  public LegacyEntryViewStore(EntryRepository entryRepository) {
    this.entryRepository = entryRepository;
  }

  @Override
  public List<Entry> findAllByDeletedAtIsNull() {
    return entryRepository.findAllByDeletedAtIsNull();
  }

  @Override
  public Optional<Entry> findByIdAndDeletedAtIsNull(UUID id) {
    return entryRepository.findByIdAndDeletedAtIsNull(id);
  }
}
