# ws.controller

REST controllers for CRUD endpoints, relation management, and read aggregation.
Controllers delegate to core services and DTOs for request/response.

## Controllers
- HealthController: health check endpoint.
- PersonController: CRUD for persons.
- TagController: CRUD for tags.
- EntryController: CRUD for entries.
- MediaController: CRUD for media.
- PersonTagController: person ↔ tag relations.
- EntryTagController: entry ↔ tag relations.
- PersonEntryController: person ↔ entry relations (with optional role).
- MediaEntryController: media ↔ entry relations (caption/sort order).
- PersonRelationController: person ↔ person relations.
- PersonReadController: aggregated person read view.
- EntryReadController: aggregated entry read view.
- ws.controller.tools (helpers): see [tools/README.md](tools/README.md).

## Endpoint patterns
- /api/{entity}: CRUD
- /api/{entity}read/{id}: aggregated read
- /api/{relation}/...: relation management (idempotent add/remove)

List endpoints commonly support `q`, `page`, `size`, and `sort` (format: `field,dir`). Relation list endpoints support `page`, `size`, and `sort` with pagination headers.

Relation add endpoints are idempotent for existing active links; if a soft-deleted link exists, add creates a new link (no undelete).

## API (paths + usage)

### CRUD
- GET /api/{entity}
- GET /api/{entity}?page=0&size=20&sort=field,asc
- GET /api/{entity}/{id}
- POST /api/{entity}
- PUT /api/{entity}/{id}
- DELETE /api/{entity}/{id}

### Relations (list)
- GET /api/personstags/person/{personId}/tags
- GET /api/personstags/person/{personId}/tags?page=0&size=20&sort=name,asc
- GET /api/personstags/tag/{tagId}/persons
- GET /api/personstags/tag/{tagId}/persons?page=0&size=20&sort=lastName,asc

- GET /api/entriestags/entry/{entryId}/tags
- GET /api/entriestags/entry/{entryId}/tags?page=0&size=20&sort=name,asc
- GET /api/entriestags/tag/{tagId}/entries
- GET /api/entriestags/tag/{tagId}/entries?page=0&size=20&sort=title,asc

- GET /api/personentry/person/{personId}/entries
- GET /api/personentry/person/{personId}/entries?page=0&size=20&sort=title,asc
- GET /api/personentry/entry/{entryId}/persons
- GET /api/personentry/entry/{entryId}/persons?page=0&size=20&sort=lastName,asc

- GET /api/mediaentry/entry/{entryId}/media
- GET /api/mediaentry/entry/{entryId}/media?page=0&size=20&sort=sortOrder,asc
- GET /api/mediaentry/media/{mediaId}/entries
- GET /api/mediaentry/media/{mediaId}/entries?page=0&size=20&sort=occurredAt,desc

- GET /api/personrelation/from/{personId}
- GET /api/personrelation/from/{personId}?page=0&size=20&sort=validFrom,desc
- GET /api/personrelation/to/{personId}
- GET /api/personrelation/to/{personId}?page=0&size=20&sort=validFrom,desc

### Relations (add/remove)
- POST /api/personstags/person/{personId}/tag/{tagId}
- DELETE /api/personstags/person/{personId}/tag/{tagId}

- POST /api/entriestags/entry/{entryId}/tag/{tagId}
- DELETE /api/entriestags/entry/{entryId}/tag/{tagId}

- POST /api/personentry/person/{personId}/entries/{entryId}?role=ROLE
- DELETE /api/personentry/person/{personId}/entries/{entryId}?role=ROLE

- POST /api/mediaentry/entry/{entryId}/media/{mediaId}
- PUT /api/mediaentry/entry/{entryId}/media/{mediaId}
- DELETE /api/mediaentry/entry/{entryId}/media/{mediaId}

- POST /api/personrelation
- DELETE /api/personrelation/{id}

## Base paths (current mappings)
- /api/persons, /api/tags, /api/entries, /api/media
- /api/personstags, /api/entriestags, /api/personentry, /api/mediaentry, /api/personrelation
- /api/personread, /api/entryread, /api/health

## Dependencies
- core.service.* for business logic.
- ws.mapper.WsMapper and ws.dto.* for request/response mapping.