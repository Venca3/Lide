import { useEffect, useState } from "react";
import type { PagedResult, EntryDto } from "../api/entries";
import { useNavigate } from "react-router-dom";
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

import { createEntry, deleteEntry, listEntriesPaged } from "../api/entries";
import { PagedListCard } from "@/components/layout/PagedListCard";
import { ListRow } from "@/components/layout/ListRow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export function EntriesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");
  const debounced = useDebouncedValue(filter, 250);
  const [page, setPage] = useState(0);
  const size = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [type, setType] = useState("MEMORY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [occurredAt, setOccurredAt] = useState("");

  // reset page to 0 when debounced filter changes
  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const q = useQuery({
    queryKey: ["entries", debounced, page, size],
    queryFn: () => listEntriesPaged(debounced, page, size),
  });

  const createMut = useMutation({
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

      return createEntry({
        type: type.trim(),
        title: title.trim() || null,
        content: content.trim(),
        occurredAt: isoDate,
        entryTags: [],
        personEntries: [],
        mediaEntries: [],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
      setCreateOpen(false);
      setType("MEMORY");
      setTitle("");
      setContent("");
      setOccurredAt("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  const data = q.data as PagedResult<EntryDto> | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const filtered = items;

  const isValidDateString = (str: string) => {
    if (!str.trim()) return true; // optional
    try {
      new Date(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <PagedListCard
        pageTitle="Entries"
        pageAction={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>New entry</Button>
            </DialogTrigger>

            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Create entry</DialogTitle>
                <DialogDescription>Add a new entry to document events and memories.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <Input 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    placeholder="e.g. MEMORY, NOTE, EVENT" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Content *</label>
                  <textarea
                    className="min-h-28 w-full rounded-md border bg-transparent p-3 text-sm"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Main content (required)"
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
                  <label className="text-sm font-medium">Occurred at</label>
                  <Input
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                    placeholder="Optional, e.g. 1989-08-11 or 1989-08-11T16:30:00Z"
                    type="datetime-local"
                  />
                  {occurredAt && !isValidDateString(occurredAt) && (
                    <div className="text-xs text-red-600 mt-1">Invalid date format</div>
                  )}
                </div>

                <Button 
                  disabled={
                    !type.trim() || 
                    !content.trim() || 
                    !isValidDateString(occurredAt) ||
                    createMut.isPending
                  } 
                  onClick={() => createMut.mutate()}
                >
                  {createMut.isPending ? "Creating…" : "Create"}
                </Button>

                {createMut.isError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Failed to create entry
                    {createMut.error instanceof Error ? `: ${createMut.error.message}` : ""}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        }
        filter={filter}
        onFilterChange={setFilter}
        isLoading={q.isLoading}
        isError={q.isError}
        itemsLength={filtered.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={Boolean(q.data)}
      >
        {filtered.map((e: EntryDto) => (
          <ListRow
            key={e.id}
            hoverHint="View details"
            onClick={() => navigate(`/entries/${e.id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(`/entries/${e.id}`);
              }
            }}
            deleteAction={{
              label: e.title || "(no title)",
              onDelete: () => deleteMut.mutate(e.id),
              isDeleting: deleteMut.isPending,
              confirmTitle: "Delete entry",
              confirmDescription: (
                <>Are you sure you want to delete entry '{e.title || "(no title)"}'?</>
              ),
            }}
          >
            <div className="font-medium group-hover:underline">
              {e.title || "(no title)"}
            </div>
            <div className="text-xs text-muted-foreground">
              {e.type}
              {e.occurredAt ? ` • ${e.occurredAt}` : ""}
            </div>
          </ListRow>
        ))}
      </PagedListCard>
    </div>
  );
}
