# db.mapper

Mapping between db.dto DTOs and db.entity entities.

## Mappers
- DbMapper: central mapping component for all entities and DTOs.

## Usage
- Used by core.service layer for create/update/get operations.

## Public interface pattern
- toXxxEntity(dto) / toXxxDto(entity)
- updateXxxFromDto(dto, entity) for partial updates