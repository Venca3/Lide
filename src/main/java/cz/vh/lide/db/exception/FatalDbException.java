package cz.vh.lide.db.exception;

import cz.vh.lide.core.exception.FatalException;

public class FatalDbException extends FatalException {
  public FatalDbException(String message) {
    super(message);
  }
}
