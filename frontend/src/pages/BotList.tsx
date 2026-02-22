import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  MessageSquare,
  Users,
  Settings,
  Workflow,
  Send,
  MessageCircle,
  Phone,
  Trash2,
  MoreVertical,
  Power,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBots, useDeleteBot } from "@/api/hooks/useBots";
import type { BotListItem, Platform } from "@/types/bot";
import BotCreateDialog from "@/components/bots/BotCreateDialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const platformConfig: Record<
  Platform,
  {
    icon: typeof Send;
    gradient: string;
    glow: string;
    accent: string;
  }
> = {
  telegram: {
    icon: Send,
    gradient: "from-blue-500 to-blue-600",
    glow: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.35)]",
    accent: "text-blue-400",
  },
  viber: {
    icon: MessageCircle,
    gradient: "from-violet-500 to-purple-600",
    glow: "hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.35)]",
    accent: "text-violet-400",
  },
  whatsapp: {
    icon: Phone,
    gradient: "from-green-500 to-emerald-600",
    glow: "hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.35)]",
    accent: "text-green-400",
  },
};

const statusVariant = {
  active: "success" as const,
  paused: "warning" as const,
  draft: "secondary" as const,
  error: "destructive" as const,
};

export default function BotList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BotListItem | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { data, isLoading } = useBots();
  const deleteMutation = useDeleteBot();

  const bots = data?.results ?? [];

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{t("bots.title")}</h1>
        <Button variant="glow" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("bots.create")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : bots.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--glass-border-strong)] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">{t("bots.no_bots")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("bots.no_bots_hint")}</p>
          <Button className="mt-6" variant="glow" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("bots.create")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot: BotListItem) => {
            const cfg = platformConfig[bot.platform];
            const Icon = cfg.icon;
            return (
              <div
                key={bot.id}
                className={`group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm transition-all duration-300 ${cfg.glow} hover:border-[var(--glass-border-hover)]`}
              >
                {/* Platform gradient stripe */}
                <div className={`h-1 bg-gradient-to-r ${cfg.gradient}`} />

                {/* Header */}
                <div className="flex items-start justify-between p-5 pb-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-lg`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground leading-tight">
                        {bot.name}
                      </h3>
                      <span className={`text-xs ${cfg.accent} font-medium`}>
                        {bot.platform.charAt(0).toUpperCase() + bot.platform.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[bot.status]} className="text-[10px]">
                      {bot.is_active && <Power className="mr-1 h-2.5 w-2.5" />}
                      {t(`bots.${bot.status}`)}
                    </Badge>
                    {/* Context menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === bot.id ? null : bot.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === bot.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong,var(--glass-bg))] backdrop-blur-2xl shadow-xl">
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                navigate(`/bots/${bot.id}`);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-[var(--glass-bg)] transition-colors"
                            >
                              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                              {t("bots.settings")}
                            </button>
                            <div className="mx-2 border-t border-[var(--glass-border)]" />
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                setDeleteTarget(bot);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {t("bots.delete")}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-5 px-5 pt-4 pb-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{bot.messages_count}</span>
                    <span className="text-xs text-muted-foreground">{t("bots.messages_short")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{bot.chat_users_count}</span>
                    <span className="text-xs text-muted-foreground">{t("bots.users_short")}</span>
                  </div>
                </div>

                {/* Created date */}
                <div className="flex items-center gap-1.5 px-5 pb-3 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(bot.created_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-[var(--glass-border)] p-3">
                  <Link to={`/bots/${bot.id}/editor`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <Workflow className="h-3.5 w-3.5" />
                      {t("bots.editor")}
                    </Button>
                  </Link>
                  <Link to={`/bots/${bot.id}`}>
                    <Button variant="ghost" size="sm" className="px-3">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => setDeleteTarget(bot)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <BotCreateDialog onClose={() => setShowCreate(false)} />}

      {deleteTarget && (
        <ConfirmDialog
          title={t("bots.delete_title")}
          description={t("bots.delete_description", { name: deleteTarget.name })}
          confirmLabel={t("bots.delete")}
          variant="danger"
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
