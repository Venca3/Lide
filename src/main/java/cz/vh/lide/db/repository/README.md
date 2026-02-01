# db.repository

Spring Data repositories for persistence. These interfaces are used by core services
and typically provide standard CRUD plus soft-delete and filtered queries.

## Repositories
- EntryRepository
- EntryTagRepository
- MediaEntryRepository
- MediaRepository
- PersonEntryRepository
- PersonRelationsRepository
- PersonRepository
- PersonTagRepository
- TagRepository

## Conventions
- Soft delete is used across entities.
- Query methods usually filter out deleted records.
- Relation repositories expose `...AndDeletedAtIsNull` helpers for paging without deleted links.
- Relation tables use partial unique indexes for active links only (multiple historical rows allowed).
- Custom operations may include softDelete(id) where applicable.

## Used by
- core.service.* services call repositories directly.

## Public interface pattern
- Extends Spring Data interfaces (JpaRepository).
- Optional custom queries and softDelete(id) where implemented.