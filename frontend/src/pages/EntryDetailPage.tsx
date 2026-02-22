import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEntryDetail } from "@/api/entryRead";
import { deleteEntry, updateEntry } from "@/api/entries";
import { isoToDatetimeLocal, datetimeLocalToIso } from "@/lib/datetimeLocalConvert";
import { UI_LABELS, ENTITIES, ROUTES } from "@/lib/constants";
import { DetailPageLayout_new } from "@/components/layout/DetailPageLayout_new";
import { EntryForm_new } from "@/features/entries/EntryForm_new";
import { EntryView } from "@/features/entries/EntryView";
import { EntryRelationships } from "@/components/features/EntryRelationships";
import type { EntryFormValue } from "@/lib/types";
import { useState, useEffect } from "react";

export function EntryDetailPage() {
  const { id } = useParams();
  const entryId = id ?? "";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["entry", entryId],
    queryFn: () => getEntryDetail(entryId),
    enabled: !!entryId,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entries"] });
      navigate(ROUTES.ENTRIES);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EntryFormValue }) =>
      updateEntry(id, {
        type: data.type,
        title: data.title || null,
        content: data.content,
        occurredAt: datetimeLocalToIso(data.occurredAt),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entry", entryId] });
      qc.invalidateQueries({ queryKey: ["entries"] });
      setIsEditing(false);
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const [editFormValue, setEditFormValue] = useState<EntryFormValue>({
    type: "",
    title: "",
    content: "",
    occurredAt: "",
  });

  const handleDelete = () => {
    deleteMut.mutate(entryId);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMut.mutate({ id: entryId, data: editFormValue });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form value back to original data
    if (entry) {
      setEditFormValue({
        type: entry.type,
        title: entry.title || "",
        content: entry.content,
        occurredAt: isoToDatetimeLocal(entry.occurredAt),
      });
    }
  };

  const entry = q.data;

  // Sync edit form with entry data when entry loads
  useEffect(() => {
    if (entry) {
      setEditFormValue({
        type: entry.type,
        title: entry.title || "",
        content: entry.content,
        occurredAt: isoToDatetimeLocal(entry.occurredAt),
      });
    }
  }, [entry]);

  const viewContent = entry ? <EntryView entry={entry} /> : null;

  const editContent = entry ? (
    <EntryForm_new
      value={editFormValue}
      onChange={setEditFormValue}
      onSubmit={handleSave}
      submitLabel={UI_LABELS.SAVE}
      disabled={updateMut.isPending}
      errorText={updateMut.isError ? `${UI_LABELS.ERROR_UPDATING} ${ENTITIES.ENTRY.singular.toLowerCase()}` : null}
      showSubmitButton={false}
    />
  ) : null;

  const relationshipContent = entry ? <EntryRelationships entry={entry} /> : null;

  return (
    <DetailPageLayout_new
      isLoading={q.isLoading}
      isError={q.isError}
      errorMessage={`${UI_LABELS.ERROR_LOADING} ${ENTITIES.ENTRY.plural.toLowerCase()}`}
      title={entry?.title || UI_LABELS.NO_TITLE}
      id={entry?.id}
      backLink={ROUTES.ENTRIES}
      viewContent={viewContent}
      editContent={editContent}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={updateMut.isPending}
      isEditing={isEditing}
      onEditingChange={setIsEditing}
      relationshipContent={relationshipContent}
    />
  );
}