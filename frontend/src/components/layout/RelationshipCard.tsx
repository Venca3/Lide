import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { AddRelationshipDialog, type AddRelationshipDialogProps } from "@/components/layout/AddRelationshipDialog";
import { EditDialog, type EditField } from "@/components/layout/EditDialog";

interface RelationshipCardProps {
  title: ReactNode;
  action?: ReactNode;
  addDialog?: ReactNode;
  addDialogProps?: AddRelationshipDialogProps<any>;
  resource?: {
    singular: string;
    plural?: string;
  };
  isEmpty?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
  items?: any[];
  renderItem?: (item: any) => ReactNode;
  onEditItem?: (item: any) => void;
  onRemoveItem?: (item: any) => void;
  editItemDisabled?: (item: any) => boolean;
  removeItemDisabled?: (item: any) => boolean;
  error?: ReactNode;

  // Compact dialog configs
  confirm?: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    description?: ReactNode;
    label?: string;
    variant?: "default" | "destructive";
    isConfirming?: boolean;
    onConfirm?: () => void;
  };
  editDialog?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: ReactNode;
    fields: EditField[];
    values: Record<string, string>;
    onValuesChange: (field: string, value: string) => void;
    onSave: () => void | Promise<void>;
    isPending?: boolean;
    errorMessage?: string;
    isValid?: boolean;
  };

  // Backwards compatibility
  dialogs?: ReactNode;
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
  addDialog,
  addDialogProps,
  resource,
  isEmpty,
  emptyMessage,
  children,
  items,
  renderItem,
  onEditItem,
  onRemoveItem,
  editItemDisabled,
  removeItemDisabled,
  error,
  confirm,
  editDialog,
  dialogs,
  confirmOpen,
  onConfirmOpenChange,
  confirmTitle = "Confirm",
  confirmDescription,
  confirmLabel = "Delete",
  confirmVariant = "destructive",
  isConfirming,
  onConfirm,
}: RelationshipCardProps) {
  const resourcePlural = resource?.plural ?? (resource?.singular ? `${resource.singular}s` : undefined);
  const resourcePluralLower = resourcePlural?.toLowerCase();
  const resourceSingularLower = resource?.singular?.toLowerCase();

  const confirmConfig = confirm ?? {
    open: confirmOpen,
    onOpenChange: onConfirmOpenChange,
    title: confirmTitle,
    description: confirmDescription,
    label: confirmLabel,
    variant: confirmVariant,
    isConfirming,
    onConfirm,
  };

  const shouldRenderConfirm = Boolean(confirmConfig.onConfirm);

  const resolvedEmptyMessage =
    emptyMessage ?? (resourcePluralLower ? `No ${resourcePluralLower}` : "None");

  const resolvedConfirmTitle =
    confirmConfig.title ?? (resourceSingularLower ? `Delete ${resourceSingularLower}` : "Confirm");

  const resolvedConfirmLabel =
    confirmConfig.label ?? (resourceSingularLower ? `Delete ${resourceSingularLower}` : "Delete");

  const resolvedAddDialogProps = addDialogProps
    ? {
        ...addDialogProps,
        resourceLabel: addDialogProps.resourceLabel ?? resource?.singular,
        resourceLabelPlural: addDialogProps.resourceLabelPlural ?? resource?.plural,
      }
    : undefined;

  const headerAction =
    action ?? addDialog ?? (resolvedAddDialogProps ? <AddRelationshipDialog {...resolvedAddDialogProps} /> : undefined);

  const shouldAutoRenderItems = items && renderItem && (onEditItem || onRemoveItem);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        {headerAction}
      </CardHeader>

      <CardContent className="space-y-2">
        {isEmpty && <div className="text-sm text-muted-foreground">{resolvedEmptyMessage}</div>}
        {shouldAutoRenderItems && (
          <div className="space-y-2 text-sm">
            {items.map((item: any, idx: number) => (
              <div key={item?.id ?? idx} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {renderItem(item)}
                </div>
                {(onEditItem || onRemoveItem) && (
                  <div className="flex items-center gap-2">
                    {onEditItem && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={editItemDisabled?.(item) ?? false}
                        onClick={() => onEditItem(item)}
                      >
                        Edit
                      </Button>
                    )}
                    {onRemoveItem && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={removeItemDisabled?.(item) ?? false}
                        onClick={() => onRemoveItem(item)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!shouldAutoRenderItems && !isEmpty && children}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </CardContent>

      {shouldRenderConfirm && (
        <ConfirmDialog
          open={Boolean(confirmConfig.open)}
          onOpenChange={(open) => confirmConfig.onOpenChange?.(open)}
          title={resolvedConfirmTitle}
          description={confirmConfig.description}
          confirmLabel={resolvedConfirmLabel}
          confirmVariant={confirmConfig.variant ?? "destructive"}
          isConfirming={confirmConfig.isConfirming}
          onConfirm={() => confirmConfig.onConfirm?.()}
        />
      )}

      {editDialog && (
        <EditDialog
          open={editDialog.open}
          onOpenChange={editDialog.onOpenChange}
          title={editDialog.title}
          description={editDialog.description}
          fields={editDialog.fields}
          values={editDialog.values}
          onValuesChange={editDialog.onValuesChange}
          onSave={editDialog.onSave}
          isPending={editDialog.isPending}
          errorMessage={editDialog.errorMessage}
          isValid={editDialog.isValid}
        />
      )}

      {dialogs}
    </Card>
  );
}
