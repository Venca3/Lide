# db.specification

JPA Specifications used to build dynamic queries based on filter DTOs.

## Specifications
- EntrySpecifications
- EntryTagSpecifications
- MediaSpecifications
- MediaEntrySpecifications
- PersonSpecifications
- PersonEntrySpecifications
- PersonRelationSpecifications
- PersonTagSpecifications
- TagSpecifications

## Usage
- Called from core.service list(...) methods.

## Public interface pattern
- build(filter) returns a JPA Specification for dynamic querying.