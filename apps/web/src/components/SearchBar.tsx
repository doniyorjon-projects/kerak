import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const clear = () => {
    setValue("");
    inputRef.current?.blur();
  };

  return (
    <div className="flex flex-1 items-center gap-2 rounded-full border border-divider bg-surface px-4 py-2.5 shadow-soft">
      <Search className="h-4 w-4 shrink-0 text-hint" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("home.searchPlaceholder")}
        className="w-full bg-transparent text-sm text-ink placeholder:text-hint focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label={t("cancel")}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-hint"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
