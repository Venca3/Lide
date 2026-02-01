import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";

interface RelationshipCardProps {
  title: ReactNode;
  action?: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  error?: ReactNode;

  confirmOpen?: boolean;
  onConfirmOpenChange?: (open: boolean) => void;
  confirmTitle?: string;
  confirmDescription?: ReactNode;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive";
  isConfirming?: boolean;
  onConfirm?: () => void;
}

export function RelationshipCard({
  title,
  action,
  isEmpty,
  emptyMessage = "None",
  children,
  error,
  confirmOpen,
  onConfirmOpenChange,
  confirmTitle = "Confirm",
  confirmDescription,
  confirmLabel = "Remove",
  confirmVariant = "destructive",
  isConfirming,
  onConfirm,
}: RelationshipCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>

      <CardContent className="space-y-2">
        {isEmpty && <div className="text-sm text-muted-foreground">{emptyMessage}</div>}
        {!isEmpty && children}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </CardContent>

      {onConfirm && (
        <ConfirmDialog
          open={Boolean(confirmOpen)}
          onOpenChange={(open) => onConfirmOpenChange?.(open)}
          title={confirmTitle}
          description={confirmDescription}
          confirmLabel={confirmLabel}
          confirmVariant={confirmVariant}
          isConfirming={isConfirming}
          onConfirm={() => onConfirm()}
        />
      )}
    </Card>
  );
}
