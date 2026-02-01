import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { PagedListCard } from "@/components/layout/PagedListCard";
import { ListRow } from "@/components/layout/ListRow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useNavigate } from "react-router-dom";

import { createMedia, deleteMedia, listMediaPaged, type MediaDto, type PagedResult } from "@/api/media";
import { MediaForm, type MediaFormValue } from "@/featured/media/MediaForm";
import { formatDateTime } from "@/lib/dateFormat";
import { datetimeLocalToIso } from "@/lib/datetimeLocalConvert";

const empty: MediaFormValue = {
  mediaType: "PHOTO",
  mimeType: "",
  uri: "",
  title: "",
  note: "",
  takenAt: "",
};

export function MediaPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");
  const debounced = useDebouncedValue(filter, 250);
  const [page, setPage] = useState(0);
  const size = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [v, setV] = useState<MediaFormValue>(empty);

  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const q = useQuery({
    queryKey: ["media", debounced, page, size],
    queryFn: () => listMediaPaged(debounced, page, size),
  });

  const isValidDateString = (str: string) => {
    if (!str.trim()) return true; // optional
    try {
      new Date(str);
      return true;
    } catch {
      return false;
    }
  };

  const createMut = useMutation({
    mutationFn: () => {
      const trimmedTakenAt = v.takenAt.trim();
      const isoDate = datetimeLocalToIso(trimmedTakenAt);

      return createMedia({
        mediaType: v.mediaType.trim(),
        mimeType: v.mimeType.trim() || null,
        uri: v.uri.trim(),
        title: v.title.trim() || null,
        note: v.note.trim() || null,
        takenAt: isoDate,
        mediaEntries: [],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media"] });
      setCreateOpen(false);
      setV(empty);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media"] });
    },
  });

  const data = q.data as PagedResult<MediaDto> | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const takenAtInvalid = v.takenAt && !isValidDateString(v.takenAt);

  return (
    <div className="space-y-4">
      <PagedListCard
        pageTitle="Media"
        pageAction={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>New media</Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Create media</DialogTitle>
                <DialogDescription>Add a new media item (photo, video, doc).</DialogDescription>
              </DialogHeader>

              <MediaForm
                value={v}
                onChange={setV}
                onSubmit={() => createMut.mutate()}
                submitLabel={createMut.isPending ? "Creating…" : "Create"}
                disabled={createMut.isPending || Boolean(takenAtInvalid)}
                errorText={
                  createMut.isError
                    ? `Failed to create media${createMut.error instanceof Error ? `: ${createMut.error.message}` : ""}`
                    : null
                }
                takenAtErrorText={takenAtInvalid ? "Invalid date format" : null}
              />
            </DialogContent>
          </Dialog>
        }
        filter={filter}
        onFilterChange={setFilter}
        searchPlaceholder="Search media..."
        isLoading={q.isLoading}
        isError={q.isError}
        errorText="Error loading media."
        itemsLength={items.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={Boolean(q.data)}
      >
        {items.map((m) => {
          const titleOrUri = m.title || m.uri;
          const details = [m.mediaType, m.mimeType, formatDateTime(m.takenAt)].filter(Boolean).join(" • ");

          return (
            <ListRow
              key={m.id}
              hoverHint="View details"
              onClick={() => navigate(`/media/${m.id}`)}
              deleteAction={{
                label: titleOrUri,
                onDelete: () => deleteMut.mutate(m.id),
                isDeleting: deleteMut.isPending,
                confirmTitle: "Delete media",
                confirmDescription: (
                  <>Are you sure you want to delete media '{titleOrUri}'?</>
                ),
              }}
            >
              <div className="font-medium truncate">{titleOrUri}</div>
              {details && (
                <div className="text-xs text-muted-foreground">{details}</div>
              )}
            </ListRow>
          );
        })}
      </PagedListCard>
    </div>
  );
}
