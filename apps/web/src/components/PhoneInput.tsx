import { useState } from "react";
import { Phone } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
}

function formatDigits(digits: string): string {
  if (digits.length === 0) return "";
  let out = "(" + digits.slice(0, 2);
  if (digits.length >= 2) out += ")";
  out += digits.slice(2, 5);
  if (digits.length >= 5) out += " ";
  out += digits.slice(5, 7);
  if (digits.length >= 7) out += " ";
  out += digits.slice(7, 9);
  return out;
}

export function phoneToDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("998")) digits = digits.slice(3);
  return digits.slice(0, 9);
}

export function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [digits, setDigits] = useState(() => phoneToDigits(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, 9);
    setDigits(next);
    onChange(next.length > 0 ? `+998${next}` : "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace" && e.key !== "Delete") return;
    e.preventDefault();
    const input = e.currentTarget;
    const hasSelection = input.selectionStart !== input.selectionEnd;
    const next = hasSelection ? "" : digits.slice(0, -1);
    setDigits(next);
    onChange(next.length > 0 ? `+998${next}` : "");
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-divider bg-app px-3 py-2.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25">
      <Phone className="h-4 w-4 shrink-0 text-hint" />
      <span className="shrink-0 text-sm font-medium text-ink">+998</span>
      <input
        type="tel"
        inputMode="numeric"
        value={formatDigits(digits)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="(90)123 45 67"
        className="w-full bg-transparent text-sm text-ink placeholder:text-hint focus:outline-none"
      />
    </div>
  );
}
