import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCreateBot } from "@/api/hooks/useBots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bot,
  Send,
  MessageCircle,
  Phone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
} from "lucide-react";

const schema = z.object({
  name: z.string().min(1).max(255),
  platform: z.enum(["telegram", "viber", "whatsapp"]),
  api_token: z.string().min(1),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

const platforms = [
  {
    value: "telegram" as const,
    label: "Telegram",
    icon: Send,
    color: "from-blue-500 to-blue-600",
    ring: "ring-blue-500/40",
    bg: "bg-blue-500/10",
    borderActive: "border-blue-500",
    text: "text-blue-400",
  },
  {
    value: "viber" as const,
    label: "Viber",
    icon: MessageCircle,
    color: "from-violet-500 to-purple-600",
    ring: "ring-violet-500/40",
    bg: "bg-violet-500/10",
    borderActive: "border-violet-500",
    text: "text-violet-400",
  },
  {
    value: "whatsapp" as const,
    label: "WhatsApp",
    icon: Phone,
    color: "from-green-500 to-emerald-600",
    ring: "ring-green-500/40",
    bg: "bg-green-500/10",
    borderActive: "border-green-500",
    text: "text-green-400",
  },
];

export default function BotCreateDialog({ onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateBot();
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { platform: "telegram" },
  });

  const selectedPlatform = watch("platform");
  const platform = platforms.find((p) => p.value === selectedPlatform)!;

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: (bot) => {
        onClose();
        navigate(`/bots/${bot.id}/editor`);
      },
    });
  };

  const goNext = async () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      const valid = await trigger(["name", "api_token"]);
      if (valid) handleSubmit(onSubmit)();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong,var(--glass-bg))] backdrop-blur-2xl shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("bots.create")}</h2>
                <p className="text-xs text-muted-foreground">
                  {step === 0 ? t("bots.step_platform") : t("bots.step_settings")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="relative mt-4 flex gap-2">
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 0 ? "bg-primary" : "bg-[var(--glass-border)]"}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-primary" : "bg-[var(--glass-border)]"}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pb-2">
            {/* Step 0: Platform selection */}
            {step === 0 && (
              <div className="space-y-3 animate-fade-in">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlatform === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200 ${
                        isSelected
                          ? `${p.borderActive} ${p.bg} shadow-lg ${p.ring} ring-2`
                          : "border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)]"
                      }`}
                      onClick={() => setValue("platform", p.value)}
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-semibold ${isSelected ? p.text : "text-foreground"}`}>
                          {p.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t(`bots.platform_desc_${p.value}`)}
                        </p>
                      </div>
                      {isSelected && (
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${p.color}`}>
                          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 1: Bot details */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                {/* Selected platform badge */}
                <div className={`inline-flex items-center gap-2 rounded-lg ${platform.bg} px-3 py-1.5 border ${platform.borderActive}/30`}>
                  <platform.icon className={`h-4 w-4 ${platform.text}`} />
                  <span className={`text-xs font-medium ${platform.text}`}>{platform.label}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t("bots.name")}
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder={t("bots.name_placeholder")}
                    className="h-11"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_token" className="text-sm font-medium">
                    {t("bots.api_token")}
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="api_token"
                      type="password"
                      {...register("api_token")}
                      placeholder="••••••••••••••••"
                      className="h-11 pl-10"
                    />
                  </div>
                  {errors.api_token && (
                    <p className="text-xs text-destructive">{errors.api_token.message}</p>
                  )}
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    {t(`bots.token_hint_${selectedPlatform}`)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    {t("bots.description")} <span className="text-muted-foreground font-normal">({t("bots.optional")})</span>
                  </Label>
                  <textarea
                    id="description"
                    {...register("description")}
                    placeholder={t("bots.description_placeholder")}
                    rows={2}
                    className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2.5 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--glass-border)] px-6 py-4 mt-2">
            {step === 0 ? (
              <>
                <Button type="button" variant="ghost" onClick={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="button" onClick={goNext} className="gap-2">
                  {t("common.next")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" onClick={() => setStep(0)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("common.back")}
                </Button>
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={createMutation.isPending}
                  className={`gap-2 bg-gradient-to-r ${platform.color} hover:opacity-90 border-0 text-white shadow-lg`}
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("common.create")}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
