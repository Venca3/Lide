import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { createMedia, deleteMedia, listMediaPaged, type MediaDto, type PagedResult } from "@/api/media";

export function MediaPage() {
  const qc = useQueryClient();

  const [filter, setFilter] = useState("");
  const debounced = useDebouncedValue(filter, 250);
  const [page, setPage] = useState(0);
  const size = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [mediaType, setMediaType] = useState("PHOTO");
  const [mimeType, setMimeType] = useState("");
  const [uri, setUri] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [takenAt, setTakenAt] = useState("");

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
      const trimmedTakenAt = takenAt.trim();
      let isoDate: string | null = null;

      if (trimmedTakenAt) {
        try {
          isoDate = new Date(trimmedTakenAt).toISOString();
        } catch {
          throw new Error("Invalid date format");
        }
      }

      return createMedia({
        mediaType: mediaType.trim(),
        mimeType: mimeType.trim() || null,
        uri: uri.trim(),
        title: title.trim() || null,
        note: note.trim() || null,
        takenAt: isoDate,
        mediaEntries: [],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media"] });
      setCreateOpen(false);
      setMediaType("PHOTO");
      setMimeType("");
      setUri("");
      setTitle("");
      setNote("");
      setTakenAt("");
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

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Media type *</label>
                  <Input
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    placeholder="e.g. PHOTO, VIDEO, DOC"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">URI *</label>
                  <Input
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    placeholder="/path/to/file or URL"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">MIME type</label>
                  <Input
                    value={mimeType}
                    onChange={(e) => setMimeType(e.target.value)}
                    placeholder="image/jpeg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Optional title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Taken at</label>
                  <Input
                    value={takenAt}
                    onChange={(e) => setTakenAt(e.target.value)}
                    placeholder="Optional, e.g. 1989-08-11T16:30"
                    type="datetime-local"
                  />
                  {takenAt && !isValidDateString(takenAt) && (
                    <div className="text-xs text-red-600 mt-1">Invalid date format</div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Note</label>
                  <textarea
                    className="min-h-24 w-full rounded-md border bg-transparent p-3 text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note"
                  />
                </div>

                <Button
                  disabled={
                    !mediaType.trim() ||
                    !uri.trim() ||
                    !isValidDateString(takenAt) ||
                    createMut.isPending
                  }
                  onClick={() => createMut.mutate()}
                >
                  {createMut.isPending ? "Creating…" : "Create"}
                </Button>

                {createMut.isError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Failed to create media
                    {createMut.error instanceof Error ? `: ${createMut.error.message}` : ""}
                  </div>
                )}
              </div>
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
          const details = [m.mediaType, m.mimeType, m.takenAt].filter(Boolean).join(" • ");

          return (
            <ListRow
              key={m.id}
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
