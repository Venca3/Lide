package cz.vh.lide.ws.dto;

import java.time.Instant;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public final class MediaDtos {

  private MediaDtos() {
  }

  public record MediaView(UUID id, String mediaType, String mimeType, String uri,
      String title, String note, Instant takenAt) {
  }

  public record MediaCreate(@NotBlank String mediaType, String mimeType, @NotBlank String uri,
      String title, String note, Instant takenAt,
      List<BindingDtos.MediaEntryCreate> mediaEntries) {
  }

  public record MediaUpdate(@NotBlank String mediaType, String mimeType, @NotBlank String uri,
      String title, String note, Instant takenAt) {
  }
}
