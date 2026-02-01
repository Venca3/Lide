import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { deleteMedia, getMedia, updateMedia } from "@/api/media";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { MediaForm } from "@/featured/media/MediaForm";

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

  const [mediaType, setMediaType] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [uri, setUri] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (q.data) {
      setMediaType(q.data.mediaType ?? "");
      setMimeType(q.data.mimeType ?? "");
      setUri(q.data.uri ?? "");
      setTitle(q.data.title ?? "");
      setNote(q.data.note ?? "");
      setTakenAt(q.data.takenAt ?? "");
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
      let isoDate: string | null = null;

      if (trimmedTakenAt) {
        try {
          isoDate = new Date(trimmedTakenAt).toISOString();
        } catch {
          throw new Error("Invalid date format");
        }
      }

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

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!mediaId) return <div>Missing ID in URL.</div>;

  const media = q.data;
  const mediaTitle = media?.title || media?.uri || "(no title)";

  // View content
  const viewContent = media ? (
    <Card>
      <CardContent className="space-y-4 pt-6">
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
          <div>{media.takenAt || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Note</div>
          <div className="whitespace-pre-wrap">{media.note || "-"}</div>
        </div>
      </CardContent>
    </Card>
  ) : null;

  // Edit content
  const editContent = (
    <Card>
      <CardHeader>
        <CardTitle>Edit media</CardTitle>
      </CardHeader>

      <CardContent>
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
      </CardContent>
    </Card>
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
    />
  );
}
