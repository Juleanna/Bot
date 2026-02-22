import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  User,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-gradient-primary text-white shadow-lg glow-sm"
      : "text-muted-foreground hover:bg-[var(--glass-bg)] hover:text-foreground"
  );

export default function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl">
      <div className="flex h-14 items-center border-b border-[var(--glass-border)] px-4">
        <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Bot className="h-6 w-6 text-primary" />
          <span className="text-gradient">{t("app_name")}</span>
        </NavLink>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard className="h-4 w-4" />
          {t("nav.dashboard")}
        </NavLink>
        <NavLink to="/bots" className={navLinkClass}>
          <Bot className="h-4 w-4" />
          {t("nav.bots")}
        </NavLink>
        <NavLink to="/subscription" className={navLinkClass}>
          <CreditCard className="h-4 w-4" />
          {t("nav.subscription")}
        </NavLink>
        <NavLink to="/profile" className={navLinkClass}>
          <User className="h-4 w-4" />
          {t("nav.profile")}
        </NavLink>
        {user?.is_staff && (
          <NavLink to="/admin" className={navLinkClass}>
            <Shield className="h-4 w-4" />
            {t("nav.admin")}
          </NavLink>
        )}
      </nav>

      <div className="border-t border-[var(--glass-border)] p-3">
        <div className="mb-2 truncate px-3 text-sm text-muted-foreground">
          {user?.email}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </Button>
      </div>
    </aside>
  );
}
