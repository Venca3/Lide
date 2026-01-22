package cz.vh.lide.repo;

import cz.vh.lide.domain.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {
  List<Media> findAllByDeletedAtIsNull();

  Optional<Media> findByIdAndDeletedAtIsNull(UUID id);
}
