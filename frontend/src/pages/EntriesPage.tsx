import { useEffect, useState } from "react";
import type { PagedResult, EntryDto } from "../api/entries";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteEntry, listEntriesPaged, createEntry } from "../api/entries";
import { PagedListCard_new } from "@/components/layout/PagedListCard_new";
import { formatDateTime } from "@/lib/dateFormat";
import { ENTITIES, ROUTES, UI_LABELS } from "@/lib/constants";
import { ListRow_new } from "@/components/layout/ListRow_new";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { EntryFormValue } from "@/lib/types";
import { EntryForm_new } from "@/features/entries/EntryForm_new";

export function EntriesPage() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;
  const navigate = useNavigate();
  const debounced = useDebouncedValue(filter, 250);
  const qc = useQueryClient();

  const [createForm, setCreateForm] = useState<EntryFormValue>({
    type: "",
    title: "",
    content: "",
    occurredAt: "",
  });

  // reset page to 0 when debounced filter changes
  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const q = useQuery({
    queryKey: ["entries", debounced, page, size],
    queryFn: () => listEntriesPaged(debounced, page, size),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  const createMut = useMutation({
    mutationFn: (data: { type: string; title?: string; content: string; occurredAt?: string }) =>
      createEntry({
        type: data.type,
        title: data.title || null,
        content: data.content,
        occurredAt: data.occurredAt || null,
        entryTags: [],
        personEntries: [],
        mediaEntries: [],
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["entries"] });
      setCreateForm({ type: "", title: "", content: "", occurredAt: "" });
    },
  });

  const handleCreateSubmit = () => {
    createMut.mutate(createForm);
  };

  const createFormContent = (
    <EntryForm_new
      value={createForm}
      onChange={setCreateForm}
      onSubmit={handleCreateSubmit}
      submitLabel={UI_LABELS.CREATE}
      disabled={createMut.isPending}
    />
  );

  const data = q.data as PagedResult<EntryDto> | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const filtered = items;

  return (
    <div className="space-y-4">
      <PagedListCard_new
        resources={ENTITIES.ENTRY}
        addDialogContent={createFormContent}
        filter={filter}
        onFilterChange={setFilter}
        itemsLength={filtered.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={true}
        isLoading={q.isLoading}
        isError={q.isError}
      >
        {filtered.map((entry: EntryDto) => (
          <ListRow_new
            resources={ENTITIES.ENTRY}
            key={entry.id}
            onClick={() => navigate(`${ROUTES.ENTRIES}/${entry.id}`)}
            onDelete={() => deleteMut.mutate(entry.id)}
            deleteTitle={entry.title || UI_LABELS.NO_TITLE}
            isDeleting={deleteMut.isPending}
          >
            <div className="font-medium group-hover:underline">
              {entry.title || UI_LABELS.NO_TITLE}
            </div>
            <div className="text-xs text-muted-foreground">
              {entry.type}
              {entry.occurredAt ? ` • ${formatDateTime(entry.occurredAt)}` : ""}
            </div>
          </ListRow_new>
        ))}
      </PagedListCard_new>
    </div>
  );
}