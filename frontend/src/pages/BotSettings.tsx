import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { ArrowLeft, Power, PowerOff, Trash2, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useBot,
  useUpdateBot,
  useActivateBot,
  useDeactivateBot,
  useDeleteBot,
  useTestConnection,
} from "@/api/hooks/useBots";

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

  const onSubmit = (data: Record<string, string>) => {
    const payload: Record<string, string> = { ...data };
    if (!payload.api_token) delete payload.api_token;
    updateMutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/bots")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-foreground">{bot.name}</h1>
        <Badge variant={bot.is_active ? "success" : "secondary"}>
          {t(`bots.${bot.status}`)}
        </Badge>
      </div>

      <div className="flex gap-2">
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
          <Button onClick={() => activateMutation.mutate()} disabled={activateMutation.isPending}>
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
        <Button
          variant="destructive"
          onClick={() => {
            if (confirm(t("bots.confirm_delete"))) {
              deleteMutation.mutate(botId!, { onSuccess: () => navigate("/bots") });
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("bots.delete")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("bots.settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("bots.name")}</Label>
              <Input id="name" {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome_message">Welcome Message</Label>
              <Input id="welcome_message" {...register("welcome_message")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fallback_message">Fallback Message</Label>
              <Input id="fallback_message" {...register("fallback_message")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_token">{t("bots.api_token")} (leave empty to keep current)</Label>
              <Input id="api_token" type="password" {...register("api_token")} />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
