import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RelationshipCard } from "@/components/layout/RelationshipCard";
import { TagItem } from "@/components/layout/TagItem";
import { formatDateTime } from "@/lib/dateFormat";
import { isoToDatetimeLocal, datetimeLocalToIso } from "@/lib/datetimeLocalConvert";

import { deleteEntry, updateEntry } from "../api/entries";
import { getEntryDetail } from "../api/entryRead";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { getPersonDisplayName } from "@/lib/person";
import { EntryForm } from "@/featured/entries/EntryForm";
import { listTags } from "@/api/tags";
import { addTagToEntry, removeTagFromEntry } from "@/api/entryTag";
import { updateEntryRole, removeEntryFromPerson, addEntryToPerson } from "@/api/personEntries";
import { listPersons } from "@/api/persons";
import { addMediaToEntry, removeMediaFromEntry, updateMediaEntryLink } from "@/api/mediaEntry";
import { listMedia } from "@/api/media";

export function EntryDetailPage() {
  const { id } = useParams();
  const entryId = id ?? "";
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["entry", entryId],
    queryFn: () => getEntryDetail(entryId),
    enabled: !!entryId,
  });

  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [content, setContent] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [tagConfirmOpen, setTagConfirmOpen] = useState(false);
  const [tagConfirmTarget, setTagConfirmTarget] = useState<{ id: string; label: string } | null>(null);
  const [personConfirmOpen, setPersonConfirmOpen] = useState(false);
  const [personConfirmTarget, setPersonConfirmTarget] = useState<{ id: string; label: string; role?: string | null } | null>(null);
  const [editPersonRoleOpen, setEditPersonRoleOpen] = useState(false);
  const [editPersonRoleTarget, setEditPersonRoleTarget] = useState<{ id: string; displayName: string; oldRole: string | null } | null>(null);
  const [editPersonRoleValues, setEditPersonRoleValues] = useState({ role: "" });
  const [mediaConfirmOpen, setMediaConfirmOpen] = useState(false);
  const [mediaConfirmTarget, setMediaConfirmTarget] = useState<{ id: string; label: string } | null>(null);
  const [editMediaLinkOpen, setEditMediaLinkOpen] = useState(false);
  const [editMediaLinkTarget, setEditMediaLinkTarget] = useState<{ id: string; title: string; caption: string | null; sortOrder: number | null } | null>(null);
  const [editMediaLinkValues, setEditMediaLinkValues] = useState({ caption: "", sortOrder: "" });

  useEffect(() => {
    if (q.data) {
      setType(q.data.type ?? "");
      setTitle(q.data.title ?? "");
      setOccurredAt(isoToDatetimeLocal(q.data.occurredAt));
      setContent(q.data.content ?? "");
    }
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: () => {
      const trimmedOccurredAt = occurredAt.trim();
      const isoDate = datetimeLocalToIso(trimmedOccurredAt);

      const trimmedType = type.trim();
      const trimmedContent = content.trim();
      
      if (!trimmedType) throw new Error("Type is required");
      if (!trimmedContent) throw new Error("Content is required");

      return updateEntry(entryId, {
        type: trimmedType,
        title: title.trim() || null,
        content: trimmedContent,
        occurredAt: isoDate,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
      await qc.invalidateQueries({ queryKey: ["entries"] });
      setEditMode(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteEntry(entryId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
      nav("/entries");
    },
  });

  const removeTagMut = useMutation({
    mutationFn: (tagId: string) => removeTagFromEntry(entryId, tagId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
    },
  });

  const updatePersonRoleMut = useMutation({
    mutationFn: ({ personId, oldRole, newRole }: { personId: string; oldRole: string | null; newRole: string }) =>
      updateEntryRole(personId, entryId, oldRole ?? "autor", newRole),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
      setEditPersonRoleOpen(false);
      setEditPersonRoleTarget(null);
    },
  });

  const removePersonMut = useMutation({
    mutationFn: (x: { personId: string; role: string | null | undefined }) =>
      removeEntryFromPerson(x.personId, entryId, x.role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
      setPersonConfirmOpen(false);
      setPersonConfirmTarget(null);
    },
  });

  const addPersonMut = useMutation({
    mutationFn: ({ personId, role }: { personId: string; role: string }) =>
      addEntryToPerson(personId, entryId, role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
    },
  });

  const addMediaMut = useMutation({
    mutationFn: (mediaId: string) => addMediaToEntry(entryId, mediaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
    },
  });

  const updateMediaLinkMut = useMutation({
    mutationFn: ({ mediaId, caption, sortOrder }: { mediaId: string; caption: string | null; sortOrder: number | null }) =>
      updateMediaEntryLink(entryId, mediaId, { caption, sortOrder }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
      setEditMediaLinkOpen(false);
      setEditMediaLinkTarget(null);
    },
  });

  const removeMediaMut = useMutation({
    mutationFn: (mediaId: string) => removeMediaFromEntry(entryId, mediaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entry", entryId] });
      setMediaConfirmOpen(false);
      setMediaConfirmTarget(null);
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!entryId) return <div>Missing ID in URL.</div>;

  const entry = q.data;
  const entryTitle = entry?.title || "(no title)";

  const isValidDateString = (str: string) => {
    if (!str.trim()) return true; // optional
    try {
      new Date(str);
      return true;
    } catch {
      return false;
    }
  };

  const occurredAtInvalid = occurredAt && !isValidDateString(occurredAt);

  // View content - zobrazení detailu
  const viewContent = entry ? (
    <>
      <div>
        <div className="text-sm text-muted-foreground">Type</div>
        <div>{entry.type || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Title</div>
        <div>{entry.title || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Occurred at</div>
        <div>{formatDateTime(entry.occurredAt) || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Content</div>
        <div className="whitespace-pre-wrap">{entry.content || "-"}</div>
      </div>
    </>
  ) : null;

  // Relationship content - vazby
  const relationshipContent = entry ? (
    <div className="space-y-4">
      {entry.tags && (
        <RelationshipCard
          title="Tags"
          resource={{ singular: "Tag", plural: "Tags" }}
          addDialogProps={{
            invalidateQueryKey: ["entry", entryId],
            queryKey: ["tags"],
            queryFn: listTags,
            filterFn: (tag, q) => tag.name.toLowerCase().includes(q.toLowerCase()),
            labelFn: (tag) => tag.name,
            getItemId: (tag) => tag.id,
            isItemFiltered: (tag, existingSet) => existingSet.has(tag.id),
            onAddFn: (tagId) => addTagToEntry(entryId, tagId),
            existing: entry.tags.map((t) => t.id),
            disabled: q.isLoading,
            errorMessage: "Failed to add tag.",
          }}
          isEmpty={entry.tags.length === 0}
          error={removeTagMut.isError ? "Failed to remove tag." : undefined}
          confirm={{
            open: tagConfirmOpen,
            onOpenChange: setTagConfirmOpen,
            description: tagConfirmTarget
              ? `Do you want to remove tag '${tagConfirmTarget.label}' from this entry?`
              : "Do you want to remove this tag from this entry?",
            isConfirming: removeTagMut.isPending,
            onConfirm: () => {
              if (!tagConfirmTarget) return;
              removeTagMut.mutate(tagConfirmTarget.id);
              setTagConfirmTarget(null);
            },
          }}
        >
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <TagItem
                key={tag.id}
                label={tag.name}
                onRemove={() => {
                  setTagConfirmTarget({ id: tag.id, label: tag.name });
                  setTagConfirmOpen(true);
                }}
                disabled={removeTagMut.isPending}
              />
            ))}
          </div>
        </RelationshipCard>
      )}

      {entry.persons && (
        <RelationshipCard
          title="People"
          resource={{ singular: "Person", plural: "People" }}
          addDialogProps={{
            invalidateQueryKey: ["entry", entryId],
            extraField: {
              label: "Role",
              placeholder: "Role (e.g., author, subject, witness…)",
              defaultValue: "autor",
            },
            queryKey: ["persons"],
            queryFn: listPersons,
            filterFn: (person, q) => {
              const lowerQ = q.toLowerCase();
              const displayName = getPersonDisplayName({
                firstName: person.firstName,
                lastName: person.lastName,
                nickname: person.nickname,
              }).toLowerCase();
              return displayName.includes(lowerQ);
            },
            labelFn: (person) =>
              getPersonDisplayName({
                firstName: person.firstName,
                lastName: person.lastName,
                nickname: person.nickname,
              }),
            getItemId: (person) => person.id,
            isItemFiltered: (person, existingSet, role) => {
              const roleKey = (role ?? "").trim();
              return existingSet.has(`${person.id}::${roleKey}`);
            },
            onAddFn: (personId, role) => addPersonMut.mutateAsync({ personId, role: role ?? "autor" }),
            existing: entry.persons.map((p) => `${p.personId}::${p.role ?? ""}`),
            disabled: q.isLoading,
            errorMessage: "Failed to add person.",
          }}
          isEmpty={entry.persons.length === 0}
          emptyMessage="No people linked"
          error={removePersonMut.isError ? "Failed to remove person." : undefined}
          confirm={{
            open: personConfirmOpen,
            onOpenChange: setPersonConfirmOpen,
            title: "Remove person",
            description: personConfirmTarget
              ? `Do you want to remove '${personConfirmTarget.label}' from this entry?`
              : "Do you want to remove this person from this entry?",
            isConfirming: removePersonMut.isPending,
            onConfirm: () => {
              if (!personConfirmTarget) return;
              removePersonMut.mutate({ personId: personConfirmTarget.id, role: personConfirmTarget.role });
              setPersonConfirmTarget(null);
            },
          }}
          items={entry.persons}
          renderItem={(p) => (
            <>
              <div className="font-medium">
                {getPersonDisplayName({ 
                  firstName: p.firstName, 
                  lastName: p.lastName, 
                  nickname: p.nickname 
                })}
              </div>
              {p.role && (
                <div className="text-muted-foreground">Role: {p.role}</div>
              )}
            </>
          )}
          onEditItem={(p) => {
            const displayName = getPersonDisplayName({
              firstName: p.firstName,
              lastName: p.lastName,
              nickname: p.nickname,
            });
            setEditPersonRoleTarget({ id: p.personId, displayName, oldRole: p.role ?? null });
            setEditPersonRoleValues({ role: p.role || "" });
            setEditPersonRoleOpen(true);
          }}
          onRemoveItem={(p) => {
            const displayName = getPersonDisplayName({
              firstName: p.firstName,
              lastName: p.lastName,
              nickname: p.nickname,
            });
            setPersonConfirmTarget({ id: p.personId, label: displayName, role: p.role });
            setPersonConfirmOpen(true);
          }}
          editItemDisabled={() => updatePersonRoleMut.isPending || removePersonMut.isPending}
          removeItemDisabled={() => removePersonMut.isPending}
          editDialog={{
            open: editPersonRoleOpen,
            onOpenChange: setEditPersonRoleOpen,
            title: "Edit Role",
            description: `Update the role for "${editPersonRoleTarget?.displayName}"`,
            fields: [{ name: "role", label: "Role", placeholder: "e.g., author, subject...", required: true }],
            values: editPersonRoleValues,
            onValuesChange: (field, value) => setEditPersonRoleValues({ ...editPersonRoleValues, [field]: value }),
            onSave: async () => {
              if (!editPersonRoleTarget) return;
              const newRole = editPersonRoleValues.role.trim();
              if (!newRole) throw new Error("Role is required");
              await updatePersonRoleMut.mutateAsync({
                personId: editPersonRoleTarget.id,
                oldRole: editPersonRoleTarget.oldRole,
                newRole,
              });
            },
            isPending: updatePersonRoleMut.isPending,
            errorMessage: updatePersonRoleMut.isError ? "Failed to update role." : undefined,
          }}
        />
      )}

      {entry.media && (
        <RelationshipCard
          title="Media"
          resource={{ singular: "Media" }}
          addDialogProps={{
            invalidateQueryKey: ["entry", entryId],
            queryKey: ["media"],
            queryFn: listMedia,
            filterFn: (media, q) => {
              const lowerQ = q.toLowerCase();
              return (
                (media.title ?? "").toLowerCase().includes(lowerQ) ||
                media.uri.toLowerCase().includes(lowerQ) ||
                media.mediaType.toLowerCase().includes(lowerQ)
              );
            },
            labelFn: (media) => (
              <>
                <span className="mr-2 text-muted-foreground">{media.mediaType}</span>
                {media.title || media.uri}
              </>
            ),
            getItemId: (media) => media.id,
            isItemFiltered: (media, existingSet) => existingSet.has(media.id),
            onAddFn: (mediaId) => addMediaMut.mutateAsync(mediaId).then(() => {}),
            existing: entry.media.map((m) => m.mediaId),
            disabled: q.isLoading,
            errorMessage: "Failed to add media.",
          }}
          isEmpty={entry.media.length === 0}
          error={removeMediaMut.isError ? "Failed to remove media." : undefined}
          confirm={{
            open: mediaConfirmOpen,
            onOpenChange: setMediaConfirmOpen,
            title: "Remove media",
            description: mediaConfirmTarget
              ? `Do you want to remove '${mediaConfirmTarget.label}' from this entry?`
              : "Do you want to remove this media from this entry?",
            isConfirming: removeMediaMut.isPending,
            onConfirm: () => {
              if (!mediaConfirmTarget) return;
              removeMediaMut.mutate(mediaConfirmTarget.id);
              setMediaConfirmTarget(null);
            },
          }}
          items={entry.media}
          renderItem={(m) => (
            <>
              <div className="font-medium">{m.title || m.uri}</div>
              <div className="text-muted-foreground">
                {m.mediaType}
                {m.caption && ` • Caption: ${m.caption}`}
                {m.sortOrder != null && ` • Order: ${m.sortOrder}`}
              </div>
            </>
          )}
          onEditItem={(m) => {
            setEditMediaLinkTarget({
              id: m.mediaId,
              title: m.title || m.uri,
              caption: m.caption ?? null,
              sortOrder: m.sortOrder ?? null,
            });
            setEditMediaLinkValues({ caption: m.caption || "", sortOrder: (m.sortOrder ?? "").toString() });
            setEditMediaLinkOpen(true);
          }}
          onRemoveItem={(m) => {
            setMediaConfirmTarget({ id: m.mediaId, label: m.title || m.uri });
            setMediaConfirmOpen(true);
          }}
          editItemDisabled={() => updateMediaLinkMut.isPending || removeMediaMut.isPending}
          removeItemDisabled={() => removeMediaMut.isPending}
          editDialog={{
            open: editMediaLinkOpen,
            onOpenChange: setEditMediaLinkOpen,
            title: "Edit Metadata",
            description: `Update the metadata for "${editMediaLinkTarget?.title}"`,
            fields: [
              { name: "caption", label: "Caption", placeholder: "Optional description...", required: false },
              { name: "sortOrder", label: "Sort Order", type: "number", placeholder: "Optional order...", required: false },
            ],
            values: editMediaLinkValues,
            onValuesChange: (field, value) => setEditMediaLinkValues({ ...editMediaLinkValues, [field]: value }),
            onSave: async () => {
              if (!editMediaLinkTarget) return;
              await updateMediaLinkMut.mutateAsync({
                mediaId: editMediaLinkTarget.id,
                caption: editMediaLinkValues.caption || null,
                sortOrder: editMediaLinkValues.sortOrder ? parseInt(editMediaLinkValues.sortOrder) : null,
              });
            },
            isPending: updateMediaLinkMut.isPending,
            errorMessage: updateMediaLinkMut.isError ? "Failed to update metadata." : undefined,
          }}
        />
      )}
    </div>
  ) : null;

  // Edit content - formulář pro editaci
  const editContent = (
    <>
      <EntryForm
        value={{ type, title, content, occurredAt }}
        onChange={(v) => {
          setType(v.type);
          setTitle(v.title);
          setContent(v.content);
          setOccurredAt(v.occurredAt);
        }}
        onSubmit={() => saveMut.mutate()}
        submitLabel={saveMut.isPending ? "Saving…" : "Save"}
        disabled={saveMut.isPending || Boolean(occurredAtInvalid)}
        errorText={
          saveMut.isError
            ? `Failed to save${saveMut.error instanceof Error ? `: ${saveMut.error.message}` : ""}`
            : null
        }
        occurredAtErrorText={occurredAtInvalid ? "Invalid date format" : null}
      />
      {deleteMut.isError && <div className="text-sm text-red-600 mt-2">Failed to delete.</div>}
    </>
  );

  return (
    <DetailPageLayout
      isLoading={q.isLoading}
      isError={q.isError}
      errorMessage="This entry may have been deleted or is no longer available."
      title={entryTitle}
      subtitle={entry?.id}
      backLink="/entries"
      backLabel="Back"
      isEditing={editMode}
      onEditChange={setEditMode}
      onSave={() => saveMut.mutate()}
      isSavePending={saveMut.isPending}
      saveError={saveMut.isError ? "Failed to save." : undefined}
      viewContent={viewContent}
      editContent={editContent}
      relationshipContent={relationshipContent}
      viewCard
      editCard
      editTitle="Edit entry"
      onDelete={() => deleteMut.mutate()}
      isDeletingPending={deleteMut.isPending}
      deleteConfirmOpen={confirmOpen}
      onDeleteConfirmOpenChange={setConfirmOpen}
      deleteConfirmTitle="Delete entry"
      deleteConfirmDescription={<>Are you sure you want to delete entry '{entryTitle}'? This action cannot be undone.</>}
    />
  );
}
