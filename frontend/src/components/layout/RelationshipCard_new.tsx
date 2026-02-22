import type { ReactNode } from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { TagItem } from "@/components/layout/TagItem";
import { UI_LABELS } from "@/lib/constants";

interface RelationshipCardNewProps {
  resource?: {
    singular: string;
    plural?: string;
  };
  isEmpty?: boolean;
  items?: any[];
  renderItem?: (item: any) => ReactNode;
  displayName?: (item: any) => string;

  title?: ReactNode;
  emptyMessage?: string;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onRemove?: (item: any) => void;
  onSave?: () => boolean | void;
  onCancel?: () => void;
  onAddSave?: () => boolean | void;
  onAddCancel?: () => void;
  itemVariant?: "default" | "chip";
  isEditing?: boolean;
  isSaving?: boolean;
  editContent?: ReactNode;
  addContent?: ReactNode;
}

export function RelationshipCard_new({
  resource,
  isEmpty,
  items,
  renderItem,
  displayName,
  title,
  emptyMessage,
  onAdd,
  onEdit,
  onRemove,
  onSave,
  onCancel,
  onAddSave,
  onAddCancel,
  isSaving,
  editContent,
  addContent,
  itemVariant = "default",
}: RelationshipCardNewProps) {
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<any>(null);
  const [editConfirmOpen, setEditConfirmOpenInternal] = useState(false);
  const setEditConfirmOpen = (open: boolean) => {
    setEditConfirmOpenInternal(open);
    if (!open && onCancel) {
      onCancel();
    }
  };

  const [addConfirmOpen, setAddConfirmOpenInternal] = useState(false);
  const setAddConfirmOpen = (open: boolean) => {
    setAddConfirmOpenInternal(open);
    if (!open && onAddCancel) {
      onAddCancel();
    }
  };

  const resolvedTitle = title ?? (resource?.plural ?? resource?.singular ?? "Items");
  const resolvedEmptyMessage =
    emptyMessage ?? (resource?.plural ? `No ${resource.plural.toLowerCase()}` : "None");

  const content = items && renderItem ? (
    itemVariant === "chip" ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item: any, idx: number) => (
          <TagItem
            key={item?.id ?? idx}
            label={displayName ? displayName(item) : renderItem(item)}
            onRemove={() => {
              setItemToRemove(item);
              setRemoveConfirmOpen(true);
            }}
            disabled={isSaving}
          />
        ))}
      </div>
    ) : (
      items.map((item: any, idx: number) => (
        <div key={item?.id ?? idx} className="flex items-start justify-between gap-4">
          <div className="min-w-0">{renderItem(item)}</div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                onClick={() => {
                  onEdit(item);
                  setEditConfirmOpen(true);
                }}
              >
                {UI_LABELS.EDIT}
              </Button>
            )}
            {onRemove && (
              <Button
                variant="destructive"
                onClick={() => {
                  setItemToRemove(item);
                  setRemoveConfirmOpen(true);
                }}
              >
                {UI_LABELS.REMOVE}
              </Button>
            )}
          </div>
        </div>
      ))
    )
  ) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{resolvedTitle}</CardTitle>
        {onAdd && (
          <Button onClick={() => setAddConfirmOpen(true)}>
            {UI_LABELS.ADD} {resource?.singular || "Item"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {isEmpty && <div className="text-sm text-muted-foreground">{resolvedEmptyMessage}</div>}
        {content && <div className="space-y-2 text-sm">{content}</div>}
      </CardContent>

      {onRemove && (
        <ConfirmDialog
          open={removeConfirmOpen}
          onOpenChange={setRemoveConfirmOpen}
          title={UI_LABELS.REMOVE}
          description={`${UI_LABELS.DELETE_CONFIRM_PREFIX} ${itemToRemove ? (displayName ? displayName(itemToRemove) : (itemToRemove.name || itemToRemove.title || 'this item')) : ''}${UI_LABELS.DELETE_CONFIRM_SUFFIX}`}
          confirmLabel={UI_LABELS.REMOVE}
          confirmVariant="destructive"
          onConfirm={() => {
            if (itemToRemove) {
              onRemove(itemToRemove);
              setItemToRemove(null);
            }
            setRemoveConfirmOpen(false);
          }}
        />
      )}

      {onAdd && addContent && (
        <ConfirmDialog
          open={addConfirmOpen}
          onOpenChange={setAddConfirmOpen}
          title={`Add ${resource?.singular || 'Item'}`}
          description={`Add a new ${resource?.singular?.toLowerCase() || 'item'} to this list.`}
          confirmLabel={UI_LABELS.ADD}
          onConfirm={() => {
            return onAddSave?.() ?? true;
          }}
        >
          {addContent}
        </ConfirmDialog>
      )}

      {onEdit && editContent && (
        <ConfirmDialog
          open={editConfirmOpen}
          onOpenChange={setEditConfirmOpen}
          title={UI_LABELS.EDIT}
          description={`Edit the selected ${resource?.singular?.toLowerCase() || 'item'}.`}
          confirmLabel={UI_LABELS.SAVE}
          cancelLabel={UI_LABELS.CANCEL}
          isConfirming={isSaving}
          onConfirm={() => {
            return onSave?.() ?? true;
          }}
        >
          {editContent}
        </ConfirmDialog>
      )}
    </Card>
  );
}