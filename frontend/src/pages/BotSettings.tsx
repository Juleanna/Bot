import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Power,
  PowerOff,
  Trash2,
  Plug,
  Send,
  MessageCircle,
  Phone,
  KeyRound,
  Globe,
  MessageSquareText,
  MessageSquareOff,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  useBot,
  useUpdateBot,
  useActivateBot,
  useDeactivateBot,
  useDeleteBot,
  useTestConnection,
} from "@/api/hooks/useBots";
import type { Platform } from "@/types/bot";

const platformConfig: Record<
  Platform,
  { icon: typeof Send; gradient: string; accent: string }
> = {
  telegram: { icon: Send, gradient: "from-blue-500 to-blue-600", accent: "text-blue-400" },
  viber: { icon: MessageCircle, gradient: "from-violet-500 to-purple-600", accent: "text-violet-400" },
  whatsapp: { icon: Phone, gradient: "from-green-500 to-emerald-600", accent: "text-green-400" },
};

const statusVariant = {
  active: "success" as const,
  paused: "warning" as const,
  draft: "secondary" as const,
  error: "destructive" as const,
};

export default function BotSettings() {
  const { botId } = useParams<{ botId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: bot, isLoading } = useBot(botId!);
  const updateMutation = useUpdateBot(botId!);
  const activateMutation = useActivateBot(botId!);
  const deactivateMutation = useDeactivateBot(botId!);
  const deleteMutation = useDeleteBot();
  const testMutation = useTestConnection(botId!);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { register, handleSubmit } = useForm({
    values: bot
      ? {
          name: bot.name,
          description: bot.description,
          welcome_message: bot.welcome_message,
          fallback_message: bot.fallback_message,
          api_token: "",
        }
      : undefined,
  });

  if (isLoading || !bot) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const cfg = platformConfig[bot.platform as Platform] || platformConfig.telegram;
  const Icon = cfg.icon;

  const onSubmit = (data: Record<string, string>) => {
    const payload: Record<string, string> = { ...data };
    if (!payload.api_token) delete payload.api_token;
    updateMutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/bots")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{bot.name}</h1>
          <span className={`text-xs ${cfg.accent} font-medium`}>
            {bot.platform.charAt(0).toUpperCase() + bot.platform.slice(1)}
          </span>
        </div>
        <Badge variant={statusVariant[bot.status as keyof typeof statusVariant] || "secondary"}>
          {t(`bots.${bot.status}`)}
        </Badge>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {bot.is_active ? (
              <Button
                variant="outline"
                onClick={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isPending}
              >
                <PowerOff className="mr-2 h-4 w-4" />
                {t("bots.deactivate")}
              </Button>
            ) : (
              <Button
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
              >
                <Power className="mr-2 h-4 w-4" />
                {t("bots.activate")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
            >
              <Plug className="mr-2 h-4 w-4" />
              {t("bots.test_connection")}
            </Button>
            {testMutation.isSuccess && (
              <span className="flex items-center text-xs text-green-400">
                {t("bots.connection_ok")}
              </span>
            )}
            {testMutation.isError && (
              <span className="flex items-center text-xs text-red-400">
                {t("bots.connection_fail")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("bots.settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                {t("bots.name")}
              </Label>
              <Input id="name" {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                {t("bots.description")}
              </Label>
              <textarea
                id="description"
                {...register("description")}
                rows={2}
                className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2.5 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome_message" className="flex items-center gap-1.5">
                <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground" />
                {t("bots.welcome_message")}
              </Label>
              <Input id="welcome_message" {...register("welcome_message")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fallback_message" className="flex items-center gap-1.5">
                <MessageSquareOff className="h-3.5 w-3.5 text-muted-foreground" />
                {t("bots.fallback_message")}
              </Label>
              <Input id="fallback_message" {...register("fallback_message")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_token" className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                {t("bots.api_token")}
              </Label>
              <Input id="api_token" type="password" placeholder={t("bots.token_keep_current")} {...register("api_token")} />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-400">
            <Trash2 className="h-5 w-5" />
            {t("bots.danger_zone")}
          </CardTitle>
          <CardDescription className="text-red-400/60">
            {t("bots.danger_zone_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t("bots.delete")}
          </Button>
        </CardContent>
      </Card>

      {showDeleteDialog && (
        <ConfirmDialog
          title={t("bots.delete_title")}
          description={t("bots.delete_description", { name: bot.name })}
          confirmLabel={t("bots.delete")}
          variant="danger"
          isPending={deleteMutation.isPending}
          onConfirm={() => {
            deleteMutation.mutate(botId!, {
              onSuccess: () => navigate("/bots"),
            });
          }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
