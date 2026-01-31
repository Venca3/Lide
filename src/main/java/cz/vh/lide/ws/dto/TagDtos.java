package cz.vh.lide.ws.dto;

import java.util.List;
import java.util.UUID;

public final class TagDtos {

  private TagDtos() {
  }

  public record TagView(UUID id, String name) {
  }

  public record TagCreate(String name,
      List<BindingDtos.EntryTagCreate> entryTags,
      List<BindingDtos.PersonTagCreate> personTags) {
  }

  public record TagUpdate(String name) {
  }
}
