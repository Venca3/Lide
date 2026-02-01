import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";

interface ListRowProps {
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  children: ReactNode;
  right?: ReactNode;
  hoverHint?: ReactNode;
  className?: string;
  deleteAction?: {
    label: string;
    onDelete: () => void;
    isDeleting?: boolean;
    deleteButtonText?: string;
    confirmTitle?: string;
    confirmDescription?: ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
  };
}

export function ListRow({
  onClick,
  onKeyDown,
  children,
  right,
  hoverHint,
  className,
  deleteAction,
}: ListRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteButtonText = deleteAction?.deleteButtonText ?? "Delete";
  const confirmTitle = deleteAction?.confirmTitle ?? "Delete";
  const confirmButtonText = deleteAction?.confirmButtonText ?? "Delete";
  const cancelButtonText = deleteAction?.cancelButtonText ?? "Cancel";
  const confirmDescription =
    deleteAction?.confirmDescription ??
    `Opravdu chcete smazat '${deleteAction?.label ?? ""}'?`;

  return (
    <div
      className={`group flex items-center justify-between gap-3 rounded-lg border px-4 py-3 hover:bg-muted/50 ${className ?? ""}`}
    >
      <div 
        role="button"
        tabIndex={0}
        className="min-w-0 flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
      <div className="flex items-center gap-2">
        {hoverHint && (
          <div className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {hoverHint}
          </div>
        )}
        {deleteAction && (
          <>
            <Button
              size="sm"
              variant="destructive"
              disabled={deleteAction.isDeleting}
              onClick={(event) => {
                event.stopPropagation();
                setConfirmOpen(true);
              }}
            >
              {deleteButtonText}
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={confirmTitle}
              description={confirmDescription}
              confirmLabel={confirmButtonText}
              cancelLabel={cancelButtonText}
              confirmVariant="destructive"
              isConfirming={deleteAction.isDeleting}
              onConfirm={() => deleteAction.onDelete()}
            />
          </>
        )}
        {right}
      </div>
    </div>
  );
}
