import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RelationshipCard } from "@/components/layout/RelationshipCard";

import { deleteMedia, getMedia, updateMedia } from "@/api/media";
import { listEntries } from "@/api/entries";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { MediaForm } from "@/featured/media/MediaForm";
import { formatDateTime } from "@/lib/dateFormat";
import { isoToDatetimeLocal, datetimeLocalToIso } from "@/lib/datetimeLocalConvert";
import { addMediaToEntry, removeMediaFromEntry, updateMediaEntryLink, listEntriesForMedia } from "@/api/mediaEntry";

export function MediaDetailPage() {
  const { id } = useParams();
  const mediaId = id ?? "";
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["media", mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !!mediaId,
  });

  const entriesQ = useQuery({
    queryKey: ["mediaentry", "entries-for-media", mediaId],
    queryFn: () => listEntriesForMedia(mediaId),
    enabled: !!mediaId,
  });

  const [mediaType, setMediaType] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [uri, setUri] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [entryConfirmOpen, setEntryConfirmOpen] = useState(false);
  const [entryConfirmTarget, setEntryConfirmTarget] = useState<{ id: string; label: string } | null>(null);
  const [editEntryLinkOpen, setEditEntryLinkOpen] = useState(false);
  const [editEntryLinkTarget, setEditEntryLinkTarget] = useState<{ id: string; title: string; caption: string | null; sortOrder: number | null } | null>(null);
  const [editEntryLinkValues, setEditEntryLinkValues] = useState({ caption: "", sortOrder: "" });

  useEffect(() => {
    if (q.data) {
      setMediaType(q.data.mediaType ?? "");
      setMimeType(q.data.mimeType ?? "");
      setUri(q.data.uri ?? "");
      setTitle(q.data.title ?? "");
      setNote(q.data.note ?? "");
      setTakenAt(isoToDatetimeLocal(q.data.takenAt));
    }
  }, [q.data]);

  const isValidDateString = (str: string) => {
    if (!str.trim()) return true; // optional
    try {
      new Date(str);
      return true;
    } catch {
      return false;
    }
  };

  const takenAtInvalid = takenAt && !isValidDateString(takenAt);

  const saveMut = useMutation({
    mutationFn: () => {
      const trimmedTakenAt = takenAt.trim();
      const isoDate = datetimeLocalToIso(trimmedTakenAt);

      const trimmedType = mediaType.trim();
      const trimmedUri = uri.trim();

      if (!trimmedType) throw new Error("Media type is required");
      if (!trimmedUri) throw new Error("URI is required");

      return updateMedia(mediaId, {
        mediaType: trimmedType,
        mimeType: mimeType.trim() || null,
        uri: trimmedUri,
        title: title.trim() || null,
        note: note.trim() || null,
        takenAt: isoDate,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media", mediaId] });
      await qc.invalidateQueries({ queryKey: ["media"] });
      setEditMode(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteMedia(mediaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media"] });
      nav("/media");
    },
  });

  const addEntryMut = useMutation({
    mutationFn: (entryId: string) => addMediaToEntry(entryId, mediaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media", mediaId] });
    },
  });

  const updateEntryLinkMut = useMutation({
    mutationFn: ({ entryId, caption, sortOrder }: { entryId: string; caption: string | null; sortOrder: number | null }) =>
      updateMediaEntryLink(entryId, mediaId, { caption, sortOrder }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media", mediaId] });
      setEditEntryLinkOpen(false);
      setEditEntryLinkTarget(null);
    },
  });

  const removeEntryMut = useMutation({
    mutationFn: (entryId: string) => removeMediaFromEntry(entryId, mediaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media", mediaId] });
      setEntryConfirmOpen(false);
      setEntryConfirmTarget(null);
    },
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!mediaId) return <div>Missing ID in URL.</div>;

  const media = q.data;
  const mediaTitle = media?.title || media?.uri || "(no title)";

  // View content
  const viewContent = media ? (
    <>
      <div>
        <div className="text-sm text-muted-foreground">Media type</div>
        <div>{media.mediaType || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">URI</div>
        <div className="break-all">{media.uri || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">MIME type</div>
        <div>{media.mimeType || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Title</div>
        <div>{media.title || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Taken at</div>
        <div>{formatDateTime(media.takenAt) || "-"}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Note</div>
        <div className="whitespace-pre-wrap">{media.note || "-"}</div>
      </div>
    </>
  ) : null;

  // Relationship content - vazby
  const relationshipContent = media ? (
    <div className="space-y-6">
      {entriesQ.data && (
        <RelationshipCard
          title="Entries"
          resource={{ singular: "Entry", plural: "Entries" }}
          addDialogProps={{
            invalidateQueryKey: ["mediaentry", "entries-for-media", mediaId],
            queryKey: ["entries"],
            queryFn: listEntries,
            filterFn: (entry, q) => {
              const lowerQ = q.toLowerCase();
              return (
                (entry.title ?? "").toLowerCase().includes(lowerQ) ||
                entry.type.toLowerCase().includes(lowerQ) ||
                entry.content.toLowerCase().includes(lowerQ)
              );
            },
            labelFn: (entry) => (
              <>
                <span className="mr-2 text-muted-foreground">{entry.type}</span>
                {entry.title || "(no title)"}
              </>
            ),
            getItemId: (entry) => entry.id,
            isItemFiltered: (entry, existingSet) => existingSet.has(entry.id),
            onAddFn: (entryId) => addEntryMut.mutateAsync(entryId).then(() => {}),
            existing: entriesQ.data.map((e) => e.entryId),
            disabled: entriesQ.isLoading,
            errorMessage: "Failed to add entry.",
          }}
          isEmpty={entriesQ.data.length === 0}
          error={removeEntryMut.isError ? "Failed to remove entry." : undefined}
          confirm={{
            open: entryConfirmOpen,
            onOpenChange: setEntryConfirmOpen,
            title: "Remove entry",
            description: entryConfirmTarget
              ? `Do you want to remove '${entryConfirmTarget.label}' from this media?`
              : "Do you want to remove this entry from this media?",
            isConfirming: removeEntryMut.isPending,
            onConfirm: () => {
              if (!entryConfirmTarget) return;
              removeEntryMut.mutate(entryConfirmTarget.id);
              setEntryConfirmTarget(null);
            },
          }}
          items={entriesQ.data}
          renderItem={(e) => (
            <>
              <div className="font-medium">{e.title || "(no title)"}</div>
              <div className="text-muted-foreground">
                {e.type}
                {e.caption && ` • Caption: ${e.caption}`}
                {e.sortOrder != null && ` • Order: ${e.sortOrder}`}
              </div>
            </>
          )}
          onEditItem={(e) => {
            setEditEntryLinkTarget({
              id: e.entryId,
              title: e.title || "(no title)",
              caption: e.caption ?? null,
              sortOrder: e.sortOrder ?? null,
            });
            setEditEntryLinkValues({ caption: e.caption || "", sortOrder: (e.sortOrder ?? "").toString() });
            setEditEntryLinkOpen(true);
          }}
          onRemoveItem={(e) => {
            setEntryConfirmTarget({ id: e.entryId, label: e.title || "(no title)" });
            setEntryConfirmOpen(true);
          }}
          editItemDisabled={() => updateEntryLinkMut.isPending || removeEntryMut.isPending}
          removeItemDisabled={() => removeEntryMut.isPending}
          editDialog={{
            open: editEntryLinkOpen,
            onOpenChange: setEditEntryLinkOpen,
            title: "Edit Metadata",
            description: `Update the metadata for "${editEntryLinkTarget?.title}"`,
            fields: [
              { name: "caption", label: "Caption", placeholder: "Optional description...", required: false },
              { name: "sortOrder", label: "Sort Order", type: "number", placeholder: "Optional order...", required: false },
            ],
            values: editEntryLinkValues,
            onValuesChange: (field, value) => setEditEntryLinkValues({ ...editEntryLinkValues, [field]: value }),
            onSave: async () => {
              if (!editEntryLinkTarget) return;
              await updateEntryLinkMut.mutateAsync({
                entryId: editEntryLinkTarget.id,
                caption: editEntryLinkValues.caption || null,
                sortOrder: editEntryLinkValues.sortOrder ? parseInt(editEntryLinkValues.sortOrder) : null,
              });
            },
            isPending: updateEntryLinkMut.isPending,
            errorMessage: updateEntryLinkMut.isError ? "Failed to update metadata." : undefined,
          }}
        />
      )}
    </div>
  ) : null;

  // Edit content
  const editContent = (
    <>
      <MediaForm
        value={{ mediaType, mimeType, uri, title, note, takenAt }}
        onChange={(v) => {
          setMediaType(v.mediaType);
          setMimeType(v.mimeType);
          setUri(v.uri);
          setTitle(v.title);
          setNote(v.note);
          setTakenAt(v.takenAt);
        }}
        onSubmit={() => saveMut.mutate()}
        submitLabel={saveMut.isPending ? "Saving…" : "Save"}
        disabled={saveMut.isPending || Boolean(takenAtInvalid)}
        errorText={
          saveMut.isError
            ? `Failed to save${saveMut.error instanceof Error ? `: ${saveMut.error.message}` : ""}`
            : null
        }
        takenAtErrorText={takenAtInvalid ? "Invalid date format" : null}
      />
      {deleteMut.isError && <div className="text-sm text-red-600 mt-2">Failed to delete.</div>}
    </>
  );

  return (
    <DetailPageLayout
      isLoading={q.isLoading}
      isError={q.isError}
      errorMessage="This media may have been deleted or is no longer available."
      title={mediaTitle}
      subtitle={media?.id}
      backLink="/media"
      backLabel="Back"
      isEditing={editMode}
      onEditChange={setEditMode}
      onSave={() => saveMut.mutate()}
      isSavePending={saveMut.isPending}
      saveError={saveMut.isError ? "Failed to save media." : undefined}
      onDelete={() => deleteMut.mutate()}
      isDeletingPending={deleteMut.isPending}
      deleteConfirmOpen={deleteConfirmOpen}
      onDeleteConfirmOpenChange={setDeleteConfirmOpen}
      deleteConfirmTitle="Delete media"
      deleteConfirmDescription={`Are you sure you want to delete media '${mediaTitle}'?`}
      viewContent={viewContent}
      editContent={editContent}
      relationshipContent={relationshipContent}
      viewCard
      editCard
      editTitle="Edit media"
    />
  );
}
