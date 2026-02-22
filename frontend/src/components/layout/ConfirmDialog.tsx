import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UI_LABELS } from "@/lib/constants";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "ghost" | "secondary";
  isConfirming?: boolean;
  onConfirm: () => boolean | void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = UI_LABELS.CONFIRM,
  confirmLoadingLabel,
  cancelLabel = UI_LABELS.CANCEL,
  confirmVariant = "default",
  isConfirming,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmText = isConfirming
    ? confirmLoadingLabel ?? confirmLabel
    : confirmLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              const shouldClose = onConfirm() ?? true;
              if (shouldClose) {
                onOpenChange(false);
              }
            }}
            disabled={isConfirming}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
