# db.filter

Filter DTOs used for building query specifications.

## Filters
- EntryFilter
- EntryTagFilter
- MediaFilter
- MediaEntryFilter
- PersonFilter
- PersonEntryFilter
- PersonRelationFilter
- PersonTagFilter
- TagFilter

## Usage
- Consumed by db.specification.*Specifications build methods.
- Passed into core.service list(pageable, filter) methods.