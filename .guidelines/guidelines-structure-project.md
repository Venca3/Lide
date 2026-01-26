# Lide – kontext projektu (DB + struktura repozitáře)

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

#### `cz.vh.lide.domain` (JPA entity)
- `Entry.java`
- `EntryTag.java`
- `Media.java`
- `MediaEntry.java`
- `Person.java`
- `PersonEntry.java`
- `PersonRelation.java`
- `PersonTag.java`
- `Tag.java`

#### `cz.vh.lide.repo` (Spring Data repositories)
- `EntryRepository.java`
- `EntryTagRepository.java`
- `MediaRepository.java`
- `MediaEntryRepository.java`
- `PersonRepository.java`
- `PersonTagRepository.java`
- `PersonEntryRepository.java`
- `PersonRelationRepository.java`
- `TagRepository.java`

#### `cz.vh.lide.repo.crud` (CRUD ports + legacy adapters)
- `*CrudStore.java` (write-side port; create/update/softDelete/getByUUID)
- `Legacy*CrudStore.java` (adapter delegující na `cz.vh.lide.repo.*Repository`)

#### `cz.vh.lide.repo.view` (View/read ports + legacy adapters)
- `*ViewStore.java` (read-side port; list/get + další read dotazy)
- `Legacy*ViewStore.java` (adapter delegující na `cz.vh.lide.repo.*Repository`)

#### `cz.vh.lide.repo.projection` (projekce pro read)
- interface-based projekce pro Spring Data (bez vlastních Spring beanů)

#### `cz.vh.lide.api.dto` (DTOs)
- `EntryDtos.java`
- `EntryDetailDtos.java`
- `MediaDtos.java`
- `MediaEntryDtos.java`
- `PersonDtos.java`
- `PersonDetailDtos.java`
- `PersonEntryDtos.java`
- `PersonRelationDtos.java`
- `TagDtos.java`

#### `cz.vh.lide.api` (REST controllers + handler)
- `ApiExceptionHandler.java`
- `HealthController.java`

CRUD:
- `PersonController.java`
- `TagController.java`
- `EntryController.java`
- `MediaController.java`

Vazby:
- `PersonTagController.java`
- `EntryTagController.java`
- `PersonEntryController.java`
- `MediaEntryController.java`
- `PersonRelationController.java`

Read agregace (čtení “včetně vazeb”):
- `PersonReadController.java` *(person + tags + entries + relations)*
- `EntryReadController.java` *(entry + tags + persons + media)*

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
- `/api/entrytags/...` *(entry ↔ tag)*
- `/api/personentries/...` *(person ↔ entry + role)*
- `/api/mediaentries/...` *(media ↔ entry)*
- `/api/personrelations/...` *(person ↔ person relation)*

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