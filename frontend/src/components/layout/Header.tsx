import { useTranslation } from "react-i18next";
import { Globe, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores/themeStore";

const languages = [
  { code: "uk", label: "UA" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
] as const;

export default function Header() {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="flex h-14 items-center justify-end border-b border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl px-6 gap-2">
      <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <div className="mx-1 h-5 w-px bg-[var(--glass-border)]" />
      <Globe className="h-4 w-4 text-muted-foreground" />
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.language === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </Button>
      ))}
    </header>
  );
}
