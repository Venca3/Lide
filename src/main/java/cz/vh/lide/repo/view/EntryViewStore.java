package cz.vh.lide.repo.view;

import cz.vh.lide.domain.Entry;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EntryViewStore {

  List<Entry> findAllByDeletedAtIsNull();

  Optional<Entry> findByIdAndDeletedAtIsNull(UUID id);
}
