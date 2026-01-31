package cz.vh.lide.ws.handler;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.Objects;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(DataIntegrityViolationException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ProblemDetail handleConflict(DataIntegrityViolationException ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
    pd.setTitle("Conflict");
    pd.setDetail("Operation violates a database constraint.");
    pd.setType(Objects.requireNonNull(URI.create("https://example.local/problems/conflict")));
    return pd;
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ProblemDetail handleBadRequest(IllegalArgumentException ex) {
    String msg = ex.getMessage() == null ? "" : ex.getMessage();
    if (msg.toLowerCase().contains("not found")) {
      ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
      pd.setTitle("Not Found");
      pd.setDetail(msg);
      pd.setType(Objects.requireNonNull(URI.create("https://example.local/problems/not-found")));
      return pd;
    }
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    pd.setTitle("Bad Request");
    pd.setDetail(msg);
    pd.setType(Objects.requireNonNull(URI.create("https://example.local/problems/bad-request")));
    return pd;
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    pd.setTitle("Validation failed");
    pd.setDetail("Request body validation failed.");
    pd.setType(Objects.requireNonNull(URI.create("https://example.local/problems/validation")));
    return pd;
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ProblemDetail handleStatus(ResponseStatusException ex) { 
    ProblemDetail pd = ProblemDetail.forStatus(ex.getStatusCode());
    pd.setTitle(ex.getStatusCode().toString());
    pd.setDetail(ex.getReason());
    pd.setType(Objects.requireNonNull(URI.create("https://example.local/problems/http-" + ex.getStatusCode().value())));
    return pd;
  }
}
