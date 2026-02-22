import React, { useEffect, useMemo, useState } from "react";

import { UI_LABELS, ENTITIES } from "@/lib/constants";

type SearchSelectProps<T> = {
  items: T[];
  loading?: boolean;
  existingIds?: Set<string>;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  filterFn?: (item: T, query: string) => boolean;
  resource?: { singular: string; plural?: string };
  label?: string;
  placeholder?: string;
  selectedId?: string;
  onSelect: (id: string) => void;
  renderItem?: (item: T) => React.ReactNode;
  renderSecondary?: (item: T) => React.ReactNode;
  disabled?: boolean;
  resetKey?: any; // change to reset internal query
  emptyMessage?: string;
  maxHeight?: string;
};


export function SearchSelect<T>({
  items,
  loading,
  existingIds,
  getItemId,
  getItemLabel,
  filterFn,
  resource,
  label,
  placeholder,
  selectedId,
  onSelect,
  renderItem,
  renderSecondary,
  disabled,
  resetKey,
  emptyMessage,
  maxHeight = "12rem",
}: SearchSelectProps<T>) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    // reset query when resetKey changes
    setQuery("");
  }, [resetKey]);

  const lowerQuery = query.toLowerCase();

  const singularName = resource?.singular ?? (ENTITIES.ITEM && ENTITIES.ITEM.singular) ?? "Item";
  const pluralName = resource?.plural ?? (ENTITIES.ITEM && ENTITIES.ITEM.plural) ?? "Items";

  const effectiveLabel = label ?? `${UI_LABELS.SEARCH} ${singularName}`;
  const effectivePlaceholder = placeholder ?? `Search by ${singularName.toLowerCase()}...`;

  const effectiveEmptyMessage = emptyMessage ?? `No ${pluralName.toLowerCase()} found`;


  const filtered = useMemo(() => {
    return (items || []).filter((it) => {
      const id = getItemId(it);
      if (existingIds && existingIds.has(id)) return false;
      if (!query) return true;
      if (filterFn) return filterFn(it, query);
      return getItemLabel(it).toLowerCase().includes(lowerQuery);
    });
  }, [items, existingIds, filterFn, getItemId, getItemLabel, query, lowerQuery]);

  const selectedItem = useMemo(() => items.find((it) => getItemId(it) === selectedId), [items, selectedId, getItemId]);

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">{effectiveLabel}</label>
        <input
          className="w-full px-3 py-2 border border-input bg-background rounded-md"
          placeholder={effectivePlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
      </div>

      {loading && <div className="mt-2 text-sm text-muted-foreground">Loading...</div>}

      {!loading && filtered.length === 0 && (
        <div className="mt-2 text-sm text-muted-foreground">{effectiveEmptyMessage}</div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ maxHeight }} className="mt-2 space-y-1 overflow-y-auto rounded border p-2">
          {filtered.map((it) => (
            <button
              key={getItemId(it)}
              type="button"
              className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                selectedId === getItemId(it) ? "bg-muted font-medium" : ""
              }`}
              onClick={() => !disabled && onSelect(getItemId(it))}
              disabled={disabled}
            >
              {renderItem ? (
                renderItem(it)
              ) : (
                <>
                  <div>{getItemLabel(it)}</div>
                  {renderSecondary && <div className="text-xs text-muted-foreground">{renderSecondary(it)}</div>}
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="rounded border bg-muted/50 p-3">
          <div className="text-sm font-medium">Selected:</div>
          {renderItem ? (
            renderItem(selectedItem)
          ) : (
            <>
              <div>{getItemLabel(selectedItem)}</div>
              {renderSecondary && <div className="text-xs text-muted-foreground">{renderSecondary(selectedItem)}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchSelect;
