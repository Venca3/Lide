# db.dto

Database-level DTOs used by core services and mappers. These represent persisted data
and relation DTOs aligned with entities.

## DTOs
- BaseDto
- EntryDto
- EntryTagDto
- MediaDto
- MediaEntryDto
- PersonDto
- PersonEntryDto
- PersonRelationDto
- PersonTagDto
- TagDto

## Usage
- Mapped by db.mapper.DbMapper.
- Used by core.service layer for CRUD operations and relation linking.

## Public interface pattern
- DTOs mirror db.entity fields and relations.
- Used as service-level input/output contracts.