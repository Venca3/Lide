import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type EditField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date";
  placeholder?: string;
  required?: boolean;
};

type Props = {
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

export function EditDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  values,
  onValuesChange,
  onSave,
  isPending,
  errorMessage,
  isValid = true,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && " *"}
              </label>
              <Input
                type={field.type || "text"}
                value={values[field.name] ?? ""}
                onChange={(e) => onValuesChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={isPending}
              />
            </div>
          ))}

          {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={!isValid || isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
