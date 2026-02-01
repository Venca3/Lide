import type { ReactNode } from "react";
import { X } from "lucide-react";

interface TagItemProps {
  label: ReactNode;
  onRemove?: () => void;
  disabled?: boolean;
}

export function TagItem({ label, onRemove, disabled }: TagItemProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm transition-colors has-[button:hover:not(:disabled)]:bg-red-100 dark:has-[button:hover:not(:disabled)]:bg-red-900/30">
      {label}
      {onRemove && (
        <button
          className="cursor-pointer opacity-70 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
