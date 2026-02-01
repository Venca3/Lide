import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeString } from "@/lib/stringNormalize";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditEntryRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: string | null;
  entryTitle: string;
  onSave: (newRole: string) => void | Promise<void>;
  isPending?: boolean;
  errorMessage?: string;
}

export function EditEntryRoleDialog({
  open,
  onOpenChange,
  currentRole,
  entryTitle,
  onSave,
  isPending,
  errorMessage,
}: EditEntryRoleDialogProps) {
  const [role, setRole] = useState(currentRole || "");

  const handleSave = async () => {
    const normalizedRole = normalizeString(role);
    if (!normalizedRole) return;
    await onSave(normalizedRole);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Entry Role</DialogTitle>
          <DialogDescription>
            Update the role for "{entryTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Role *</label>
            <Input
              placeholder="e.g., author, subject, witness..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!normalizeString(role) || isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>

          {errorMessage && (
            <div className="text-sm text-red-600">{errorMessage}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
