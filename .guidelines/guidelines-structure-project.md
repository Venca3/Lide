# Lide – kontext projektu (DB + struktura repozitáře)

## Obsah
- [1) Runtime & porty](#1-runtime--porty)
  - [Backend](#backend)
  - [DB (PostgreSQL v Dockeru)](#db-postgresql-v-dockeru)
  - [pgAdmin](#pgadmin)
- [2) ENV proměnné (backend)](#2-env-proměnné-backend)
- [3) DB schéma (MVP)](#3-db-sch%C3%A9ma-mvp)
  - [Konvence](#konvence)
  - [Tabulky systémové (Liquibase)](#tabulky-syst%C3%A9mov%C3%A9-liquibase)
  - [3.1 Hlavní entity](#31-hlavn%C3%AD-entity)
  - [3.2 Vazební tabulky (M:N)](#32-vazebn%C3%AD-tabulky-mn)
  - [3.3 Vztahy mezi lidmi](#33-vztahy-mezi-lidmi)
- [4) Backend – struktura projektu (Spring Boot)](#4-backend--struktura-projektu-spring-boot)
  - [Root (backend v rootu repozitáře)](#root-backend-v-rootu-repozit%C3%A1%C5%99e)
  - [Java package tree (podle aktuální struktury)](#java-package-tree-podle-aktu%C3%A1ln%C3%AD-struktury)
- [5) Frontend – struktura projektu (Vite + React + TS)](#5-frontend--struktura-projektu-vite--react--ts)
  - [Důležité soubory](#d%C5%AFle%C5%BEit%C3%A9-soubory)
  - [frontend/src/](#frontendsrc)
- [6) API – rychlý přehled (MVP)](#6-api--rychl%C3%BD-p%C5%99ehled-mvp)
- [7) Poznámky k úpravám / konvencím](#7-pozn%C3%A1mky-k-%C3%BAprav%C3%A1m--konvenc%C3%ADm)
- [8) API – seznam controllerů a endpointů (OpenAPI snapshot)](#8-api--seznam-controller%C5%AF-a-endpoint%C5%AF-openapi-snapshot)

Tento dokument je „context pack“ pro předání jiné AI. Obsahuje:
- kompletní seznam tabulek a jejich sloupců (MVP)
- konvence (UUID, soft delete, timestamps)
- strukturu backendu (Spring Boot) a frontendu (Vite/React)
- runtime porty a env proměnné

---

## 1) Runtime & porty

### Backend
- Spring Boot běží typicky na: `http://localhost:8081`
- Konfigurace přes env proměnné (viz níže)

### DB (PostgreSQL v Dockeru)
- Postgres Docker je mapovaný na host port: `5433`
- Lokální Windows Postgres často běží na `5432` (může kolidovat)

Test připojení:
- `psql -h localhost -p 5433 -U app_lide -d db_lide`

### pgAdmin
- používá se pro GUI připojení na `localhost:5433`

---

## 2) ENV proměnné (backend)

Používá se `run.env` (lokální, necommitovat), šablona `run.env.example`.

Typické hodnoty:
- `APP_PORT=8081`
- `DB_URL=jdbc:postgresql://localhost:5433/db_lide`
- `DB_USER=app_lide`
- `DB_PASS=***`

---

## 3) DB schéma (MVP)

### Konvence
- Primární klíče: `uuid` (default `gen_random_uuid()`)
- Soft delete: `deleted_at timestamptz` (NULL = aktivní, NOT NULL = smazané)
- Audit:
  - `created_at timestamptz default now()`
  - u vybraných entit i `updated_at timestamptz default now()`

### Tabulky systémové (Liquibase)
- `databasechangelog`
- `databasechangeloglock`

> Tyto tabulky spravuje Liquibase automaticky.

---

### 3.1 Hlavní entity

#### `person` (11 sloupců)
- `id` uuid (PK)
- `first_name` varchar
- `last_name` varchar
- `nickname` varchar
- `birth_date` date
- `phone` varchar
- `email` varchar
- `note` text
- `created_at` timestamptz
- `updated_at` timestamptz
- `deleted_at` timestamptz

Indexy (typicky):
- (logicky) index na `(last_name, first_name)` pro rychlé listování

---

#### `tag` (4 sloupce)
- `id` uuid (PK)
- `name` varchar
- `created_at` timestamptz
- `deleted_at` timestamptz

Constraints (typicky):
- `UNIQUE(name)` pro unikátní názvy tagů

---

#### `entry` (8 sloupců) – sjednocení “vzpomínka/příběh”
- `id` uuid (PK)
- `type` varchar(30)  *(např. MEMORY/STORY/NOTE… zatím string)*
- `title` varchar(200)
- `content` text (NOT NULL)
- `occurred_at` timestamptz
- `created_at` timestamptz
- `updated_at` timestamptz
- `deleted_at` timestamptz

Indexy (typicky):
- index na `type`
- index na `occurred_at`

---

#### `media` (9 sloupců) – foto/video/dokument
- `id` uuid (PK)
- `media_type` varchar(30) *(PHOTO/VIDEO/DOC… zatím string)*
- `mime_type` varchar(120)
- `uri` text (NOT NULL) *(odkaz na soubor, cesta, URL, S3, lokální storage…)*
- `title` varchar(200)
- `note` text
- `taken_at` timestamptz
- `created_at` timestamptz
- `deleted_at` timestamptz

Indexy (typicky):
- index na `media_type`
- index na `taken_at`

---

### 3.2 Vazební tabulky (M:N)

#### `person_tag` (5 sloupců)
- `id` uuid (PK)
- `person_id` uuid (FK → `person.id`)
- `tag_id` uuid (FK → `tag.id`)
- `created_at` timestamptz
- `deleted_at` timestamptz

Constraints (typicky):
- `UNIQUE(person_id, tag_id)` (pro zabránění duplicitám)
- index na `person_id`, index na `tag_id`

---

#### `entry_tag` (5 sloupců)
- `id` uuid (PK)
- `entry_id` uuid (FK → `entry.id`)
- `tag_id` uuid (FK → `tag.id`)
- `created_at` timestamptz
- `deleted_at` timestamptz

Constraints (typicky):
- `UNIQUE(entry_id, tag_id)`
- index na `entry_id`, index na `tag_id`

---

#### `person_entry` (6 sloupců) – vazba osoba ↔ entry + role
- `id` uuid (PK)
- `person_id` uuid (FK → `person.id`)
- `entry_id` uuid (FK → `entry.id`)
- `role` varchar(50) *(volitelné; např. AUTHOR/WITNESS/MENTIONED…)*
- `created_at` timestamptz
- `deleted_at` timestamptz

Constraints (typicky):
- `UNIQUE(person_id, entry_id, role)` *(role je součást unikátní kombinace; pozor: NULL role v PG dovolí více NULL řádků)*
- index na `person_id`, index na `entry_id`

---

#### `media_entry` (7 sloupců) – média připojená k entry
- `id` uuid (PK)
- `media_id` uuid (FK → `media.id`)
- `entry_id` uuid (FK → `entry.id`)
- `caption` varchar(300)
- `sort_order` int
- `created_at` timestamptz
- `deleted_at` timestamptz

Constraints (typicky):
- `UNIQUE(media_id, entry_id)`
- index na `media_id`, index na `entry_id`

---

### 3.3 Vztahy mezi lidmi

#### `person_relation` (9 sloupců) – person ↔ person (směrované)
- `id` uuid (PK)
- `from_person_id` uuid (FK → `person.id`)
- `to_person_id` uuid (FK → `person.id`)
- `type` varchar(50) *(např. spouse, friend, parent… zatím string)*
- `note` text
- `valid_from` date
- `valid_to` date
- `created_at` timestamptz
- `deleted_at` timestamptz

Constraints (typicky):
- (volitelně) check: `from_person_id <> to_person_id`
- index na `from_person_id`, index na `to_person_id`

---

## 4) Backend – struktura projektu (Spring Boot)

### Root (backend v rootu repozitáře)
- `pom.xml`
- `mvnw`, `mvnw.cmd`
- `src/main/java/cz/vh/lide/...`
- `src/main/resources/...`
- `run.env`, `run.env.example`
- `README.md`

### Java package tree (podle aktuální struktury)
`src/main/java/cz/vh/lide/`

#### `cz.vh.lide.LideAppApplication`
- hlavní Spring Boot entrypoint

#### `cz.vh.lide.core.service` (aplikační služby)
- `EntryService.java`
- `EntryTagService.java`
- `MediaService.java`
- `MediaEntryService.java`
- `PersonService.java`
- `PersonEntryService.java`
- `PersonRelationService.java`
- `PersonTagService.java`
- `TagService.java`

#### `cz.vh.lide.core.exception`
- `FatalException.java`

#### `cz.vh.lide.core.tools`
- `JpaTools.java`

#### `cz.vh.lide.db.entity` (JPA entity)
- `BaseEntity.java`
- `Entry.java`
- `EntryTag.java`
- `Media.java`
- `MediaEntry.java`
- `Person.java`
- `PersonEntry.java`
- `PersonRelation.java`
- `PersonTag.java`
- `Tag.java`

#### `cz.vh.lide.db.dto` (DB DTOs)
- `BaseDto.java`
- `EntryDto.java`
- `EntryTagDto.java`
- `MediaDto.java`
- `MediaEntryDto.java`
- `PersonDto.java`
- `PersonEntryDto.java`
- `PersonRelationDto.java`
- `PersonTagDto.java`
- `TagDto.java`

#### `cz.vh.lide.db.repository` (Spring Data repositories)
- `EntryRepository.java`
- `EntryTagRepository.java`
- `MediaRepository.java`
- `MediaEntryRepository.java`
- `PersonRepository.java`
- `PersonTagRepository.java`
- `PersonEntryRepository.java`
- `PersonRelationsRepository.java`
- `TagRepository.java`

#### `cz.vh.lide.db.filter`
- `EntryFilter.java`
- `EntryTagFilter.java`
- `MediaFilter.java`
- `MediaEntryFilter.java`
- `PersonFilter.java`
- `PersonEntryFilter.java`
- `PersonRelationFilter.java`
- `PersonTagFilter.java`
- `TagFilter.java`

#### `cz.vh.lide.db.specification`
- `EntrySpecifications.java`
- `EntryTagSpecifications.java`
- `MediaSpecifications.java`
- `MediaEntrySpecifications.java`
- `PersonSpecifications.java`
- `PersonEntrySpecifications.java`
- `PersonRelationSpecifications.java`
- `PersonTagSpecifications.java`
- `TagSpecifications.java`

#### `cz.vh.lide.db.mapper`
- `DbMapper.java`

#### `cz.vh.lide.db.validator`
- `dbValidator.java`

#### `cz.vh.lide.db.exception`
- `FatalDbException.java`

#### `cz.vh.lide.ws.controller` (REST controllers)
- `HealthController.java`
- `PersonController.java`
- `TagController.java`
- `EntryController.java`
- `MediaController.java`
- `PersonTagController.java`
- `EntryTagController.java`
- `PersonEntryController.java`
- `MediaEntryController.java`
- `PersonRelationController.java`
- `PersonReadController.java`
- `EntryReadController.java`

#### `cz.vh.lide.ws.dto` (API DTOs)
- `BindingDtos.java`
- `EntryDtos.java`
- `EntryDetailDtos.java`
- `MediaDtos.java`
- `MediaEntryDtos.java`
- `PersonDtos.java`
- `PersonEntryDtos.java`
- `PersonReadDtos.java`
- `PersonRelationDtos.java`
- `TagDtos.java`

#### `cz.vh.lide.ws.mapper`
- `WsMapper.java`

#### `cz.vh.lide.ws.handler`
- `ApiExceptionHandler.java`

#### `cz.vh.lide.ws.config`
- `CorsConfig.java`

### Liquibase (resources)
`src/main/resources/`
- `application.yaml`
- `db/changelog/db.changelog-master.yaml`
- `db/changelog/001-init-schema.yaml`

> `db.changelog-master.yaml` includuje `001-init-schema.yaml`

---

## 5) Frontend – struktura projektu (Vite + React + TS)

V rootu složka: `frontend/`

### Důležité soubory
- `frontend/package.json`
- `frontend/vite.config.ts` *(proxy `/api` → backend)*
- `frontend/index.html`
- `frontend/README.md`

### `frontend/src/`
- `main.tsx` *(bootstrap React)*
- `App.tsx` *(list osob + create + výběr osoby)*
- `personDetail.tsx` *(detail osoby z agregovaného endpointu)*
- `api.ts` *(fetch helper, error handling)*
- `App.css`, `index.css`
- `assets/*`

---

## 6) API – rychlý přehled (MVP)

CRUD:
- `/api/persons`
- `/api/tags`
- `/api/entries`
- `/api/media`

Vazby:
- `/api/personstags/...` *(person ↔ tag)*
- `/api/entriestags/...` *(entry ↔ tag)*
- `/api/personentry/...` *(person ↔ entry + role)*
- `/api/mediaentry/...` *(media ↔ entry)*
- `/api/personrelation/...` *(person ↔ person relation)*

Read agregace:
- `GET /api/personread/{personId}`
- `GET /api/entryread/{entryId}`

HTTP kódy:
- `200` OK (data)
- `201` Created (vrací body)
- `204` No Content (operace bez body – add/remove vazby, soft delete)
- `404` Not Found (neexistuje / nelze provést)

---

## 7) Poznámky k úpravám / konvencím

- Soft delete je i ve vazebních tabulkách (proto mají `id` + `deleted_at`).
- Většina query ve style:
  - `findByIdAndDeletedAtIsNull(...)`
  - `findAllBy...AndDeletedAtIsNull(...)`
- `type` hodnoty jsou zatím `String` (MVP). Do budoucna lze zavést enum/číselník tabulku.

---

## 8) API – seznam controllerů a endpointů (OpenAPI snapshot)

Níže je lidsky čitelný přepis toho OpenAPI JSONu, aby šel projekt předat jako celek.

### HealthController
- `GET /api/health` → `"OK"` (string)

---

### PersonController (`person-controller`)
CRUD pro `person` (soft delete):
- `GET /api/persons` → list
- `POST /api/persons` → create (`PersonCreate`)
- `GET /api/persons/{id}` → detail
- `PUT /api/persons/{id}` → update (`PersonUpdate`)
- `DELETE /api/persons/{id}` → soft delete

DTO:
- `PersonCreate { firstName, lastName, nickname, birthDate, phone, email, note }`
- `PersonUpdate { firstName, lastName, nickname, birthDate, phone, email, note }`

---

### TagController (`tag-controller`)
CRUD pro `tag` (soft delete):
- `GET /api/tags` → list
- `POST /api/tags` → create (`TagCreate`)
- `GET /api/tags/{id}` → detail
- `PUT /api/tags/{id}` → update (`TagUpdate`)
- `DELETE /api/tags/{id}` → soft delete

DTO:
- `TagCreate { name }`
- `TagUpdate { name }`

---

### EntryController (`entry-controller`)
CRUD pro `entry` (soft delete):
- `GET /api/entries` → list
- `POST /api/entries` → create (`EntryCreate`)
- `GET /api/entries/{id}` → detail
- `PUT /api/entries/{id}` → update (`EntryUpdate`)
- `DELETE /api/entries/{id}` → soft delete

DTO:
- `EntryCreate { type, title, content, occurredAt }`
- `EntryUpdate { type, title, content, occurredAt }`

---

### MediaController (`media-controller`)
CRUD pro `media` (soft delete):
- `GET /api/media` → list
- `POST /api/media` → create (`MediaCreate`)
- `GET /api/media/{id}` → detail
- `PUT /api/media/{id}` → update (`MediaUpdate`)
- `DELETE /api/media/{id}` → soft delete

DTO:
- `MediaCreate { mediaType, mimeType, uri, title, note, takenAt }`
- `MediaUpdate { mediaType, mimeType, uri, title, note, takenAt }`

---

## 8.1 Vazby (link tables)

### PersonTagController (`person-tag-controller`)
Vazba `person_tag`:

- `GET /api/personstags/person/{personId}/tags`
  - vrátí tagy přiřazené osobě
- `GET /api/personstags/tag/{tagId}/persons`
  - vrátí osoby přiřazené tagu
- `POST /api/personstags/person/{personId}/tag/{tagId}`
  - přiřadí tag osobě (idempotentní; pokud je vazba soft-deleted, provede undelete)
- `DELETE /api/personstags/person/{personId}/tag/{tagId}`
  - odebere (soft delete) vazbu person↔tag

---

### EntryTagController (`entry-tag-controller`)
Vazba `entry_tag`:

- `GET /api/entriestags/entry/{entryId}/tags`
  - vrátí tagy přiřazené entry
- `GET /api/entriestags/tag/{tagId}/entries`
  - vrátí entries přiřazené tagu
- `POST /api/entriestags/entry/{entryId}/tag/{tagId}`
  - přiřadí tag k entry (idempotentní; může undelete)
- `DELETE /api/entriestags/entry/{entryId}/tag/{tagId}`
  - odebere (soft delete) vazbu entry↔tag

---

### PersonEntryController (`person-entry-controller`)
Vazba `person_entry` (včetně role přes query param):

- `GET /api/personentry/person/{personId}/entries`
  - entries pro person (včetně role, pokud ji vrací DTO)
- `GET /api/personentry/entry/{entryId}/persons`
  - persons pro entry (včetně role, pokud ji vrací DTO)

- `POST /api/personentry/person/{personId}/entries/{entryId}?role={role?}`
  - přidá vazbu person↔entry, role je volitelná
- `DELETE /api/personentry/person/{personId}/entries/{entryId}?role={role?}`
  - odebere (soft delete) vazbu person↔entry pro konkrétní role (nebo NULL)

Pozn.: role je v OpenAPI jako `query` parametr typu `string`, `required=false`.

---

### MediaEntryController (`media-entry-controller`)
Vazba `media_entry`:

- `GET /api/mediaentry/entry/{entryId}/media`
  - list médií pro entry
- `GET /api/mediaentry/media/{mediaId}/entries`
  - list entries pro media

- `POST /api/mediaentry/entry/{entryId}/media/{mediaId}`
  - přidá vazbu media↔entry s volitelnými poli (caption/sortOrder)
- `PUT /api/mediaentry/entry/{entryId}/media/{mediaId}`
  - update existující vazby (caption/sortOrder)
- `DELETE /api/mediaentry/entry/{entryId}/media/{mediaId}`
  - odebere (soft delete) vazbu

DTO:
- `MediaEntryUpsert { caption: string, sortOrder: int }`

---

### PersonRelationController (`person-relation-controller`)
Vztahy `person_relation`:

- `POST /api/personrelation`
  - vytvoří relation (`RelationCreate`)
- `GET /api/personrelation/from/{personId}`
  - seznam odchozích vztahů (from person)
- `GET /api/personrelation/to/{personId}`
  - seznam příchozích vztahů (to person)
- `DELETE /api/personrelation/{id}`
  - soft delete relation

DTO:
- `RelationCreate { fromPersonId, toPersonId, type, note, validFrom, validTo }`

---

## 8.2 Read agregace (composed endpoints)

### PersonReadController (`person-read-controller`)
- `GET /api/personread/{personId}`
  - detail person + navázané entity (tags, entries, relations in/out, …)

### EntryReadController (`entry-read-controller`)
- `GET /api/entryread/{entryId}`
  - detail entry + navázané entity (tags, persons+role, media+caption/sort, …)

---

## 9) OpenAPI – standardní error model

V OpenAPI se chyby vrací jako `ProblemDetail` (Spring 6 / Spring Boot 3):

`ProblemDetail`:
- `type` (uri)
- `title` (string)
- `status` (int)
- `detail` (string)
- `instance` (uri)
- `properties` (map)

Pozn.: V exportu jsou vidět odpovědi `400/409` s `ProblemDetail`.

---

## 10) Poznámka k HTTP statusům ve Swaggeru

V tom OpenAPI exportu teď často vidíš `200` i u delete/assign operací.
V implementaci ale používáš `204 No Content` (a to je OK).

Pokud chceš, aby Swagger seděl s realitou:
- přidej `@ResponseStatus(HttpStatus.NO_CONTENT)` nebo
- přidej `@ApiResponses(...)` (springdoc) pro deklaraci `204` u konkrétních metod.

(Čistě dokumentační; funkčně je `204` správně.)

---