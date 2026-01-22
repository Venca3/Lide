# Lide – osobní databáze lidí, záznamů, médií a vazeb

Projekt pro evidenci lidí a jejich vazeb (rodina, přátelé…), záznamů (vzpomínky/příběhy sjednocené jako **entry**), tagů a médií (foto/video/dokument). Backend je **Spring Boot + PostgreSQL + Liquibase** (soft delete). Frontend je **Vite + React (TypeScript)**.

## Obsah
- [Stack](#stack)
- [Struktura repozitáře](#struktura-repozitáře)
- [Požadavky](#požadavky)
- [Spuštění databáze (Docker)](#spuštění-databáze-docker)
- [Spuštění backendu](#spuštění-backendu)
- [Spuštění frontendu](#spuštění-frontendu)
- [Konfigurace přes env](#konfigurace-přes-env)
- [API](#api)
- [Schéma databáze (MVP)](#schéma-databáze-mvp)
- [Soft delete](#soft-delete)
- [Troubleshooting](#troubleshooting)
- [Další kroky](#další-kroky)

## Stack

### Backend
- Java 21, Spring Boot
- Spring Web + Spring Data JPA
- Liquibase (YAML changelogy)
- PostgreSQL 16 (Docker)

### Frontend
- Vite + React + TypeScript
- Volání API přes `/api/...` (Vite proxy → backend)

## Struktura repozitáře

```text
.
├─ src/                      # Spring Boot backend
├─ pom.xml
├─ mvnw / mvnw.cmd
├─ run.env                   # lokální env proměnné (není commitované)
├─ run.env.example           # šablona env
└─ frontend/                 # Vite + React
````

## Požadavky

* Java 21
* Node.js (doporučeno LTS)
* Docker Desktop (pro PostgreSQL)
* (volitelné) pgAdmin

## Spuštění databáze (Docker)

### Porty

* PostgreSQL v Dockeru běží na hostu na portu **5433**
* Lokální PostgreSQL (Windows service) často běží na **5432** a může kolidovat – proto používáme **5433**

### Ověření, že DB běží

V PowerShellu:

```powershell
netstat -ano | findstr :5433
```

### Test připojení přes psql

```powershell
psql -h localhost -p 5433 -U app_lide -d db_lide
```

Pokud se nepřipojí, zkontroluj docker compose / kontejnery a správné port mappingy.

## Spuštění backendu

### 1) Nastav env proměnné

V rootu je `run.env` (necommituj ho), příklad je v `run.env.example`.

Typicky:

* `APP_PORT=8081`
* `DB_URL=jdbc:postgresql://localhost:5433/db_lide`
* `DB_USER=app_lide`
* `DB_PASS=...`

### 2) Spusť backend

V rootu:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend poběží na:

* `http://localhost:8081`

Liquibase při startu provede migrace a vytvoří tabulky.

## Spuštění frontendu

### 1) Instalace dependencies

```powershell
cd frontend
npm install
```

### 2) Spuštění dev serveru

```powershell
npm run dev
```

Frontend poběží na:

* `http://localhost:5173`

### Proxy na backend

Frontend volá API na `/api/...` a Vite proxy to posílá na backend (`http://localhost:8081`). Konfigurace je ve `frontend/vite.config.ts`.

## Konfigurace přes env

### Backend (run.env)

Backend čte konfiguraci z env proměnných (přes VS Code launch nebo shell). Doporučené proměnné:

* `APP_PORT=8081`
* `DB_URL=jdbc:postgresql://localhost:5433/db_lide`
* `DB_USER=app_lide`
* `DB_PASS=***`

`run.env` drž lokálně, do repa commituj pouze `run.env.example`.

### Frontend

Frontend zatím žádné env nepotřebuje (proxy řeší `/api/...`).

## API

### Základní entity (CRUD)

* `/api/persons`
* `/api/tags`
* `/api/entries`
* `/api/media`

### Vazby (M:N / link tables)

* `person_tag`
* `entry_tag`
* `person_entry` (s `role`)
* `media_entry`
* `person_relation` (person ↔ person)

### Read agregace

* `GET /api/personread/{personId}`

  * person + tags + entries (+ role) + relationsOut + relationsIn
* `GET /api/entryread/{entryId}`

  * entry + tags + persons (+ role) + media (+ caption/sort)

### HTTP kódy

* `200 OK` – návrat dat
* `201 Created` – vytvoření entity (vrací body)
* `204 No Content` – úspěch bez body (typicky add/remove vazby, soft delete)
* `404 Not Found` – neexistující záznam nebo vazba

`204` je naprosto v pořádku a běžně používaný.

## Schéma databáze (MVP)

### Hlavní tabulky

* `person`
* `tag`
* `entry` (sjednocení “vzpomínka/příběh”)
* `media`

### Vazby

* `person_tag`
* `entry_tag`
* `person_entry` (role)
* `media_entry`
* `person_relation` (směrovaný vztah, např. `spouse`, `friend`, `parent`…)

## Soft delete

Všechny tabulky mají `deleted_at` a mazání je řešené jako soft delete.

Repo metody typicky filtrují:

* `findByIdAndDeletedAtIsNull(...)`
* `findAllBy...AndDeletedAtIsNull(...)`

## Troubleshooting

### Nelze se připojit k DB / špatné heslo

Ověř, že se připojíš přes psql:

```powershell
psql -h localhost -p 5433 -U app_lide -d db_lide
```

Pozor na konflikt s lokálním PostgreSQL na `5432`.

### Liquibase hlásí “Unknown change type …”

* typicky chyba v changelogu (např. neexistující change typ)
* zkontroluj `db/changelog/*.yaml`

### PowerShell `curl -X ...` nefunguje

V PowerShell je `curl` alias na `Invoke-WebRequest`. Používej:

* `Invoke-RestMethod`
* nebo spouštěj skutečný curl:

  * `curl.exe ...`

## Další kroky

* dokončit FE: detail person (přidat/odebrat tagy, entry, relations), detail entry (tags, persons, media)
* přidat vyhledávání a stránkování (`q`, `page`, `size`, `sort`)
* přidat enum/číselník pro `relation types`
* auth (pokud bude potřeba)
* export/import (CSV/JSON)