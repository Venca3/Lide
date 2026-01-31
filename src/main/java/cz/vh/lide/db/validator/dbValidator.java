package cz.vh.lide.db.validator;

import cz.vh.lide.db.dto.BaseDto;
import cz.vh.lide.db.entity.BaseEntity;
import lombok.NonNull;
import lombok.experimental.UtilityClass;

@UtilityClass
public class dbValidator {

  public static void validateCreateEntity(@NonNull BaseDto dto, @NonNull String entityName) {
    if (dto.getId() != null) {
      throw new IllegalArgumentException("New " + entityName + " cannot have predefined id");
    }
    if (dto.getCreatedAt() != null || dto.getUpdatedAt() != null || dto.getDeletedAt() != null) {
      throw new IllegalArgumentException(
          "New " +  entityName + " cannot have predefined timestamps");
    }
  }
  
  public static void validateCanDeletedEntity(@NonNull BaseEntity entity, @NonNull String entityName) {
    if (entity.getDeletedAt() != null) {
      throw new IllegalArgumentException(
          entityName + ": " + entity.getId() + " that is already deleted cannot be deleted again");
    }
  }
}
