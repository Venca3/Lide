import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { UI_LABELS } from "@/lib/constants";

interface ListRow_newProps {
  resources: { singular: string, plural: string }
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  children: ReactNode;
  right?: ReactNode;
  hoverHint?: ReactNode;
  className?: string;
  onDelete?: () => void;
  deleteTitle?: string;
  isDeleting?: boolean;
}

export function ListRow_new({
  resources,
  onClick,
  onKeyDown,
  children,
  right,
  hoverHint = onClick ? UI_LABELS.VIEW_DETAILS : undefined,
  className,
  onDelete,
  deleteTitle,
  isDeleting,
}: ListRow_newProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmDescription =
    `${UI_LABELS.DELETE_CONFIRM_PREFIX} ${resources.singular} '${deleteTitle ?? ""}'${UI_LABELS.DELETE_CONFIRM_SUFFIX}`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(event);
    } else if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`group flex items-center justify-between gap-3 rounded-lg border px-4 py-3 hover:bg-muted/50 ${className ?? ""}`}
    >
      <div 
        role="button"
        tabIndex={0}
        className="min-w-0 flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
      <div className="flex items-center gap-2">
        {hoverHint && (
          <div className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {hoverHint}
          </div>
        )}
        {onDelete && (
          <>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.stopPropagation();
                setConfirmOpen(true);
              }}
            >
              {UI_LABELS.DELETE}
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={UI_LABELS.DELETE}
              description={confirmDescription}
              confirmLabel={UI_LABELS.DELETE}
              cancelLabel={UI_LABELS.CANCEL}
              confirmVariant="destructive"
              isConfirming={isDeleting}
              onConfirm={() => onDelete()}
            />
          </>
        )}
        {right}
      </div>
    </div>
  );
}
