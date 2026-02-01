import type { ReactNode } from "react";
import { X } from "lucide-react";

interface TagItemProps {
  label: ReactNode;
  onRemove?: () => void;
  disabled?: boolean;
}

export function TagItem({ label, onRemove, disabled }: TagItemProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
      {label}
      {onRemove && (
        <button
          className="opacity-70 hover:opacity-100 disabled:opacity-50"
          title="Remove"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
