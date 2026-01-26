# TODO – Lide (MVP + další rozvoj)

> Cíl MVP: mít použitelnou osobní databázi lidí, tagů, záznamů (entry), médií a vazeb, s jednoduchým FE, kde se dá reálně přidávat/mazat a prohlížet vazby.

---

## 1) MVP – co chybí, aby to bylo „hotové a použitelné“

### Backend – stabilita + kvalita
- [ ] **Swagger/OpenAPI doplnit o správné statusy** (hlavně `204 No Content` u assign/remove/delete).
- [ ] **Validace vstupů** (Bean Validation):
  - [ ] Person: `firstName` not blank
  - [ ] Tag: `name` not blank
  - [ ] Entry: `type` not blank, `content` not blank
  - [ ] Media: `mediaType` not blank, `uri` not blank
- [ ] **Jednotné chování pro not-found / conflict** (už máš `ApiExceptionHandler`, doladit konzistenci hlášek).
- [ ] **CORS / proxy jasně definovat**:
  - [ ] pro FE dev (Vite proxy) OK
  - [ ] pro produkci případně CORS konfigurace
- [ ] **Základní seed / test data** (volitelně):
  - [ ] jednoduchý endpoint nebo Liquibase seed changelog (např. 5 tagů)

### Backend – funkční „MVP“ ergonomie
- [ ] **Vyhledávání a řazení** (minimálně pro persons, entries, tags):
  - [ ] `GET /api/persons?q=...`
  - [ ] `GET /api/tags?q=...`
  - [ ] `GET /api/entries?q=...`
- [ ] **Stránkování** (page/size) – klidně až po FE, ale rychle se to hodí
- [ ] **Rozšířit read agregace** (pokud FE narazí):
  - [ ] PersonRead: vracet i media přes entry (nebo aspoň počet)
  - [ ] EntryRead: vracet i vazby na persons/role a media

### Frontend – aby se na tom dalo žít
- [ ] **Persons list**
  - [ ] vyhledávání
  - [ ] tlačítko „New person“
- [ ] **Person detail**
  - [ ] editace základních polí (nickname, phone, email, note, birthDate)
  - [ ] mazání person (soft delete)
  - [ ] sekce Tags:
    - [ ] přidat existující tag
    - [ ] odebrat tag
    - [ ] vytvořit nový tag přímo z detailu (quick add)
  - [ ] sekce Entries:
    - [ ] přidat existující entry + role (volitelná)
    - [ ] vytvořit novou entry a rovnou připojit k person
    - [ ] odebrat vazbu person_entry (role-aware)
  - [ ] sekce Relations:
    - [ ] přidat vztah (from/to + type + validFrom/To)
    - [ ] zobrazit incoming/outgoing
    - [ ] smazat relation
- [ ] **Entries list**
  - [ ] vyhledávání
  - [ ] vytvořit entry
- [ ] **Entry detail**
  - [ ] editace (title/content/type/occurredAt)
  - [ ] Tags: add/remove
  - [ ] Persons: add/remove + role
  - [ ] Media: add/remove + caption/sortOrder
- [ ] **Media list**
  - [ ] vytvořit media (zatím jen odkaz/uri)
  - [ ] zobrazit media detail (nebo aspoň list)
- [ ] **UX minimum**
  - [ ] loading stavy
  - [ ] zobrazit chyby z API (ProblemDetail detail)
  - [ ] potvrzení u delete
  - [ ] základní layout (sidebar + content)

### Dokumentace / Dev ergonomie
- [ ] `README.md` final:
  - [ ] „Jak spustit celé“ (DB + BE + FE) v 3 blocích
  - [ ] krátký „flow“: vytvoř person → přidej tag → přidej entry → připoj media → přidej relation
- [ ] `run.env.example` doplnit o všechny proměnné, které používáš
- [ ] `frontend/README.md` (krátké: install/run/build)

---

## 2) Další nápady a postup vylepšení (po MVP)

### Datový model
- [ ] **Číselníky / enumy**
  - [ ] `entry.type` jako enum (nebo tabulka `entry_type`)
  - [ ] `media.media_type` jako enum
  - [ ] `person_relation.type` jako enum / tabulka (např. `relation_type`)
- [ ] **Normalizace role u person_entry**
  - [ ] buď ponechat string, nebo tabulka `person_entry_role`
- [ ] **Ukládání souborů**
  - [ ] první krok: `uri` jako file path / URL
  - [ ] další: upload endpoint + ukládání do `./data/media` / S3 / Nextcloud

### Backend – architektura
- [ ] **Service layer** (ať controller není „repo orchestration“)
  - [ ] PersonService, EntryService, MediaService…
- [ ] **Repository layering: CRUD vs View (zero-migration)**
  - [ ] přidat `repo.crud/*CrudStore` + `Legacy*CrudStore` (delegace na stávající Spring Data repo)
  - [ ] přidat `repo.view/*ViewStore` + `Legacy*ViewStore`
  - [ ] postupně migrovat controllery z `cz.vh.lide.repo.*Repository` na nové `*Store` (po jednotlivých controller/feature)
  - [ ] až po migraci zvážit úklid/rozpad legacy repo balíčku (nepovinné)
- [ ] **DTO mapování**
  - [ ] MapStruct (pokud začne narůstat DTO logika)
- [ ] **Audit**
  - [ ] `updated_at` automaticky (trigger v DB nebo JPA entity listeners)
  - [ ] `created_by / updated_by` pokud někdy přidáš auth
- [ ] **Transakce**
  - [ ] u složených operací (create + link) `@Transactional`

### API rozšíření
- [ ] **Bulk operace**
  - [ ] assign více tagů najednou
  - [ ] assign více persons do entry
- [ ] **Export/import**
  - [ ] export persons/entries do JSON
  - [ ] import z CSV (minimálně persons)
- [ ] **Fulltext**
  - [ ] PostgreSQL fulltext na entry.content + person note

### Frontend – kvalita
- [ ] **Routing**
  - [ ] `/persons`, `/persons/:id`, `/entries`, `/entries/:id`, `/tags`, `/media`
- [ ] **State management**
  - [ ] React Query / TanStack Query (cache, refetch, loading)
- [ ] **UI knihovna**
  - [ ] shadcn/ui nebo MUI (rychlejší UI)
- [ ] **Form handling**
  - [ ] react-hook-form + zod validace
- [ ] **Časové pole UX**
  - [ ] date picker pro birthDate / occurredAt / takenAt

### Bezpečnost
- [ ] **Jednoduchá autentizace**
  - [ ] Basic auth pro lokál
  - [ ] později JWT / OAuth (pokud to bude multi-user)
- [ ] **Omezení CORS**
  - [ ] povolit jen FE doménu

### DevOps / build
- [ ] **Docker compose pro celé**
  - [ ] postgres + pgadmin + backend + frontend (dev/prod profily)
- [ ] **CI**
  - [ ] GitHub Actions: build backend + frontend, unit testy, lint

---

## 3) Doporučený pořadí práce (rychlá roadmapa)

1. FE: Person detail (edit + tags + entries + relations)
2. FE: Entry detail (tags + persons + media)
3. Backend: search + paging (aspoň persons/entries/tags)
4. Swagger statusy + validace vstupů
5. Export/import + upload media (volitelně)

---

## 4) Poznámky k MVP definici

MVP je hotové, když:
- [ ] bez ručního zásahu v DB umíš z FE:
  - [ ] vytvořit person, tag, entry, media
  - [ ] prolinkovat (person_tag, entry_tag, person_entry, media_entry, person_relation)
  - [ ] odebrat vazby a soft delete entity
  - [ ] najít person/entry přes vyhledávání
- [ ] read agregace vrací vše potřebné pro detail obrazovky
- [ ] běžné chyby se zobrazí uživateli srozumitelně
