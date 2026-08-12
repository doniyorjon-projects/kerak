import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const PLACEHOLDER_EXAMPLES: Record<"uz" | "ru", string[]> = {
  uz: [
    "iPhone 17 Pro sotiladi",
    "Chilonzor tumanida kvartira",
    "Nexia 3 arzon narxda",
    "Uy tozalash xizmati",
    "Bolalar velosipedi",
    "Repetitor matematika",
    "Old tomon ish shkaf",
    "Kondensioner o'rnatish",
  ],
  ru: [
    "iPhone 17 Pro продается",
    "Квартира в Чиланзаре",
    "Nexia 3 недорого",
    "Услуга уборки дома",
    "Детский велосипед",
    "Репетитор по математике",
    "Шкаф-купе",
    "Установка кондиционера",
  ],
};

const ROTATE_INTERVAL_MS = 2500;

export function SearchBar({ onSearch }: SearchBarProps) {
  const { t, lang } = useTranslation();
  const [value, setValue] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const examples = PLACEHOLDER_EXAMPLES[lang];

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (value) return;
    const interval = setInterval(() => {
      setExampleIndex((i) => (i + 1) % examples.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [value, examples.length]);

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
        placeholder={examples[exampleIndex]}
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
