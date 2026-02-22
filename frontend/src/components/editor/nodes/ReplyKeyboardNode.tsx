import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ReplyKeyboardNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const text = (d.text as string) || "";
  const buttons = (d.buttons as { label: string }[]) || [];
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-teal-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(20,184,166,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-teal-400">
        <Keyboard className="h-4 w-4" />
        {t("nodes.reply_keyboard")}
      </div>
      {text && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{text}</p>}
      {buttons.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {buttons.slice(0, 4).map((btn, i) => (
            <span key={i} className="rounded bg-teal-500/15 border border-teal-500/20 px-1.5 text-[10px] text-teal-400">
              {btn.label}
            </span>
          ))}
          {buttons.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{buttons.length - 4}</span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
