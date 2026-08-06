import { useTranslation } from "../i18n/LanguageContext";

export function LanguageSwitch() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex overflow-hidden rounded-full border border-divider bg-surface p-0.5 shadow-soft">
      <button
        onClick={() => setLang("uz")}
        className={`rounded-full px-2 py-1 text-[11px] font-semibold transition ${
          lang === "uz" ? "bg-brand text-brand-contrast" : "text-hint"
        }`}
      >
        UZ
      </button>
      <button
        onClick={() => setLang("ru")}
        className={`rounded-full px-2 py-1 text-[11px] font-semibold transition ${
          lang === "ru" ? "bg-brand text-brand-contrast" : "text-hint"
        }`}
      >
        RU
      </button>
    </div>
  );
}
