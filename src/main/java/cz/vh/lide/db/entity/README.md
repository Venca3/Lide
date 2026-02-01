# db.entity

JPA entity classes representing database tables, including relation entities.

## Entities
- BaseEntity
- Entry
- EntryTag
- Media
- MediaEntry
- Person
- PersonEntry
- PersonRelation
- PersonTag
- Tag

## Notes
- Soft delete is implemented via deletedAt fields.
- Some entities include updatedAt for audit.

## Used by
- db.repository.* for persistence.
- db.mapper.DbMapper for mapping.