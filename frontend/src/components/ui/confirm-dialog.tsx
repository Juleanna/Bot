import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong,var(--glass-bg))] backdrop-blur-2xl shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              isDanger
                ? "bg-red-500/15 border border-red-500/20"
                : "bg-primary/15 border border-primary/20"
            }`}
          >
            <AlertTriangle
              className={`h-7 w-7 ${isDanger ? "text-red-400" : "text-primary"}`}
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex gap-3 border-t border-[var(--glass-border)] px-6 py-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel || t("common.cancel")}
          </Button>
          <Button
            variant={isDanger ? "destructive" : "default"}
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              confirmLabel || t("common.confirm")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
