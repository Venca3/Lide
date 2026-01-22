package cz.vh.lide.api.dto;

import java.time.Instant;
import java.util.UUID;

public class MediaDtos {

  public record MediaCreate(
      String mediaType,
      String mimeType,
      String uri,
      String title,
      String note,
      Instant takenAt) {
  }

  public record MediaUpdate(
      String mediaType,
      String mimeType,
      String uri,
      String title,
      String note,
      Instant takenAt) {
  }

  public record MediaView(
      UUID id,
      String mediaType,
      String mimeType,
      String uri,
      String title,
      String note,
      Instant takenAt) {
  }
}
