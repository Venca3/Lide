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

interface EditRelationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relation: {
    type: string;
    validFrom: string | null;
    validTo: string | null;
    note: string | null;
  };
  onSave: (type: string, validFrom: string | null, validTo: string | null, note: string | null) => void | Promise<void>;
  isPending?: boolean;
  errorMessage?: string;
}

export function EditRelationDialog({
  open,
  onOpenChange,
  relation,
  onSave,
  isPending,
  errorMessage,
}: EditRelationDialogProps) {
  const [type, setType] = useState(relation.type);
  const [validFrom, setValidFrom] = useState(relation.validFrom || "");
  const [validTo, setValidTo] = useState(relation.validTo || "");
  const [note, setNote] = useState(relation.note || "");

  const handleSave = async () => {
    const normalizedType = normalizeString(type);
    if (!normalizedType) return;
    await onSave(
      normalizedType,
      validFrom.trim() || null,
      validTo.trim() || null,
      note ? normalizeString(note) : null
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Relation</DialogTitle>
          <DialogDescription>
            Update the relationship details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Relation Type *</label>
            <Input
              placeholder="e.g., parent, child, spouse, sibling..."
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Valid From</label>
            <Input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Valid To</label>
            <Input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Note</label>
            <Input
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!normalizeString(type) || isPending}
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
