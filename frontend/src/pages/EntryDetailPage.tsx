import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { deleteEntry, updateEntry } from "../api/entries";
import { getEntryDetail } from "../api/entryRead";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { getPersonDisplayName } from "@/lib/person";
import { EntryForm } from "@/featured/entries/EntryForm";

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

  useEffect(() => {
    if (q.data) {
      setType(q.data.type ?? "");
      setTitle(q.data.title ?? "");
      setOccurredAt(q.data.occurredAt ?? "");
      setContent(q.data.content ?? "");
    }
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: () => {
      const trimmedOccurredAt = occurredAt.trim();
      let isoDate: string | null = null;
      
      if (trimmedOccurredAt) {
        try {
          isoDate = new Date(trimmedOccurredAt).toISOString();
        } catch {
          throw new Error("Invalid date format");
        }
      }

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
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
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
            <div>{entry.occurredAt || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Content</div>
            <div className="whitespace-pre-wrap">{entry.content || "-"}</div>
          </div>
        </CardContent>
      </Card>

      {entry.tags && entry.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entry.persons && entry.persons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entry.persons.map((p) => (
                <div key={p.personId} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {getPersonDisplayName({ 
                        firstName: p.firstName, 
                        lastName: p.lastName, 
                        nickname: p.nickname 
                      })}
                    </div>
                    {p.role && (
                      <div className="text-sm text-muted-foreground">Role: {p.role}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entry.media && entry.media.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entry.media.map((m) => (
                <div key={m.mediaId} className="border rounded p-2">
                  <div className="font-medium">{m.title || m.uri}</div>
                  <div className="text-sm text-muted-foreground">
                    Type: {m.mediaType}
                    {m.caption && ` • ${m.caption}`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  ) : null;

  // Edit content - formulář pro editaci
  const editContent = (
    <Card>
      <CardHeader>
        <CardTitle>Edit entry</CardTitle>
      </CardHeader>

      <CardContent>
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
      </CardContent>
    </Card>
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
      onDelete={() => deleteMut.mutate()}
      isDeletingPending={deleteMut.isPending}
      deleteConfirmOpen={confirmOpen}
      onDeleteConfirmOpenChange={setConfirmOpen}
      deleteConfirmTitle="Delete entry"
      deleteConfirmDescription={<>Are you sure you want to delete entry '{entryTitle}'? This action cannot be undone.</>}
    />
  );
}
