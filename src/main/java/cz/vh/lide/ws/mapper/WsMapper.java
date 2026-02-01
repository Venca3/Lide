package cz.vh.lide.ws.mapper;

import cz.vh.lide.core.tools.StringNormalization;
import cz.vh.lide.db.dto.EntryDto;
import cz.vh.lide.db.dto.EntryTagDto;
import cz.vh.lide.db.dto.MediaDto;
import cz.vh.lide.db.dto.MediaEntryDto;
import cz.vh.lide.db.dto.PersonDto;
import cz.vh.lide.db.dto.PersonEntryDto;
import cz.vh.lide.db.dto.PersonRelationDto;
import cz.vh.lide.db.dto.PersonTagDto;
import cz.vh.lide.db.dto.TagDto;
import cz.vh.lide.ws.dto.BindingDtos;
import cz.vh.lide.ws.dto.EntryDtos;
import cz.vh.lide.ws.dto.MediaDtos;
import cz.vh.lide.ws.dto.PersonDtos;
import cz.vh.lide.ws.dto.TagDtos;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public final class WsMapper {

  private WsMapper() {
  }

  public static EntryDtos.EntryView toEntryView(EntryDto dto) {
    return new EntryDtos.EntryView(dto.getId(), dto.getType(), dto.getTitle(), dto.getContent(),
        dto.getOccurredAt());
  }

  public static PersonDtos.PersonView toPersonView(PersonDto dto) {
    return new PersonDtos.PersonView(dto.getId(), dto.getFirstName(), dto.getLastName(),
        dto.getNickname(), dto.getBirthDate(), dto.getPhone(), dto.getEmail(), dto.getNote());
  }

  public static TagDtos.TagView toTagView(TagDto dto) {
    return new TagDtos.TagView(dto.getId(), dto.getName());
  }

  public static MediaDtos.MediaView toMediaView(MediaDto dto) {
    return new MediaDtos.MediaView(dto.getId(), dto.getMediaType(), dto.getMimeType(), dto.getUri(),
        dto.getTitle(), dto.getNote(), dto.getTakenAt());
  }

  public static EntryDto toEntryDto(EntryDtos.EntryCreate req) {
    var dto = EntryDto.builder()
        .type(req.type())
        .title(req.title())
        .content(req.content())
        .occurredAt(req.occurredAt())
        .entryTags(toEntryTagDtosForEntry(req.entryTags()))
        .personEntries(toPersonEntryDtosForEntry(req.personEntries()))
        .mediaEntries(toMediaEntryDtosForEntry(req.mediaEntries()))
        .build();
    return dto;
  }

  public static EntryDto toEntryDto(EntryDtos.EntryUpdate req) {
    return EntryDto.builder()
        .type(req.type())
        .title(req.title())
        .content(req.content())
        .occurredAt(req.occurredAt())
        .build();
  }

  public static PersonDto toPersonDto(PersonDtos.PersonCreate req) {
    return PersonDto.builder()
        .firstName(req.firstName())
        .lastName(req.lastName())
        .nickname(req.nickname())
        .birthDate(req.birthDate())
        .phone(req.phone())
        .email(req.email())
        .note(req.note())
        .personEntries(toPersonEntryDtosForPerson(req.personEntries()))
        .personTags(toPersonTagDtosForPerson(req.personTags()))
        .relationsOut(toPersonRelationDtosForOut(req.relationsOut()))
        .relationsIn(toPersonRelationDtosForIn(req.relationsIn()))
        .build();
  }

  public static PersonDto toPersonDto(PersonDtos.PersonUpdate req) {
    return PersonDto.builder()
        .firstName(req.firstName())
        .lastName(req.lastName())
        .nickname(req.nickname())
        .birthDate(req.birthDate())
        .phone(req.phone())
        .email(req.email())
        .note(req.note())
        .build();
  }

  public static TagDto toTagDto(TagDtos.TagCreate req) {
    return TagDto.builder()
        .name(StringNormalization.normalize(req.name()))
        .entryTags(toEntryTagDtosForTag(req.entryTags()))
        .personTags(toPersonTagDtosForTag(req.personTags()))
        .build();
  }

  public static TagDto toTagDto(TagDtos.TagUpdate req) {
    return TagDto.builder()
        .name(StringNormalization.normalize(req.name()))
        .build();
  }

  public static MediaDto toMediaDto(MediaDtos.MediaCreate req) {
    return MediaDto.builder()
        .mediaType(req.mediaType())
        .mimeType(req.mimeType())
        .uri(req.uri())
        .title(req.title())
        .note(req.note())
        .takenAt(req.takenAt())
        .mediaEntries(toMediaEntryDtosForMedia(req.mediaEntries()))
        .build();
  }

  public static MediaDto toMediaDto(MediaDtos.MediaUpdate req) {
    return MediaDto.builder()
        .mediaType(req.mediaType())
        .mimeType(req.mimeType())
        .uri(req.uri())
        .title(req.title())
        .note(req.note())
        .takenAt(req.takenAt())
        .build();
  }

  private static List<EntryTagDto> toEntryTagDtosForEntry(List<BindingDtos.EntryTagCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<EntryTagDto>(links.size());
    for (var link : links) {
      if (link == null || link.tagId() == null) {
        throw new IllegalArgumentException("EntryTagCreate.tagId is required for entry create");
      }
      result.add(EntryTagDto.builder()
          .tag(TagDto.builder().id(link.tagId()).build())
          .build());
    }
    return result;
  }

  private static List<EntryTagDto> toEntryTagDtosForTag(List<BindingDtos.EntryTagCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<EntryTagDto>(links.size());
    for (var link : links) {
      if (link == null || link.entryId() == null) {
        throw new IllegalArgumentException("EntryTagCreate.entryId is required for tag create");
      }
      result.add(EntryTagDto.builder()
          .entry(EntryDto.builder().id(link.entryId()).build())
          .build());
    }
    return result;
  }

  private static List<PersonEntryDto> toPersonEntryDtosForEntry(List<BindingDtos.PersonEntryCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<PersonEntryDto>(links.size());
    for (var link : links) {
      if (link == null || link.personId() == null) {
        throw new IllegalArgumentException("PersonEntryCreate.personId is required for entry create");
      }
      result.add(PersonEntryDto.builder()
          .role(link.role())
          .person(PersonDto.builder().id(link.personId()).build())
          .build());
    }
    return result;
  }

  private static List<PersonEntryDto> toPersonEntryDtosForPerson(List<BindingDtos.PersonEntryCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<PersonEntryDto>(links.size());
    for (var link : links) {
      if (link == null || link.entryId() == null) {
        throw new IllegalArgumentException("PersonEntryCreate.entryId is required for person create");
      }
      result.add(PersonEntryDto.builder()
          .role(link.role())
          .entry(EntryDto.builder().id(link.entryId()).build())
          .build());
    }
    return result;
  }

  private static List<MediaEntryDto> toMediaEntryDtosForEntry(List<BindingDtos.MediaEntryCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<MediaEntryDto>(links.size());
    for (var link : links) {
      if (link == null || link.mediaId() == null) {
        throw new IllegalArgumentException("MediaEntryCreate.mediaId is required for entry create");
      }
      result.add(MediaEntryDto.builder()
          .caption(link.caption())
          .sortOrder(link.sortOrder())
          .media(MediaDto.builder().id(link.mediaId()).build())
          .build());
    }
    return result;
  }

  private static List<MediaEntryDto> toMediaEntryDtosForMedia(List<BindingDtos.MediaEntryCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<MediaEntryDto>(links.size());
    for (var link : links) {
      if (link == null || link.entryId() == null) {
        throw new IllegalArgumentException("MediaEntryCreate.entryId is required for media create");
      }
      result.add(MediaEntryDto.builder()
          .caption(link.caption())
          .sortOrder(link.sortOrder())
          .entry(EntryDto.builder().id(link.entryId()).build())
          .build());
    }
    return result;
  }

  private static List<PersonTagDto> toPersonTagDtosForPerson(List<BindingDtos.PersonTagCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<PersonTagDto>(links.size());
    for (var link : links) {
      if (link == null || link.tagId() == null) {
        throw new IllegalArgumentException("PersonTagCreate.tagId is required for person create");
      }
      result.add(PersonTagDto.builder()
          .tag(TagDto.builder().id(link.tagId()).build())
          .build());
    }
    return result;
  }

  private static List<PersonTagDto> toPersonTagDtosForTag(List<BindingDtos.PersonTagCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<PersonTagDto>(links.size());
    for (var link : links) {
      if (link == null || link.personId() == null) {
        throw new IllegalArgumentException("PersonTagCreate.personId is required for tag create");
      }
      result.add(PersonTagDto.builder()
          .person(PersonDto.builder().id(link.personId()).build())
          .build());
    }
    return result;
  }

  private static List<PersonRelationDto> toPersonRelationDtosForOut(
      List<BindingDtos.PersonRelationCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<PersonRelationDto>(links.size());
    for (var link : links) {
      if (link == null || link.toPersonId() == null) {
        throw new IllegalArgumentException("PersonRelationCreate.toPersonId is required for relationsOut");
      }
      result.add(PersonRelationDto.builder()
          .type(link.type())
          .note(link.note())
          .validFrom(link.validFrom())
          .validTo(link.validTo())
          .toPerson(PersonDto.builder().id(link.toPersonId()).build())
          .build());
    }
    return result;
  }

  private static List<PersonRelationDto> toPersonRelationDtosForIn(
      List<BindingDtos.PersonRelationCreate> links) {
    if (links == null || links.isEmpty()) {
      return Collections.emptyList();
    }
    var result = new ArrayList<PersonRelationDto>(links.size());
    for (var link : links) {
      if (link == null || link.fromPersonId() == null) {
        throw new IllegalArgumentException("PersonRelationCreate.fromPersonId is required for relationsIn");
      }
      result.add(PersonRelationDto.builder()
          .type(link.type())
          .note(link.note())
          .validFrom(link.validFrom())
          .validTo(link.validTo())
          .fromPerson(PersonDto.builder().id(link.fromPersonId()).build())
          .build());
    }
    return result;
  }

  public static UUID requireId(UUID id, String label) {
    return Objects.requireNonNull(id, label + " must not be null");
  }
}
