package cz.vh.lide.db.mapper;

import cz.vh.lide.db.dto.EntryDto;
import cz.vh.lide.db.dto.EntryTagDto;
import cz.vh.lide.db.dto.MediaDto;
import cz.vh.lide.db.dto.MediaEntryDto;
import cz.vh.lide.db.dto.PersonDto;
import cz.vh.lide.db.dto.PersonEntryDto;
import cz.vh.lide.db.dto.PersonRelationDto;
import cz.vh.lide.db.dto.PersonTagDto;
import cz.vh.lide.db.dto.TagDto;
import cz.vh.lide.db.entity.Entry;
import cz.vh.lide.db.entity.EntryTag;
import cz.vh.lide.db.entity.Media;
import cz.vh.lide.db.entity.MediaEntry;
import cz.vh.lide.db.entity.Person;
import cz.vh.lide.db.entity.PersonEntry;
import cz.vh.lide.db.entity.PersonRelation;
import cz.vh.lide.db.entity.PersonTag;
import cz.vh.lide.db.entity.Tag;

import java.util.List;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface DbMapper {

  // DTO mappings

  @Mapping(target = "entryTags", qualifiedByName = "entryTagShallowList")
  @Mapping(target = "personEntries", qualifiedByName = "personEntryShallowList")
  @Mapping(target = "mediaEntries", qualifiedByName = "mediaEntryShallowList")
  EntryDto toEntryDto(Entry entity);

  @Mapping(target = "personEntries", qualifiedByName = "personEntryShallowList")
  @Mapping(target = "personTags", qualifiedByName = "personTagShallowList")
  @Mapping(target = "relationsOut", qualifiedByName = "personRelationShallowList")
  @Mapping(target = "relationsIn", qualifiedByName = "personRelationShallowList")
  PersonDto toPersonDto(Person entity);

  @Mapping(target = "entryTags", qualifiedByName = "entryTagShallowList")
  @Mapping(target = "personTags", qualifiedByName = "personTagShallowList")
  TagDto toTagDto(Tag entity);

  @Mapping(target = "mediaEntries", qualifiedByName = "mediaEntryShallowList")
  MediaDto toMediaDto(Media entity);

  @Named("entryTagShallow")
  @Mapping(target = "entry", ignore = true)
  @Mapping(target = "tag", ignore = true)
  EntryTagDto toEntryTagDto(EntryTag entity);

  @Named("personEntryShallow")
  @Mapping(target = "person", ignore = true)
  @Mapping(target = "entry", ignore = true)
  PersonEntryDto toPersonEntryDto(PersonEntry entity);

  @Named("mediaEntryShallow")
  @Mapping(target = "media", ignore = true)
  @Mapping(target = "entry", ignore = true)
  MediaEntryDto toMediaEntryDto(MediaEntry entity);

  @Named("personTagShallow")
  @Mapping(target = "person", ignore = true)
  @Mapping(target = "tag", ignore = true)
  PersonTagDto toPersonTagDto(PersonTag entity);

  @Named("personRelationShallow")
  @Mapping(target = "fromPerson", ignore = true)
  @Mapping(target = "toPerson", ignore = true)
  PersonRelationDto toPersonRelationDto(PersonRelation entity);

  @IterableMapping(qualifiedByName = "entryTagShallow")
  @Named("entryTagShallowList")
  List<EntryTagDto> toEntryTagDtoList(List<EntryTag> entities);

  @IterableMapping(qualifiedByName = "personEntryShallow")
  @Named("personEntryShallowList")
  List<PersonEntryDto> toPersonEntryDtoList(List<PersonEntry> entities);

  @IterableMapping(qualifiedByName = "mediaEntryShallow")
  @Named("mediaEntryShallowList")
  List<MediaEntryDto> toMediaEntryDtoList(List<MediaEntry> entities);

  @IterableMapping(qualifiedByName = "personTagShallow")
  @Named("personTagShallowList")
  List<PersonTagDto> toPersonTagDtoList(List<PersonTag> entities);

  @IterableMapping(qualifiedByName = "personRelationShallow")
  @Named("personRelationShallowList")
  List<PersonRelationDto> toPersonRelationDtoList(List<PersonRelation> entities);

  // Entity mappings

  @Named("personEntity")
  @Mapping(target = "personEntries", ignore = true)
  @Mapping(target = "personTags", ignore = true)
  @Mapping(target = "relationsOut", ignore = true)
  @Mapping(target = "relationsIn", ignore = true)
  Person toPersonEntity(PersonDto personDto);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "personEntries", ignore = true)
  @Mapping(target = "personTags", ignore = true)
  @Mapping(target = "relationsOut", ignore = true)
  @Mapping(target = "relationsIn", ignore = true)
  void updatePersonFromDto(PersonDto personDto, @MappingTarget Person entity);

  @Named("entryEntity")
  @Mapping(target = "entryTags", ignore = true)
  @Mapping(target = "personEntries", ignore = true)
  @Mapping(target = "mediaEntries", ignore = true)
  Entry toEntryEntity(EntryDto entryDto);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "entryTags", ignore = true)
  @Mapping(target = "personEntries", ignore = true)
  @Mapping(target = "mediaEntries", ignore = true)
  void updateEntryFromDto(EntryDto entryDto, @MappingTarget Entry entity);

  @Named("tagEntity")
  @Mapping(target = "entryTags", ignore = true)
  @Mapping(target = "personTags", ignore = true)
  Tag toTagEntity(TagDto tagDto);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "entryTags", ignore = true)
  @Mapping(target = "personTags", ignore = true)
  void updateTagFromDto(TagDto tagDto, @MappingTarget Tag entity);

  @Named("mediaEntity")
  @Mapping(target = "mediaEntries", ignore = true)
  Media toMediaEntity(MediaDto mediaDto);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "mediaEntries", ignore = true)
  void updateMediaFromDto(MediaDto mediaDto, @MappingTarget Media entity);

  @Mapping(target = "entry", qualifiedByName = "entryEntity")
  @Mapping(target = "tag", qualifiedByName = "tagEntity")
  EntryTag toEntryTagEntity(EntryTagDto entryTagDto);

  @Mapping(target = "person", qualifiedByName = "personEntity")
  @Mapping(target = "entry", qualifiedByName = "entryEntity")
  PersonEntry toPersonEntryEntity(PersonEntryDto personEntryDto);

  @Mapping(target = "media", qualifiedByName = "mediaEntity")
  @Mapping(target = "entry", qualifiedByName = "entryEntity")
  MediaEntry toMediaEntryEntity(MediaEntryDto mediaEntryDto);

  @Mapping(target = "person", qualifiedByName = "personEntity")
  @Mapping(target = "tag", qualifiedByName = "tagEntity")
  PersonTag toPersonTagEntity(PersonTagDto personTagDto);

  @Mapping(target = "fromPerson", qualifiedByName = "personEntity")
  @Mapping(target = "toPerson", qualifiedByName = "personEntity")
  PersonRelation toPersonRelationEntity(PersonRelationDto personRelationDto);
}
