import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";

type Props = {
  // Loading & Error states
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;

  // Header
  title: ReactNode;
  subtitle?: ReactNode;

  // Navigation
  backLink: string;
  backLabel?: string;

  // Delete functionality
  onDelete?: () => void;
  isDeletingPending?: boolean;
  deleteConfirmOpen?: boolean;
  onDeleteConfirmOpenChange?: (open: boolean) => void;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: ReactNode;

  // Edit mode
  isEditing?: boolean;
  onEditChange?: (editing: boolean) => void;
  onSave?: () => void;
  isSavePending?: boolean;
  saveError?: string;

  // Content
  viewContent?: ReactNode; // Zobrazeno v view mode
  editContent?: ReactNode; // Zobrazeno v edit mode
  relationshipContent?: ReactNode; // Vztahy (zobrazeno vždycky)

  children?: ReactNode; // Pro zpětnou kompatibilitu
};

export function DetailPageLayout({
  isLoading,
  isError,
  errorMessage,
  title,
  subtitle,
  backLink,
  backLabel = "Back",
  onDelete,
  isDeletingPending,
  deleteConfirmOpen,
  onDeleteConfirmOpenChange,
  deleteConfirmTitle = "Delete",
  deleteConfirmDescription,
  isEditing,
  onEditChange,
  onSave,
  isSavePending,
  saveError,
  viewContent,
  editContent,
  relationshipContent,
  children,
}: Props) {
  if (isLoading) return <div>Loading details…</div>;

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">Error loading details.</p>
          <p className="text-sm">{errorMessage || "This item may have been deleted or is no longer available."}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to={backLink}>{backLabel}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <div className="text-sm text-muted-foreground font-mono">{subtitle}</div>}
        </div>

        <div className="flex items-center gap-2">
          {onDelete && !isEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteConfirmOpenChange?.(true)}
              disabled={isDeletingPending}
            >
              Delete
            </Button>
          )}

          {onEditChange && (
            <>
              {!isEditing ? (
                <Button onClick={() => onEditChange(true)}>Edit</Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button disabled={isSavePending} onClick={() => onSave?.()}>
                    Save
                  </Button>
                  <Button variant="ghost" onClick={() => onEditChange(false)} disabled={isSavePending}>
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}

          <Button variant="outline" asChild>
            <Link to={backLink}>{backLabel}</Link>
          </Button>
        </div>
      </div>

      {/* View content - zobrazeno když není v edit mode */}
      {!isEditing && viewContent && <div>{viewContent}</div>}

      {/* Edit content - zobrazeno když je v edit mode */}
      {isEditing && editContent && <div>{editContent}</div>}

      {/* Fallback na children pro zpětnou kompatibilitu */}
      {!isEditing && !viewContent && children && <div>{children}</div>}
      {isEditing && !editContent && children && <div>{children}</div>}

      {/* Save error message */}
      {saveError && <div className="text-sm text-red-600">{saveError}</div>}

      {/* Relationship content - zobrazeno vždycky */}
      {relationshipContent && <div>{relationshipContent}</div>}

      {/* Delete confirmation dialog */}
      {onDelete && (
        <ConfirmDialog
          open={Boolean(deleteConfirmOpen)}
          onOpenChange={(open) => onDeleteConfirmOpenChange?.(open)}
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          confirmLabel="Delete"
          confirmLoadingLabel="Deleting…"
          confirmVariant="destructive"
          isConfirming={isDeletingPending}
          onConfirm={() => onDelete()}
        />
      )}
    </div>
  );
}
