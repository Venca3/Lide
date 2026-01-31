# TODO – Lide (zůstatek úkolů)

> Aktuální stav: implementovali jsme Bean Validation pro DTO a doplnili OpenAPI (204 No Content) u operací delete/remove/assign. Níže je zúžený seznam zbývajících úkolů pro dokončení MVP.

---

## Prioritní zbylé úkoly

### Backend
- [ ] Implementovat vyhledávání a stránkování pro `persons`, `tags`, `entries` (`q`, `page`, `size`).
- [ ] Doladit `ApiExceptionHandler` pro konzistentní `404 Not Found` a `409 Conflict` odpovědi (ProblemDetail formát).
- [ ] Konfigurace CORS pro produkci a stručná dokumentace Vite proxy pro vývoj.
- [ ] Přidat základní seed data (Liquibase changelog nebo jednoduchý seed endpoint).
- [ ] Rozšířit read-DTO/aggregation: `PersonRead` vracet počet médií nebo média; `EntryRead` vracet připojené osoby + média.

### Frontend (MVP)
- [ ] `Persons` list: vyhledávání + tlačítko „New person".
- [ ] `Person` detail: editace polí (nickname, phone, email, note, birthDate), tags (add/remove/quick-create), entries (add/remove + role), relations (add/remove + show incoming/outgoing).
- [ ] `Entries` list: vyhledávání + vytvoření entry.
- [ ] `Entry` detail: editace (title/content/type/occurredAt), tags, persons (add/remove + role), media (add/remove + caption/sortOrder).
- [ ] `Media` list: vytvoření media (uri) a zobrazení.
- [ ] UX minimum: loading stavy, zobrazit chyby z API (ProblemDetail), potvrzení u delete, základní layout (sidebar + content).

### Dokumentace & DevOps
- [ ] Aktualizovat `README.md`, `run.env.example` a `frontend/README.md` (spuštění DB + BE + FE, proměnné prostředí).
- [ ] Přidat `docker-compose` pro lokální vývoj (Postgres + backend + frontend) — volitelné, ale doporučené.

---

Pokud chceš, můžu hned začít s prvním bodem: implementace vyhledávání a stránkování pro `persons` (backend). Chceš, abych začal tímto konkrétním úkolem?

