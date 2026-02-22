import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type PersonFormValue = {
  firstName: string;
  lastName: string;
  nickname: string;
  birthDate: string; // YYYY-MM-DD nebo ""
  phone: string;
  email: string;
  note: string;
};

type Props = {
  value: PersonFormValue;
  onChange: (v: PersonFormValue) => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
  errorText?: string | null;
};

export function PersonForm({
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
        placeholder="First name *"
        value={value.firstName}
        onChange={(e) => onChange({ ...value, firstName: e.target.value })}
      />
      <Input
        placeholder="Last name"
        value={value.lastName}
        onChange={(e) => onChange({ ...value, lastName: e.target.value })}
      />
      <Input
        placeholder="Nickname"
        value={value.nickname}
        onChange={(e) => onChange({ ...value, nickname: e.target.value })}
      />
      <Input
        placeholder="Birth date (YYYY-MM-DD)"
        value={value.birthDate}
        onChange={(e) => onChange({ ...value, birthDate: e.target.value })}
      />
      <Input
        placeholder="Phone"
        value={value.phone}
        onChange={(e) => onChange({ ...value, phone: e.target.value })}
      />
      <Input
        placeholder="Email"
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
      />
      <textarea
        className="min-h-28 w-full rounded-md border bg-transparent p-3 text-sm"
        placeholder="Note"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
      />

      <Button disabled={disabled || !value.firstName.trim()} onClick={onSubmit}>
        {submitLabel}
      </Button>

      {errorText ? <div className="text-sm text-red-600">{errorText}</div> : null}
    </div>
  );
}
