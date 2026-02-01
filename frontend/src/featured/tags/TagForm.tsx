import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type TagFormValue = {
  name: string;
};

type Props = {
  value: TagFormValue;
  onChange: (v: TagFormValue) => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
  errorText?: string | null;
};

export function TagForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  disabled,
  errorText,
}: Props) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Tag name"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />

      <Button disabled={disabled || !value.name.trim()} onClick={onSubmit}>
        {submitLabel}
      </Button>

      {errorText ? <div className="text-sm text-red-600">{errorText}</div> : null}
    </div>
  );
}
