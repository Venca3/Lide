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

## Endpoint patterns
- /api/{entity}: CRUD
- /api/{entity}read/{id}: aggregated read
- /api/{relation}/...: relation management (idempotent add/remove)

## Base paths (current mappings)
- /api/persons, /api/tags, /api/entries, /api/media
- /api/personstags, /api/entriestags, /api/personentry, /api/mediaentry, /api/personrelation
- /api/personread, /api/entryread, /api/health

## Dependencies
- core.service.* for business logic.
- ws.mapper.WsMapper and ws.dto.* for request/response mapping.