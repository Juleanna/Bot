import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

const languages = [
  { code: "uk", label: "UA" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <Languages className="h-4 w-4 text-muted-foreground" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-200 ${
            i18n.language === lang.code
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)]"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
