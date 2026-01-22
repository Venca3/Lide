package cz.vh.lide.repo;

import cz.vh.lide.domain.Entry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EntryRepository extends JpaRepository<Entry, UUID> {
  List<Entry> findAllByDeletedAtIsNull();

  Optional<Entry> findByIdAndDeletedAtIsNull(UUID id);
}
