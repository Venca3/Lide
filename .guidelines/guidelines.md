# Lide Project Guidelines

## Project Overview
Lide is a personal database application for managing people, their relationships, entries (memories/stories), media files, and tags. Built with Spring Boot backend and Vite/React frontend.

**📋 Pro podrobný popis struktury projektu viz: [guidelines-structure-project.md](guidelines-structure-project.md)**

## Core Principles

### Architecture
- **Backend**: Spring Boot + PostgreSQL + Liquibase
- **Frontend**: Vite + React + TypeScript
- **Database**: Soft delete pattern with UUID primary keys
- **API**: RESTful with aggregated read endpoints

### Development Standards

#### Database Conventions
- Primary keys: `uuid` with `gen_random_uuid()` default
- Soft delete: `deleted_at timestamptz` (NULL = active, NOT NULL = deleted)
- Audit trails: `created_at timestamptz default now()`
- Some entities include `updated_at timestamptz default now()`

#### Java Package Structure
```
cz.vh.lide/
├── domain/          # JPA entities
├── repo/            # Spring Data repositories  
├── api/dto/         # Data Transfer Objects
└── api/             # REST controllers
```

#### Naming Conventions
- Entities: PascalCase (Person, Entry, Media)
- DTOs: Nested classes in *Dtos.java files
- Controllers: Separate CRUD and read aggregation controllers
- Repositories: Standard Spring Data naming

### API Design Patterns

#### CRUD Operations
- `GET /api/{entities}` - list all
- `POST /api/{entities}` - create (returns 201 + body)
- `GET /api/{entities}/{id}` - get by id
- `PUT /api/{entities}/{id}` - update
- `DELETE /api/{entities}/{id}` - soft delete (returns 204)

#### Relationship Management
- Use dedicated controllers for M:N relationships
- Support idempotent operations (handles soft delete/undelete)
- Include role/metadata where applicable
- Return 204 for add/remove operations

#### Read Aggregation
- Separate read controllers for complex data fetching
- `/api/{entity}read/{id}` pattern for detailed views
- Include related entities in single response

### Data Model Guidelines

#### Core Entities
1. **Person** - Individual people with contact info
2. **Entry** - Unified stories/memories with type field
3. **Media** - Files/documents with metadata
4. **Tag** - Categorization labels

#### Relationship Tables
- Always include UUID primary key
- Support soft delete for audit trails
- Include metadata (role, sort_order, caption, etc.)
- Maintain referential integrity with foreign keys

### Development Workflow

#### Environment Setup
- Use `run.env` for local configuration (never commit)
- Backend runs on port 8081
- PostgreSQL Docker on port 5433 (avoids Windows default 5432)
- Frontend Vite proxy handles `/api/*` routing

#### Database Migrations
- Use Liquibase YAML changelogs
- Master changelog includes individual change files
- Test migrations on fresh database
- Always backup before schema changes

#### Error Handling
- Use Spring's ProblemDetail for consistent error responses
- Return appropriate HTTP status codes (200, 201, 204, 404, 400, 409)
- Handle soft delete scenarios gracefully

### Frontend Guidelines

#### Component Structure
- Keep components focused and reusable
- Use TypeScript for type safety
- Handle API errors gracefully
- Implement loading states

#### API Integration
- Use consistent fetch patterns
- Handle 204 responses (empty success)
- Implement proper error boundaries
- Cache data where appropriate

### Testing Strategy
- Test repository queries with soft delete filters
- Verify idempotent relationship operations
- Test aggregated read endpoints
- Validate constraint enforcement

### Performance Considerations
- Index foreign key columns and commonly queried fields
- Use appropriate fetch strategies for JPA relationships
- Implement pagination for large datasets
- Consider caching for frequently accessed data

### Security Notes
- Currently no authentication (personal use)
- Validate input data in controllers
- Use parameterized queries (JPA handles this)
- Sanitize file uploads if implemented

## Common Patterns

### Repository Queries
Always filter soft deleted records:
```java
findByIdAndDeletedAtIsNull(UUID id)
findAllByDeletedAtIsNull()
```

### Controller Response Patterns
```java
// CRUD operations
@PostMapping -> ResponseEntity<EntityDto> (201)
@PutMapping -> ResponseEntity<EntityDto> (200)  
@DeleteMapping -> ResponseEntity<Void> (204)

// Relationship operations
@PostMapping -> ResponseEntity<Void> (204)
@DeleteMapping -> ResponseEntity<Void> (204)
```

### DTO Organization
Group related DTOs in single files with nested classes:
```java
public class PersonDtos {
  public static class PersonCreate { ... }
  public static class PersonUpdate { ... }
  public static class PersonDetail { ... }
}
```

This structure ensures consistency, maintainability, and provides clear patterns for extending the application.