# core.service

Business logic layer for creating, updating, reading and soft-deleting core entities.
Services here coordinate mapping, validation, and linking of relation entities.

## Services
- EntryService: CRUD for entries, links entry-tags, person-entries, media-entries.
- EntryTagService: CRUD for entry-tag relations.
- MediaEntryService: CRUD for media-entry relations.
- MediaService: CRUD for media, links media-entries.
- PersonEntryService: CRUD for person-entry relations.
- PersonRelationService: CRUD for person-to-person relations.
- PersonService: CRUD for persons, links person-entries, person-tags, relations.
- PersonTagService: CRUD for person-tag relations.
- TagService: CRUD for tags, links entry-tags and person-tags.

## Common dependencies
- db.repository.*Repository: persistence layer.
- db.mapper.DbMapper: DTO ↔ entity mapping.
- db.validator.dbValidator: input validation.
- core.tools.JpaTools: safe linking of relations.

## Inter-service dependencies
- EntryService uses EntryTagService, PersonEntryService, MediaEntryService.
- MediaService uses MediaEntryService.
- PersonService uses PersonEntryService, PersonTagService, PersonRelationService.
- TagService uses EntryTagService, PersonTagService.

## Used by
- ws.controller.* controllers call these services for business logic.

## Public interface pattern
Most services expose:
- create(dto)
- update(id, dto)
- get(id)
- list(pageable, filter)
- softDelete(id)

Read operations are read-only by default; write operations are explicit.