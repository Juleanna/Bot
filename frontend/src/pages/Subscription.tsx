import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlans, useCurrentSubscription, useCheckout } from "@/api/hooks/useSubscription";
import { cn } from "@/lib/utils";

export default function Subscription() {
  const { t } = useTranslation();
  const { data: plans } = usePlans();
  const { data: subscription } = useCurrentSubscription();
  const checkoutMutation = useCheckout();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t("subscription.title")}</h1>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("subscription.current_plan")}: {subscription.plan.name}
              <Badge variant="success">{subscription.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("subscription.messages_used", {
                used: subscription.messages_used_this_period,
                max: subscription.plan.max_messages_per_month,
              })}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--glass-bg)]">
              <div
                className="h-full bg-gradient-primary transition-all rounded-full"
                style={{
                  width: `${Math.min(
                    (subscription.messages_used_this_period / subscription.plan.max_messages_per_month) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {(plans ?? []).map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "transition-all duration-300 hover:glow-sm",
              subscription?.plan.id === plan.id
                ? "gradient-border glow-md"
                : "glass-hover"
            )}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-foreground">
                ${plan.price_monthly}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-foreground/80">{plan.max_bots} bots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-foreground/80">{plan.max_messages_per_month.toLocaleString()} messages/mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-foreground/80">{plan.max_chat_users.toLocaleString()} chat users</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {subscription?.plan.id === plan.id ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="glow"
                  className="w-full"
                  onClick={() => checkoutMutation.mutate(plan.id)}
                  disabled={checkoutMutation.isPending}
                >
                  {t("subscription.upgrade")}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
