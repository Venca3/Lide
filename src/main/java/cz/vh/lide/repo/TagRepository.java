package cz.vh.lide.repo;

import cz.vh.lide.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

  List<Tag> findAllByDeletedAtIsNull();

  Optional<Tag> findByIdAndDeletedAtIsNull(UUID id);

  boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);
}
