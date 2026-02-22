import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedia } from "@/api/media";
import { deleteMedia, updateMedia } from "@/api/media";
import { isoToDatetimeLocal, datetimeLocalToIso } from "@/lib/datetimeLocalConvert";
import { UI_LABELS, ENTITIES, ROUTES } from "@/lib/constants";
import { DetailPageLayout_new } from "@/components/layout/DetailPageLayout_new";
import { MediaForm_new } from "@/features/media/MediaForm_new";
import { MediaView } from "@/features/media/MediaView";
import { MediaRelationships } from "@/components/features/MediaRelationships";
import { useState, useEffect } from "react";
import type { MediaFormValue } from "@/features/media/MediaForm";

export function MediaDetailPage() {
  const { id } = useParams();
  const mediaId = id ?? "";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["media", mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !!mediaId,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      navigate(ROUTES.MEDIA);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MediaFormValue }) =>
      updateMedia(id, {
        mediaType: data.mediaType,
        mimeType: data.mimeType || null,
        uri: data.uri,
        title: data.title || null,
        note: data.note || null,
        takenAt: datetimeLocalToIso(data.takenAt),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media", mediaId] });
      qc.invalidateQueries({ queryKey: ["media"] });
      setIsEditing(false);
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const [editFormValue, setEditFormValue] = useState<MediaFormValue>({
    mediaType: "",
    mimeType: "",
    uri: "",
    title: "",
    note: "",
    takenAt: "",
  });

  const handleDelete = () => {
    deleteMut.mutate(mediaId);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMut.mutate({ id: mediaId, data: editFormValue });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (media) {
      setEditFormValue({
        mediaType: media.mediaType || "",
        mimeType: media.mimeType || "",
        uri: media.uri || "",
        title: media.title || "",
        note: media.note || "",
        takenAt: isoToDatetimeLocal(media.takenAt),
      });
    }
  };

  const media = q.data;

  useEffect(() => {
    if (media) {
      setEditFormValue({
        mediaType: media.mediaType || "",
        mimeType: media.mimeType || "",
        uri: media.uri || "",
        title: media.title || "",
        note: media.note || "",
        takenAt: isoToDatetimeLocal(media.takenAt),
      });
    }
  }, [media]);

  const viewContent = media ? <MediaView media={media} /> : null;

  const relationshipContent = media ? <MediaRelationships mediaId={media.id} /> : null;

  const editContent = media ? (
    <MediaForm_new
      value={editFormValue}
      onChange={setEditFormValue}
      onSubmit={handleSave}
      submitLabel={UI_LABELS.SAVE}
      disabled={updateMut.isPending}
      errorText={updateMut.isError ? `${UI_LABELS.ERROR_UPDATING} ${ENTITIES.MEDIA.singular.toLowerCase()}` : null}
      takenAtErrorText={
        editFormValue.takenAt && !isNaN(Date.parse(editFormValue.takenAt))
          ? null
          : editFormValue.takenAt
            ? "Invalid date"
            : null
      }
      showSubmitButton={false}
    />
  ) : null;

  return (
    <DetailPageLayout_new
      isLoading={q.isLoading}
      isError={q.isError}
      errorMessage={`${UI_LABELS.ERROR_LOADING} ${ENTITIES.MEDIA.plural.toLowerCase()}`}
      title={media?.title || media?.uri || UI_LABELS.NO_TITLE}
      id={media?.id}
      backLink={ROUTES.MEDIA}
      viewContent={viewContent}
      editContent={editContent}
      relationshipContent={relationshipContent}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={updateMut.isPending}
      isEditing={isEditing}
      onEditingChange={setIsEditing}
    />
  );
}