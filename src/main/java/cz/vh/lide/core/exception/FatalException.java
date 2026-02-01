package cz.vh.lide.core.exception;

/**
 * Generic unrecoverable exception for core logic.
 */
public class FatalException extends RuntimeException {
  public FatalException(String message) {
    super(message);
  }
}
