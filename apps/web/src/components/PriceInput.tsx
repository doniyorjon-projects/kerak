function formatThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

interface PriceInputProps {
  value: string;
  onChange: (rawDigits: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function PriceInput({ value, onChange, disabled, className, placeholder }: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    onChange(digits);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={formatThousands(value)}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className ?? "input disabled:opacity-50"}
    />
  );
}
