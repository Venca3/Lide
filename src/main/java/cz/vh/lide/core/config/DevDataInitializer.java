package cz.vh.lide.core.config;

import cz.vh.lide.db.entity.*;
import cz.vh.lide.db.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Initializes development test data on application startup.
 * Clears all data and reloads test data from Liquibase scripts.
 * Only runs when 'dev' profile is active.
 */
@Component
@Profile("dev")
@Slf4j
public class DevDataInitializer implements ApplicationRunner {

    private final PersonRepository personRepo;
    private final EntryRepository entryRepo;
    private final PersonEntryRepository personEntryRepo;
    private final TagRepository tagRepo;
    private final EntryTagRepository entryTagRepo;
    private final MediaRepository mediaRepo;
    private final MediaEntryRepository mediaEntryRepo;
    private final PersonTagRepository personTagRepo;
    private final PersonRelationsRepository personRelationsRepo;
    private final EntityManager entityManager;

    public DevDataInitializer(
            PersonRepository personRepo,
            EntryRepository entryRepo,
            PersonEntryRepository personEntryRepo,
            TagRepository tagRepo,
            EntryTagRepository entryTagRepo,
            MediaRepository mediaRepo,
            MediaEntryRepository mediaEntryRepo,
            PersonTagRepository personTagRepo,
            PersonRelationsRepository personRelationsRepo,
            EntityManager entityManager) {
        this.personRepo = personRepo;
        this.entryRepo = entryRepo;
        this.personEntryRepo = personEntryRepo;
        this.tagRepo = tagRepo;
        this.entryTagRepo = entryTagRepo;
        this.mediaRepo = mediaRepo;
        this.mediaEntryRepo = mediaEntryRepo;
        this.personTagRepo = personTagRepo;
        this.personRelationsRepo = personRelationsRepo;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("=== Initializing DEV test data ===");
        log.warn("!!! CLEARING ALL DATABASE DATA !!!");

        // Clear ALL data from database (in correct order due to FK constraints)
        clearAllData();

        // Create test data matching liquibase test-data.yaml
        createTestData();

        log.info("=== DEV test data initialized successfully ===");
    }

    @SuppressWarnings("null")
    private void clearAllData() {
        log.info("Clearing all database data using TRUNCATE CASCADE...");
        
        // Use native SQL TRUNCATE with CASCADE to remove all data
        entityManager.createNativeQuery(
            "TRUNCATE TABLE media_entry, entry_tag, person_entry, person_tag, person_relation, media, entry, tag, person CASCADE"
        ).executeUpdate();
        
        log.info("All data cleared from database");
    }

    @SuppressWarnings("null")
    private void createTestData() {
        // Create persons
        Person jan = createPerson("Jan", "Novák", "Honza", LocalDate.of(1985, 3, 15), "+420 777 123 456", "jan.novak@example.com", "Kamarád ze základní školy");
        Person marie = createPerson("Marie", "Svobodová", "Máňa", LocalDate.of(1990, 7, 22), "+420 603 987 654", "marie.svobodova@example.com", "Kolegyně z práce");
        Person petr = createPerson("Petr", "Dvořák", null, LocalDate.of(1978, 11, 3), "+420 721 456 789", "petr.dvorak@example.com", "Soused");
        Person eva = createPerson("Eva", "Nováková", "Evička", LocalDate.of(2010, 5, 18), null, null, "Neteř");
        
        log.info("Created {} persons", 4);

        // Create tags
        Tag rodinaTag = createTag("rodina");
        Tag praceTag = createTag("práce");
        Tag kamaradi = createTag("kamarádi");
        Tag sport = createTag("sport");
        Tag cestovani = createTag("cestování");
        
        log.info("Created {} tags", 5);

        // Create entries
        Entry horseEntry = createEntry("memory", "Výlet na hory", 
            "Krásný výlet na Sněžku v létě 2023. Počasí bylo skvělé a výhled úžasný.", 
            "2023-07-15T10:30:00Z");
        
        Entry workEntry = createEntry("story", "První den v práci",
            "Dnes jsem nastoupil do nové práce. Všichni kolegové byli moc milí a ochotní. Marie mi ukázala kancelář a představila mě všem.",
            "2022-09-01T08:00:00Z");
        
        Entry birthdayEntry = createEntry("memory", "Narozeniny Evy",
            "Oslava desátých narozenin Evy. Měli jsme dort s jednorožcem a spoustu dárků. Eva byla nadšená!",
            "2020-05-18T14:00:00Z");
        
        Entry recipeEntry = createEntry("note", "Recept na babiččin koláč",
            "Mouka 500g, cukr 200g, vejce 3ks, máslo 150g, kvasnice, mléko 250ml. Kynutí 1 hodinu.",
            null);
        
        log.info("Created {} entries", 4);

        // Create media
        Media photo1 = createMedia("photo", "image/jpeg", 
            "/photos/snezka-2023-07-15.jpg", "Pohled ze Sněžky", "Panoramatický snímek z vrcholu",
            "2023-07-15T11:45:00Z");
        
        Media photo2 = createMedia("photo", "image/jpeg",
            "/photos/eva-birthday-2020.jpg", "Eva s dárky", "Fotka z oslavy",
            "2020-05-18T15:20:00Z");
        
        Media doc = createMedia("doc", "application/pdf",
            "/docs/babicka-recepty.pdf", "Babiččina kuchařka", "Digitalizované recepty", null);
        
        log.info("Created {} media", 3);

        // Link persons to tags
        linkPersonToTag(jan, kamaradi);
        linkPersonToTag(jan, sport);
        linkPersonToTag(marie, praceTag);
        linkPersonToTag(eva, rodinaTag);
        
        log.info("Linked persons to tags");

        // Link entries to tags
        linkEntryToTag(horseEntry, cestovani);
        linkEntryToTag(workEntry, praceTag);
        linkEntryToTag(birthdayEntry, rodinaTag);
        
        log.info("Linked entries to tags");

        // Link persons to entries
        linkPersonToEntry(marie, workEntry, "mentioned");
        linkPersonToEntry(eva, birthdayEntry, "mentioned");
        
        log.info("Linked persons to entries");

        // Link media to entries
        linkMediaToEntry(horseEntry, photo1, 0, null);
        linkMediaToEntry(birthdayEntry, photo2, 0, null);
        linkMediaToEntry(recipeEntry, doc, 0, null);
        
        log.info("Linked media to entries");

        // Create person relations
        linkPersonRelation(jan, marie, "friend", "Spolužák ze základní školy");
        linkPersonRelation(jan, petr, "neighbor", "Živý soused");
        linkPersonRelation(marie, eva, "colleague", "Moje neteř");
        
        log.info("Created person relations");
    }

    private Person createPerson(String firstName, String lastName, String nickname, LocalDate birthDate, String phone, String email, String note) {
        Person person = new Person();
        person.setFirstName(firstName);
        person.setLastName(lastName);
        person.setNickname(nickname);
        person.setBirthDate(birthDate);
        person.setPhone(phone);
        person.setEmail(email);
        person.setNote(note);
        return personRepo.save(person);
    }

    private Entry createEntry(String type, String title, String content, String occurredAt) {
        Entry entry = new Entry();
        entry.setType(type);
        entry.setTitle(title);
        entry.setContent(content);
        if (occurredAt != null) {
            entry.setOccurredAt(Instant.parse(occurredAt));
        }
        return entryRepo.save(entry);
    }

    private Tag createTag(String name) {
        Tag tag = new Tag();
        tag.setName(name);
        return tagRepo.save(tag);
    }

    private Media createMedia(String mediaType, String mimeType, String uri, String title, String note, String takenAt) {
        Media media = new Media();
        media.setMediaType(mediaType);
        media.setMimeType(mimeType);
        media.setUri(uri);
        media.setTitle(title);
        media.setNote(note);
        if (takenAt != null) {
            media.setTakenAt(Instant.parse(takenAt));
        }
        return mediaRepo.save(media);
    }

    private void linkPersonToTag(Person person, Tag tag) {
        PersonTag link = new PersonTag();
        link.setPerson(person);
        link.setTag(tag);
        personTagRepo.save(link);
    }

    private void linkEntryToTag(Entry entry, Tag tag) {
        EntryTag link = new EntryTag();
        link.setEntry(entry);
        link.setTag(tag);
        entryTagRepo.save(link);
    }

    private void linkPersonToEntry(Person person, Entry entry, String role) {
        PersonEntry link = new PersonEntry();
        link.setPerson(person);
        link.setEntry(entry);
        link.setRole(role);
        personEntryRepo.save(link);
    }

    private void linkMediaToEntry(Entry entry, Media media, Integer sortOrder, String caption) {
        MediaEntry link = new MediaEntry();
        link.setEntry(entry);
        link.setMedia(media);
        link.setSortOrder(sortOrder);
        link.setCaption(caption);
        mediaEntryRepo.save(link);
    }

    private void linkPersonRelation(Person fromPerson, Person toPerson, String type, String note) {
        PersonRelation relation = new PersonRelation();
        relation.setFromPerson(fromPerson);
        relation.setToPerson(toPerson);
        relation.setType(type);
        relation.setNote(note);
        personRelationsRepo.save(relation);
    }
}
