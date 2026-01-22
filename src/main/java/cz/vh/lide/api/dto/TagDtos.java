package cz.vh.lide.api.dto;

import java.util.UUID;

public class TagDtos {

  public record TagCreate(String name) {
  }

  public record TagUpdate(String name) {
  }

  public record TagView(UUID id, String name) {
  }
}
