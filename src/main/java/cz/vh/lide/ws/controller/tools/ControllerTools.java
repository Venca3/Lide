package cz.vh.lide.ws.controller.tools;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.util.List;
import org.springframework.lang.NonNull;
import lombok.experimental.UtilityClass;

/**
 * Shared helpers for controller layer.
 */
@UtilityClass
public final class ControllerTools {
  /**
   * Builds pagination headers (`X-Total-Count`, `Link`) from a page result.
   *
   * @param pageRes page result
   * @param size requested page size
   *
   * @return HTTP headers with pagination metadata
   */
  public static HttpHeaders buildPaginationHeaders(@NonNull Page<?> pageRes, int size) {
    long total = pageRes.getTotalElements();
    int number = pageRes.getNumber();
    int totalPages = pageRes.getTotalPages();
    var headers = new HttpHeaders();
    headers.add("X-Total-Count", String.valueOf(total));
    if (totalPages <= 0) {
      return headers;
    }
    StringBuilder link = new StringBuilder();
    var base = ServletUriComponentsBuilder.fromCurrentRequest();
    if (number > 0) {
      var firstUri = base.replaceQueryParam("page", 0).replaceQueryParam("size", size).toUriString();
      link.append("<").append(firstUri).append(">; rel=\"first\"");
    }
    if (number > 0) {
      if (link.length() > 0) link.append(", ");
      var prevUri = base.replaceQueryParam("page", number - 1).replaceQueryParam("size", size).toUriString();
      link.append("<").append(prevUri).append(">; rel=\"prev\"");
    }
    if (number + 1 < totalPages) {
      if (link.length() > 0) link.append(", ");
      var nextUri = base.replaceQueryParam("page", number + 1).replaceQueryParam("size", size).toUriString();
      link.append("<").append(nextUri).append(">; rel=\"next\"");
    }
    if (number + 1 < totalPages) {
      if (link.length() > 0) link.append(", ");
      var lastUri = base.replaceQueryParam("page", Math.max(0, totalPages - 1)).replaceQueryParam("size", size).toUriString();
      link.append("<").append(lastUri).append(">; rel=\"last\"");
    }
    if (link.length() > 0) headers.add("Link", link.toString());
    return headers;
  }

  /**
   * Parses Spring `Sort` from request parameters.
   *
   * @param sortParams list of `field,dir` values (dir is `asc`/`desc`)
   *
   * @return parsed sort or `Sort.unsorted()` when empty/invalid
   */
  @NonNull
  public static Sort parseSort(List<String> sortParams) {
    if (sortParams == null || sortParams.isEmpty()) {
      return Sort.unsorted();
    }
    List<Sort.Order> orders = sortParams.stream()
        .filter(s -> s != null && !s.isBlank())
        .map(s -> s.split(",", 2))
        .map(parts -> {
          String property = parts[0].trim();
          if (property.isEmpty()) {
            return null;
          }
          if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) {
            return Sort.Order.desc(property);
          }
          return Sort.Order.asc(property);
        })
        .filter(o -> o != null)
        .toList();
    if (orders.isEmpty()) {
      return Sort.unsorted();
    }
    return Sort.by(orders);
  }
}
