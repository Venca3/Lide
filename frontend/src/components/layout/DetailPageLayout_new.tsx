import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { UI_LABELS } from "@/lib/constants";

type DetailPageLayoutNewProps = {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  title: ReactNode;
  id?: string;
  backLink: string;
  viewContent?: ReactNode;
  editContent?: ReactNode;
  relationshipContent?: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
};

export function DetailPageLayout_new({
  isLoading,
  isError,
  errorMessage,
  title,
  id,
  backLink,
  viewContent,
  editContent,
  relationshipContent,
  onDelete,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  isEditing: controlledIsEditing,
  onEditingChange,
}: DetailPageLayoutNewProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = controlledIsEditing !== undefined ? controlledIsEditing : internalIsEditing;
  const setIsEditing = (value: boolean) => {
    if (onEditingChange) {
      onEditingChange(value);
    } else {
      setInternalIsEditing(value);
    }
  };
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  if (isLoading) return <div>Loading details…</div>;

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">Error loading details.</p>
          <p className="text-sm">{errorMessage || "This item may have been deleted or is no longer available."}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to={backLink}>{UI_LABELS.BACK}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {id && <div className="text-sm text-muted-foreground font-mono">{id}</div>}
        </div>

        <div className="flex items-center gap-2">
          {onDelete && !isEditing && (
            <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
              {UI_LABELS.DELETE}
            </Button>
          )}
          {onEdit && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              {UI_LABELS.EDIT}
            </Button>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button disabled={isSaving} onClick={onSave}>
                {UI_LABELS.SAVE}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                onCancel?.();
              }} disabled={isSaving}>
                {UI_LABELS.CANCEL}
              </Button>
            </div>
          )}
          <Button variant="outline" asChild>
            <Link to={backLink}>{UI_LABELS.BACK}</Link>
          </Button>
        </div>
      </div>

      {/* View content - zobrazeno když není v edit mode */}
      {!isEditing && viewContent && (
        <div>
          <Card>
            <CardContent className="space-y-4 pt-6">{viewContent}</CardContent>
          </Card>
        </div>
      )}

      {/* Edit form - zobrazeno když je v edit mode */}
      {isEditing && editContent && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{UI_LABELS.EDIT}</CardTitle>
            </CardHeader>
            <CardContent>{editContent}</CardContent>
          </Card>
        </div>
      )}

      {/* Relationship content - zobrazeno vždy */}
      {relationshipContent && (
        <div>
          {relationshipContent}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {onDelete && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title={UI_LABELS.DELETE}
          description={`${UI_LABELS.DELETE_CONFIRM_PREFIX} ${title}${UI_LABELS.DELETE_CONFIRM_SUFFIX}`}
          confirmLabel={UI_LABELS.DELETE}
          confirmVariant="destructive"
          onConfirm={() => {
            onDelete();
            setDeleteConfirmOpen(false);
          }}
        />
      )}
    </div>
  );
}
