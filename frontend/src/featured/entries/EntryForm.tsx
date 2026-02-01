import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type EntryFormValue = {
  type: string;
  title: string;
  content: string;
  occurredAt: string;
};

type Props = {
  value: EntryFormValue;
  onChange: (v: EntryFormValue) => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
  errorText?: string | null;
  occurredAtErrorText?: string | null;
};

export function EntryForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  disabled,
  errorText,
  occurredAtErrorText,
}: Props) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Type * (e.g. MEMORY, NOTE, EVENT)"
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value })}
      />

      <textarea
        className="min-h-28 w-full rounded-md border bg-transparent p-3 text-sm"
        placeholder="Content *"
        value={value.content}
        onChange={(e) => onChange({ ...value, content: e.target.value })}
      />

      <Input
        placeholder="Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />

      <div>
        <Input
          placeholder="Occurred at (optional), e.g. 1989-08-11 or 1989-08-11T16:30:00Z"
          value={value.occurredAt}
          onChange={(e) => onChange({ ...value, occurredAt: e.target.value })}
          type="datetime-local"
        />
        {occurredAtErrorText ? (
          <div className="text-xs text-red-600 mt-1">{occurredAtErrorText}</div>
        ) : null}
      </div>

      <Button
        disabled={disabled || !value.type.trim() || !value.content.trim()}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>

      {errorText ? <div className="text-sm text-red-600">{errorText}</div> : null}
    </div>
  );
}
