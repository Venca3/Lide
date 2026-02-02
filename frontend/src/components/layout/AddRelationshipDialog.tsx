import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogDescription } from "@/components/ui/dialog";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export interface AddRelationshipDialogProps<T> {
  invalidateQueryKey: string[];
  title?: string;
  buttonLabel?: string;
  placeholder?: string;
  resourceLabel?: string;
  resourceLabelPlural?: string;
  extraField?: {
    label: string;
    placeholder?: string;
    defaultValue: string;
  };
  queryKey: string[];
  queryFn: () => Promise<T[]>;
  filterFn: (item: T, q: string, extraValue?: string) => boolean;
  labelFn: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
  isItemFiltered: (item: T, existingSet: Set<string>, extraValue?: string) => boolean;
  onAddFn: (itemId: string, extraValue?: string) => Promise<void>;
  existing: string[];
  disabled?: boolean;
  errorMessage?: string;
}

export function AddRelationshipDialog<T>({
  invalidateQueryKey,
  title,
  buttonLabel,
  placeholder,
  resourceLabel,
  resourceLabelPlural,
  extraField,
  queryKey,
  queryFn,
  filterFn,
  labelFn,
  getItemId,
  isItemFiltered,
  onAddFn,
  existing,
  disabled,
  errorMessage = "Failed to add.",
}: AddRelationshipDialogProps<T>) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [extraValue, setExtraValue] = useState(extraField?.defaultValue ?? "");
  const debouncedQ = useDebouncedValue(q, 250);

  const derivedPlural = resourceLabelPlural ?? (resourceLabel ? `${resourceLabel}s` : undefined);
  const derivedTitle = title ?? (resourceLabel ? `Add ${resourceLabel}` : "Add item");
  const derivedButtonLabel = buttonLabel ?? derivedTitle;
  const derivedPlaceholder = placeholder ?? (derivedPlural ? `Search ${derivedPlural.toLowerCase()}…` : "Search…");

  const dataQuery = useQuery({
    queryKey: [...queryKey, debouncedQ],
    queryFn,
    enabled: open,
  });

  const addMut = useMutation({
    mutationFn: (itemId: string) => onAddFn(itemId, extraValue),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: invalidateQueryKey });
      setOpen(false);
      setQ("");
      if (extraField) setExtraValue(extraField.defaultValue);
    },
  });

  const existingSet = new Set(existing);
  const filtered = (dataQuery.data ?? []).filter((item: T) => {
    const matchesSearch = filterFn(item, debouncedQ, extraValue);
    const alreadyExists = isItemFiltered(item, existingSet, extraValue);
    return matchesSearch && !alreadyExists;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          {derivedButtonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>{derivedTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {derivedTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {extraField && (
            <Input
              placeholder={extraField.placeholder}
              value={extraValue}
              onChange={(e) => setExtraValue(e.target.value)}
            />
          )}

          <Input
            placeholder={derivedPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {dataQuery.isLoading && <div className="text-sm">Loading…</div>}
          {dataQuery.isError && (
            <div className="text-sm text-red-600">Error loading items.</div>
          )}

          {dataQuery.data && (
            <div className="max-h-72 overflow-auto space-y-2">
              {filtered.map((item: T) => (
                <Button
                  key={getItemId(item)}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={addMut.isPending}
                  onClick={() => addMut.mutate(getItemId(item))}
                >
                  {labelFn(item)}
                </Button>
              ))}

              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground">No items found</div>
              )}
            </div>
          )}

          {addMut.isError && (
            <div className="text-sm text-red-600">
              {errorMessage}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
