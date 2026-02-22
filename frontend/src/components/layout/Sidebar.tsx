import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  User,
  Shield,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useLogout } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { collapsed, toggle } = useSidebarStore();
  const logoutMutation = useLogout();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
      collapsed && "justify-center px-0",
      isActive
        ? "bg-gradient-primary text-white shadow-lg glow-sm"
        : "text-muted-foreground hover:bg-[var(--glass-bg)] hover:text-foreground"
    );

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/bots", icon: Bot, label: t("nav.bots") },
    { to: "/subscription", icon: CreditCard, label: t("nav.subscription") },
    { to: "/profile", icon: User, label: t("nav.profile") },
    ...(user?.is_staff
      ? [{ to: "/admin", icon: Shield, label: t("nav.admin") }]
      : []),
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b border-[var(--glass-border)] px-3">
        {collapsed ? (
          <NavLink
            to="/dashboard"
            className="flex w-full items-center justify-center"
          >
            <Bot className="h-6 w-6 text-primary" />
          </NavLink>
        ) : (
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 font-bold text-lg text-foreground"
          >
            <Bot className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-gradient truncate">{t("app_name")}</span>
          </NavLink>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} className={linkClass} title={collapsed ? link.label : undefined}>
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--glass-border)] p-2 space-y-1">
        {!collapsed && (
          <div className="truncate px-3 py-1 text-xs text-muted-foreground">
            {user?.email}
          </div>
        )}
        <Button
          variant="ghost"
          className={cn("w-full gap-3", collapsed ? "justify-center px-0" : "justify-start")}
          onClick={() => logoutMutation.mutate()}
          title={collapsed ? t("nav.logout") : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && t("nav.logout")}
        </Button>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 text-muted-foreground",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={toggle}
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              {t("nav.collapse")}
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
