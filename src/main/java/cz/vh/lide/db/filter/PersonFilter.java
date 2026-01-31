package cz.vh.lide.db.filter;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonFilter {
  private String firstNameContains;
  private String lastNameContains;
  private String nicknameContains;
  private String phoneContains;
  private String emailContains;
  private LocalDate bornFrom;
  private LocalDate bornTo;
  private Boolean includeDeleted;
}
