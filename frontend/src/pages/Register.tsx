import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRegister } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Bot } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type FormData = {
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password_confirm: string;
};

export default function Register() {
  const { t } = useTranslation();

  const schema = z
    .object({
      email: z.string().email(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      password: z.string().min(8),
      password_confirm: z.string().min(8),
    })
    .refine((data) => data.password === data.password_confirm, {
      message: t("auth.passwords_mismatch"),
      path: ["password_confirm"],
    });
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md glass-strong animate-slide-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary glow-md">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <CardTitle>{t("auth.register")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {registerMutation.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive backdrop-blur-sm">
                {t("common.error")}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t("auth.first_name")}</Label>
                <Input id="first_name" {...register("first_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t("auth.last_name")}</Label>
                <Input id="last_name" {...register("last_name")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirm">{t("auth.password_confirm")}</Label>
              <Input id="password_confirm" type="password" {...register("password_confirm")} />
              {errors.password_confirm && (
                <p className="text-sm text-destructive">{errors.password_confirm.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? t("common.loading") : t("auth.register")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("auth.has_account")}{" "}
              <Link to="/login" className="text-primary hover:underline">
                {t("auth.login")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
