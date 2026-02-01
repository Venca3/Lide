package cz.vh.lide.core.tools;

import lombok.experimental.UtilityClass;

/**
 * String normalization utilities.
 * Normalizes text: trim, lowercase, replace multiple spaces with single space.
 */
@UtilityClass
public class StringNormalization {

  /**
   * Normalizes a string: trims, converts to lowercase, replaces multiple spaces with single space.
   *
   * @param str string to normalize (can be null)
   * @return normalized string or empty string if input is null/blank
   */
  public static String normalize(String str) {
    if (str == null || str.isBlank()) {
      return "";
    }
    return str.trim()
        .toLowerCase()
        .replaceAll("\\s+", " ");
  }

  /**
   * Checks if a string is blank after normalization.
   *
   * @param str string to check
   * @return true if normalized string is empty
   */
  public static boolean isBlankAfterNormalize(String str) {
    return normalize(str).isBlank();
  }
}
