import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bot, Zap, Globe, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: Bot, titleKey: "landing.feature_multiplatform_title", descKey: "landing.feature_multiplatform_desc" },
    { icon: Zap, titleKey: "landing.feature_editor_title", descKey: "landing.feature_editor_desc" },
    { icon: Globe, titleKey: "landing.feature_webhook_title", descKey: "landing.feature_webhook_desc" },
    { icon: BarChart3, titleKey: "landing.feature_analytics_title", descKey: "landing.feature_analytics_desc" },
  ];

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Bot className="h-7 w-7 text-primary" />
          <span className="text-gradient">{t("app_name")}</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="ghost">{t("auth.login")}</Button>
          </Link>
          <Link to="/register">
            <Button variant="glow">{t("auth.register")}</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center animate-slide-up">
        <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          {t("landing.hero_title_1")}
          <br />
          <span className="text-gradient">{t("landing.hero_title_2")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("landing.hero_desc")}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register">
            <Button variant="glow" size="lg">{t("landing.cta_start")}</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">{t("landing.cta_login")}</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.titleKey} className="flex gap-4 rounded-xl glass glass-hover p-6 transition-all duration-300 hover:glow-sm animate-slide-up">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t(f.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(f.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {t("app_name")}. {t("landing.footer_rights")}
      </footer>
    </div>
  );
}
