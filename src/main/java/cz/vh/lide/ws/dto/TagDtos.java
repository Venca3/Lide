package cz.vh.lide.ws.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public final class TagDtos {

  private TagDtos() {
  }

  public record TagView(UUID id, String name) {
  }

  public record TagCreate(@NotBlank String name,
      List<BindingDtos.EntryTagCreate> entryTags,
      List<BindingDtos.PersonTagCreate> personTags) {
  }

  public record TagUpdate(@NotBlank String name) {
  }
}
