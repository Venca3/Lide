# db.validator

Validation helpers for DTOs and entity state checks.

## Classes
- dbValidator: validates create/update/delete operations and constraints.

## Usage
- Invoked by core.service layer before persistence operations.

## Public interface pattern
- validateCreateEntity(dto, name)
- validateCanDeletedEntity(entity, name)