import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type MediaFormValue = {
  mediaType: string;
  mimeType: string;
  uri: string;
  title: string;
  note: string;
  takenAt: string;
};

type Props = {
  value: MediaFormValue;
  onChange: (v: MediaFormValue) => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
  errorText?: string | null;
  takenAtErrorText?: string | null;
};

export function MediaForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  disabled,
  errorText,
  takenAtErrorText,
}: Props) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Media type * (e.g. PHOTO, VIDEO, DOC)"
        value={value.mediaType}
        onChange={(e) => onChange({ ...value, mediaType: e.target.value })}
      />

      <Input
        placeholder="URI * (/path/to/file or URL)"
        value={value.uri}
        onChange={(e) => onChange({ ...value, uri: e.target.value })}
      />

      <Input
        placeholder="MIME type"
        value={value.mimeType}
        onChange={(e) => onChange({ ...value, mimeType: e.target.value })}
      />

      <Input
        placeholder="Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />

      <div>
        <Input
          placeholder="Taken at (optional), e.g. 1989-08-11T16:30"
          value={value.takenAt}
          onChange={(e) => onChange({ ...value, takenAt: e.target.value })}
          type="datetime-local"
        />
        {takenAtErrorText ? (
          <div className="text-xs text-red-600 mt-1">{takenAtErrorText}</div>
        ) : null}
      </div>

      <textarea
        className="min-h-24 w-full rounded-md border bg-transparent p-3 text-sm"
        placeholder="Note"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
      />

      <Button
        disabled={disabled || !value.mediaType.trim() || !value.uri.trim()}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>

      {errorText ? <div className="text-sm text-red-600">{errorText}</div> : null}
    </div>
  );
}
