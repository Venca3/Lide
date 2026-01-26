package cz.vh.lide.repo.crud;

import cz.vh.lide.domain.Entry;
import cz.vh.lide.repo.EntryRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class LegacyEntryCrudStore implements EntryCrudStore {

  private final EntryRepository entryRepository;

  public LegacyEntryCrudStore(EntryRepository entryRepository) {
    this.entryRepository = entryRepository;
  }

  @Override
  public Entry save(Entry entry) {
    return entryRepository.save(entry);
  }

  @Override
  public Optional<Entry> findById(UUID id) {
    return entryRepository.findById(id);
  }

  @Override
  public Optional<Entry> findByIdAndDeletedAtIsNull(UUID id) {
    return entryRepository.findByIdAndDeletedAtIsNull(id);
  }

  @Override
  public boolean softDeleteById(UUID id) {
    var entryOpt = entryRepository.findByIdAndDeletedAtIsNull(id);
    if (entryOpt.isEmpty()) {
      return false;
    }

    var entry = entryOpt.get();
    entry.setDeletedAt(Instant.now());
    entryRepository.save(entry);
    return true;
  }
}
