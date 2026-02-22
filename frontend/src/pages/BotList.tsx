import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, MessageSquare, Users, Settings, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBots, useDeleteBot } from "@/api/hooks/useBots";
import type { BotListItem, Platform } from "@/types/bot";
import BotCreateDialog from "@/components/bots/BotCreateDialog";

const platformIcons: Record<Platform, string> = {
  telegram: "🔵",
  viber: "🟣",
  whatsapp: "🟢",
};

const platformGlow: Record<Platform, string> = {
  telegram: "hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]",
  viber: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]",
  whatsapp: "hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]",
};

const statusVariant = {
  active: "success" as const,
  paused: "warning" as const,
  draft: "secondary" as const,
  error: "destructive" as const,
};

export default function BotList() {
  const { t } = useTranslation();
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useBots();
  const deleteMutation = useDeleteBot();

  const bots = data?.results ?? [];

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
        <Card className="border-dashed border-[var(--glass-border-strong)]">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("bots.no_bots")}</p>
            <Button className="mt-4" variant="glow" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("bots.create")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot: BotListItem) => (
            <Card key={bot.id} className={`glass-hover transition-all duration-300 ${platformGlow[bot.platform]}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{platformIcons[bot.platform]}</span>
                  <CardTitle className="text-lg">{bot.name}</CardTitle>
                </div>
                <Badge variant={statusVariant[bot.status]}>
                  {t(`bots.${bot.status}`)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {bot.messages_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {bot.chat_users_count}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/bots/${bot.id}/editor`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Workflow className="mr-1 h-3 w-3" />
                      {t("bots.editor")}
                    </Button>
                  </Link>
                  <Link to={`/bots/${bot.id}`}>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <BotCreateDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
