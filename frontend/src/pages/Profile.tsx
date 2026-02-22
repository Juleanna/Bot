import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  User as UserIcon,
  Mail,
  Shield,
  ShieldCheck,
  Calendar,
  Copy,
  Check,
  Camera,
  KeyRound,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfile, useChangePassword, useDeleteAccount } from "@/api/hooks/useAuth";

const glassSelect =
  "w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 text-sm text-foreground backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40";
const glassTextarea =
  "w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 text-sm text-foreground backdrop-blur-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40";

const TIMEZONES = [
  "UTC",
  "Europe/Kyiv",
  "Europe/Moscow",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const updateMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const deleteMutation = useDeleteAccount();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile form
  const { register, handleSubmit } = useForm({
    values: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          timezone: user.timezone,
          language: user.language,
          bio: user.bio,
        }
      : undefined,
  });

  // Password form
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    watch: watchPw,
  } = useForm({
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });

  const onSubmitProfile = (data: Record<string, string>) => {
    updateMutation.mutate(data as never);
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("avatar", file);
    updateMutation.mutate(formData);
  };

  const onSubmitPassword = (data: { old_password: string; new_password: string; confirm_password: string }) => {
    if (data.new_password !== data.confirm_password) return;
    changePasswordMutation.mutate(
      { old_password: data.old_password, new_password: data.new_password },
      {
        onSuccess: () => {
          resetPw();
          setPasswordSuccess(true);
          setTimeout(() => setPasswordSuccess(false), 3000);
        },
      }
    );
  };

  const onDeleteAccount = () => {
    if (deleteConfirm !== "DELETE") return;
    deleteMutation.mutate();
  };

  const copyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const avatarUrl = avatarPreview || user?.avatar;
  const initials = user ? (user.first_name?.[0] || "") + (user.last_name?.[0] || "") : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t("nav.profile")}</h1>

      {/* ── Avatar + Name Header ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover border-2 border-[var(--glass-border)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 border-2 border-primary/30 text-2xl font-bold text-primary">
                  {initials || <UserIcon className="h-8 w-8" />}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {t("profile.avatar_change")}
              </button>
              <p className="text-[10px] text-muted-foreground">{t("profile.avatar_hint")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Personal Information ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("profile.personal_info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("profile.phone")}</Label>
                <Input id="phone" placeholder="+380..." {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("profile.timezone")}</Label>
                <select id="timezone" className={glassSelect} {...register("timezone")}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t("profile.language")}</Label>
              <select id="language" className={glassSelect} {...register("language")}>
                <option value="uk">Українська</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t("profile.bio")}</Label>
              <textarea
                id="bio"
                className={glassTextarea}
                rows={3}
                placeholder={t("profile.bio_placeholder")}
                {...register("bio")}
              />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Account Information ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("profile.account_info")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user?.email}</span>
            </div>
            {user?.is_email_verified ? (
              <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400 border border-green-500/20">
                <ShieldCheck className="h-3 w-3" />
                {t("profile.email_verified")}
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-400 border border-yellow-500/20">
                <Shield className="h-3 w-3" />
                {t("profile.email_not_verified")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("profile.member_since")}:</span>
            <span className="text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("profile.account_id")}:</span>
              <code className="rounded bg-[var(--glass-bg)] px-1.5 py-0.5 text-xs text-foreground/70 border border-[var(--glass-border)]">
                {user?.id?.slice(0, 8)}...
              </code>
            </div>
            <button
              onClick={copyId}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              {copiedId ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
              {copiedId ? t("profile.copied") : t("profile.copy_id")}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5" />
            {t("profile.change_password")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPw(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("profile.old_password")}</Label>
              <Input type="password" {...registerPw("old_password", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("profile.new_password")}</Label>
                <Input type="password" {...registerPw("new_password", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.confirm_new_password")}</Label>
                <Input type="password" {...registerPw("confirm_password", { required: true })} />
              </div>
            </div>
            {watchPw("new_password") &&
              watchPw("confirm_password") &&
              watchPw("new_password") !== watchPw("confirm_password") && (
                <p className="text-xs text-red-400">{t("profile.passwords_mismatch")}</p>
              )}
            {passwordSuccess && (
              <p className="flex items-center gap-1 text-xs text-green-400">
                <Check className="h-3 w-3" />
                {t("profile.password_changed")}
              </p>
            )}
            {changePasswordMutation.isError && (
              <p className="text-xs text-red-400">{t("common.error")}</p>
            )}
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending || watchPw("new_password") !== watchPw("confirm_password")}
            >
              {changePasswordMutation.isPending ? t("common.loading") : t("profile.change_password")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Danger Zone ── */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {t("profile.danger_zone")}
          </CardTitle>
          <CardDescription className="text-red-400/60">
            {t("profile.delete_account_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteDialog ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("profile.delete_account")}
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-medium text-red-400">{t("profile.delete_confirm_title")}</p>
              <p className="text-xs text-muted-foreground">{t("profile.delete_confirm_text")}</p>
              <Input
                placeholder={t("profile.delete_confirm_placeholder")}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="border-red-500/30"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  disabled={deleteConfirm !== "DELETE" || deleteMutation.isPending}
                  onClick={onDeleteAccount}
                >
                  {deleteMutation.isPending ? t("common.loading") : t("profile.delete_account")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirm("");
                  }}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
