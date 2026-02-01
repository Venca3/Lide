import { useState, useEffect } from "react";
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

import { createTag, deleteTag, listTagsPaged, updateTag, type PagedResult, type TagDto } from "@/api/tags";
import { TagForm, type TagFormValue } from "@/featured/tags/TagForm";

const emptyTag: TagFormValue = {
  name: "",
};

export function TagsPage() {
  const qc = useQueryClient();

  const [filter, setFilter] = useState("");
  const debounced = useDebouncedValue(filter, 250);
  const [page, setPage] = useState(0);
  const size = 10;

  const [createOpen, setCreateOpen] = useState(false);
  const [newTag, setNewTag] = useState<TagFormValue>(emptyTag);

  const [editId, setEditId] = useState<string | null>(null);
  const [editTag, setEditTag] = useState<TagFormValue>(emptyTag);

  // reset page to 0 when debounced filter changes
  useEffect(() => {
    setPage(0);
  }, [debounced]);

  const tagsQ = useQuery({
    queryKey: ["tags", debounced, page, size],
    queryFn: () => listTagsPaged(debounced, page, size),
  });

  const createMut = useMutation({
    mutationFn: () => createTag(newTag.name),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
      setCreateOpen(false);
      setNewTag(emptyTag);
    },
  });

  const updateMut = useMutation({
    mutationFn: () => updateTag(editId!, editTag.name),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
      setEditId(null);
      setEditTag(emptyTag);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const data = tagsQ.data as PagedResult<TagDto> | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <Dialog
        open={Boolean(editId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditId(null);
            setEditTag(emptyTag);
          }
        }}
      >
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Rename tag</DialogTitle>
            <DialogDescription>Update the tag name.</DialogDescription>
          </DialogHeader>
          <TagForm
            value={editTag}
            onChange={setEditTag}
            onSubmit={() => updateMut.mutate()}
            submitLabel={updateMut.isPending ? "Saving…" : "Save"}
            disabled={updateMut.isPending}
            errorText={updateMut.isError ? "Failed to update tag." : null}
          />
        </DialogContent>
      </Dialog>
      <PagedListCard
        pageTitle="Tags"
        pageAction={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>New tag</Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Create tag</DialogTitle>
                <DialogDescription>Add a new tag to organize and categorize entries.</DialogDescription>
              </DialogHeader>
              <TagForm
                value={newTag}
                onChange={setNewTag}
                onSubmit={() => createMut.mutate()}
                submitLabel={createMut.isPending ? "Creating…" : "Create"}
                disabled={createMut.isPending}
                errorText={
                  createMut.isError ? "Failed to create tag (may already exist)." : null
                }
              />
            </DialogContent>
          </Dialog>
        }
        filter={filter}
        onFilterChange={setFilter}
        searchPlaceholder="Search tags..."
        isLoading={tagsQ.isLoading}
        isError={tagsQ.isError}
        errorText="Error loading tags."
        itemsLength={items.length}
        total={total}
        page={page}
        size={size}
        onPageChange={setPage}
        showPagination={Boolean(tagsQ.data)}
      >
        {items.map((t) => (
          <ListRow
            key={t.id}
            deleteAction={{
              label: t.name,
              onDelete: () => deleteMut.mutate(t.id),
              isDeleting: deleteMut.isPending,
              confirmTitle: "Delete tag",
              confirmDescription: (
                <>Are you sure you want to delete tag '{t.name}'?</>
              ),
            }}
            right={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditId(t.id);
                  setEditTag({ name: t.name });
                }}
              >
                Rename
              </Button>
            }
          >
            <div className="font-medium truncate">{t.name}</div>
          </ListRow>
        ))}
      </PagedListCard>
    </div>
  );
}
