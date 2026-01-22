package cz.vh.lide.api.dto;

import java.time.Instant;
import java.util.UUID;

public class EntryDtos {

  public record EntryCreate(
      String type,
      String title,
      String content,
      Instant occurredAt) {
  }

  public record EntryUpdate(
      String type,
      String title,
      String content,
      Instant occurredAt) {
  }

  public record EntryView(
      UUID id,
      String type,
      String title,
      String content,
      Instant occurredAt) {
  }
}
