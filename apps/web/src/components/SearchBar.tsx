import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-1 items-center gap-2 rounded-full border border-divider bg-surface px-4 py-2.5 shadow-soft">
      <Search className="h-4 w-4 shrink-0 text-hint" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("home.searchPlaceholder")}
        className="w-full bg-transparent text-sm text-ink placeholder:text-hint focus:outline-none"
      />
    </div>
  );
}
