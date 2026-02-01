import { useEffect, useState } from "react";
import type { PagedResult, EntryDto } from "../api/entries";
import { useNavigate } from "react-router-dom";
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

import { createEntry, deleteEntry, listEntriesPaged } from "../api/entries";
import { PagedListCard } from "@/components/layout/PagedListCard";
import { ListRow } from "@/components/layout/ListRow";
import { formatDateTime } from "@/lib/dateFormat";
import { datetimeLocalToIso } from "@/lib/datetimeLocalConvert";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { EntryForm, type EntryFormValue } from "@/featured/entries/EntryForm";

const empty: EntryFormValue = {
  type: "MEMORY",
  title: "",
  content: "",
  occurredAt: "",
};

export function EntriesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");
  const debounced = useDebouncedValue(filter, 250);
  const [page, setPage] = useState(0);
  const size = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [v, setV] = useState<EntryFormValue>(empty);

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
      const trimmedOccurredAt = v.occurredAt.trim();
      const isoDate = datetimeLocalToIso(trimmedOccurredAt);

      return createEntry({
        type: v.type.trim(),
        title: v.title.trim() || null,
        content: v.content.trim(),
        occurredAt: isoDate,
        entryTags: [],
        personEntries: [],
        mediaEntries: [],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
      setCreateOpen(false);
      setV(empty);
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

  const occurredAtInvalid = v.occurredAt && !isValidDateString(v.occurredAt);

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

              <EntryForm
                value={v}
                onChange={setV}
                onSubmit={() => createMut.mutate()}
                submitLabel={createMut.isPending ? "Creating…" : "Create"}
                disabled={createMut.isPending || Boolean(occurredAtInvalid)}
                errorText={
                  createMut.isError
                    ? `Failed to create entry${createMut.error instanceof Error ? `: ${createMut.error.message}` : ""}`
                    : null
                }
                occurredAtErrorText={occurredAtInvalid ? "Invalid date format" : null}
              />
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
              {e.occurredAt ? ` • ${formatDateTime(e.occurredAt)}` : ""}
            </div>
          </ListRow>
        ))}
      </PagedListCard>
    </div>
  );
}
