# API Layer

Tato složka obsahuje TypeScript API klienty pro komunikaci s backend REST API. Každý soubor odpovídá jednomu nebo více backend kontrolerům a poskytuje typově bezpečné funkce pro CRUD operace a vazby mezi entitami.

## Struktura

```
api/
├── http.ts              # Základní HTTP utility
│
├── entries.ts           # Entry CRUD + paginace
├── persons.ts           # Person CRUD + paginace
├── tags.ts              # Tag CRUD + paginace
├── media.ts             # Media CRUD + paginace
│
├── personEntries.ts     # Person-Entry vazby
├── entryTag.ts          # Entry-Tag vazby
├── mediaEntry.ts        # Media-Entry vazby
├── personTags.ts        # Person-Tag vazby
├── personRelation.ts    # Person-Person relace
│
├── personRead.ts        # Person detail view
├── entryRead.ts         # Entry detail view
│
└── tagsCrud.ts          # DEPRECATED - použít tags.ts
```

## Hlavní entity (CRUD)

### [entries.ts](entries.ts)
**Backend:** `EntryController` (`/api/entries`)

Práce s entries (záznamy/události).

**Typy:**
- `EntryDto` - základní entry data
- `EntryCreate` - vytvoření entry (povinné: `type`, `content`)
- `EntryUpdate` - aktualizace entry (povinné: `type`, `content`)
- Binding typy pro vazby při vytváření

**Funkce:**
- `listEntries()` - seznam všech entries
- `listEntriesPaged(q?, page, size)` - paginovaný seznam s vyhledáváním
- `getEntry(id)` - detail jednoho entry
- `createEntry(body)` - vytvoření nového entry
- `updateEntry(id, body)` - aktualizace entry
- `deleteEntry(id)` - soft delete entry

### [persons.ts](persons.ts)
**Backend:** `PersonController` (`/api/persons`)

Práce s osobami.

**Typy:**
- `PersonDto` - základní person data
- `PersonCreate` - vytvoření osoby (povinné: `firstName`)
- `PersonUpdate` - aktualizace osoby

**Funkce:**
- `listPersons()` - seznam všech osob
- `listPersonsPaged(q?, page, size)` - paginovaný seznam s vyhledáváním
- `getPerson(id)` - detail jedné osoby
- `createPerson(body)` - vytvoření nové osoby
- `updatePerson(id, body)` - aktualizace osoby
- `deletePerson(id)` - soft delete osoby

### [tags.ts](tags.ts)
**Backend:** `TagController` (`/api/tags`)

Práce s tagy.

**Typy:**
- `TagDto` - tag data (`id`, `name`)

**Funkce:**
- `listTags()` - seznam všech tagů
- `listTagsPaged(q?, page, size)` - paginovaný seznam s vyhledáváním
- `getTag(id)` - detail jednoho tagu
- `createTag(name)` - vytvoření nového tagu
- `updateTag(id, name)` - aktualizace tagu
- `deleteTag(id)` - soft delete tagu

### [media.ts](media.ts)
**Backend:** `MediaController` (`/api/media`)

Práce s media soubory (obrázky, videa, dokumenty).

**Typy:**
- `MediaDto` - media data (obsahuje `mediaType`, `mimeType`, `uri`, `title`, `note`, `takenAt`)
- `MediaCreate` - vytvoření media (povinné: `mediaType`, `uri`)
- `MediaUpdate` - aktualizace media

**Funkce:**
- `listMedia()` - seznam všech media
- `listMediaPaged(q?, page, size)` - paginovaný seznam s vyhledáváním
- `getMedia(id)` - detail jednoho media
- `createMedia(body)` - vytvoření nového media
- `updateMedia(id, body)` - aktualizace media
- `deleteMedia(id)` - soft delete media

## Vazby mezi entitami

### [personEntries.ts](personEntries.ts)
**Backend:** `PersonEntryController` (`/api/personentry`)

Vazby mezi osobami a entries s rolí (autor, účastník, svědek, atd.).

**Funkce:**
- `addEntryToPerson(personId, entryId, role)` - přidání entry k osobě s rolí
- `removeEntryFromPerson(personId, entryId, role)` - odebrání vazby

### [entryTag.ts](entryTag.ts)
**Backend:** `EntryTagController` (`/api/entriestags`)

Vazby mezi entries a tagy.

**Funkce:**
- `listTagsForEntry(entryId)` - tagy pro entry
- `listTagsForEntryPaged(entryId, page, size)` - tagy pro entry (paginace)
- `listEntriesForTag(tagId)` - entries s tagem
- `listEntriesForTagPaged(tagId, page, size)` - entries s tagem (paginace)
- `addTagToEntry(entryId, tagId)` - přidání tagu k entry
- `removeTagFromEntry(entryId, tagId)` - odebrání tagu z entry

### [mediaEntry.ts](mediaEntry.ts)
**Backend:** `MediaEntryController` (`/api/mediaentry`)

Vazby mezi media a entries s metadaty (`caption`, `sortOrder`).

**Typy:**
- `MediaWithLink` - media s metadaty vazby
- `EntryWithLink` - entry s metadaty vazby
- `MediaEntryUpsert` - data pro vytvoření/aktualizaci vazby

**Funkce:**
- `listMediaForEntry(entryId)` - media pro entry
- `listMediaForEntryPaged(entryId, page, size)` - media pro entry (paginace)
- `listEntriesForMedia(mediaId)` - entries pro media
- `listEntriesForMediaPaged(mediaId, page, size)` - entries pro media (paginace)
- `addMediaToEntry(entryId, mediaId, data?)` - přidání media k entry
- `updateMediaEntryLink(entryId, mediaId, data)` - aktualizace metadat vazby
- `removeMediaFromEntry(entryId, mediaId)` - odebrání media z entry

### [personTags.ts](personTags.ts)
**Backend:** `PersonTagController` (`/api/personstags`)

Vazby mezi osobami a tagy.

**Funkce:**
- `addTagToPerson(personId, tagId)` - přidání tagu k osobě
- `removeTagFromPerson(personId, tagId)` - odebrání tagu od osoby

### [personRelation.ts](personRelation.ts)
**Backend:** `PersonRelationController` (`/api/personrelation`)

Vztahy mezi osobami (rodina, přátelé, kolegové, atd.).

**Typy:**
- `PersonRelationDto` - relace mezi osobami
- `PersonRelationCreate` - vytvoření relace (obsahuje `fromPersonId`, `toPersonId`, `type`, `note`, `validFrom`, `validTo`)

**Funkce:**
- `listRelationsFrom(personId)` - odchozí relace osoby
- `listRelationsFromPaged(personId, page, size)` - odchozí relace (paginace)
- `listRelationsTo(personId)` - příchozí relace osoby
- `listRelationsToPaged(personId, page, size)` - příchozí relace (paginace)
- `createPersonRelation(data)` - vytvoření nové relace
- `deletePersonRelation(relationId)` - smazání relace

## Detail views (Read-only)

### [personRead.ts](personRead.ts)
**Backend:** `PersonReadController` (`/api/personread`)

Načtení kompletního detailního view osoby včetně všech vazeb jedním dotazem.

**Typy:**
- `PersonRead` - kompletní data osoby včetně:
  - `tags` - všechny tagy osoby
  - `entries` - všechny entries s rolí osoby
  - `relationsOut` - odchozí relace
  - `relationsIn` - příchozí relace

**Funkce:**
- `getPersonRead(personId)` - načtení kompletního view

### [entryRead.ts](entryRead.ts)
**Backend:** `EntryReadController` (`/api/entryread`)

Načtení kompletního detailního view entry včetně všech vazeb jedním dotazem.

**Typy:**
- `EntryDetailView` - kompletní data entry včetně:
  - `tags` - všechny tagy
  - `persons` - všechny osoby s rolí
  - `media` - všechna media s metadaty

**Funkce:**
- `getEntryDetail(entryId)` - načtení kompletního view

## Utility

### [http.ts](http.ts)
Základní HTTP utility funkce pro komunikaci s API:
- `apiGet<T>(path)` - GET request
- `apiPost(path, body?)` - POST request
- `apiPostJson<T>(path, body)` - POST s JSON response
- `apiPutJson<T>(path, body)` - PUT s JSON response
- `apiDelete(path)` - DELETE request

## Konvence

### Paginace
Všechny paginované endpointy používají konzistentní `PagedResult<T>` typ:
```typescript
type PagedResult<T> = { 
  items: T[]; 
  total: number; 
  link?: string;
};
```

### Datum formáty
- **ISO datetime** (`Instant` na BE): `"2026-02-01T14:30:00.000Z"`
- **Datum** (`LocalDate` na BE): `"2026-02-01"`

### Validace
Povinná pole na BE (`@NotBlank`, `@NotNull`) jsou v TypeScript **bez optional** (`?`).

### Soft delete
Všechny delete operace jsou soft delete - entity zůstávají v databázi s nastaveným `deletedAt`.

## Mapování Backend → Frontend

| Backend Kontroler | Frontend API |
|-------------------|--------------|
| `EntryController` | `entries.ts` |
| `PersonController` | `persons.ts` |
| `TagController` | `tags.ts` |
| `MediaController` | `media.ts` |
| `PersonEntryController` | `personEntries.ts` |
| `EntryTagController` | `entryTag.ts` |
| `MediaEntryController` | `mediaEntry.ts` |
| `PersonTagController` | `personTags.ts` |
| `PersonRelationController` | `personRelation.ts` |
| `PersonReadController` | `personRead.ts` |
| `EntryReadController` | `entryRead.ts` |
