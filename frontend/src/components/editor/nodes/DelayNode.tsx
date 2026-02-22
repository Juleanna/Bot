import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Timer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SideHandles } from "./SideHandles";

export default function DelayNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const seconds = (d.seconds as number) || 0;
  const showTyping = d.show_typing as boolean;
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-slate-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(100,116,139,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <Timer className="h-4 w-4" />
        {t("nodes.delay")}
        <span className="rounded bg-slate-500/15 border border-slate-500/20 px-1 text-xs text-slate-400">{seconds}s</span>
      </div>
      {showTyping && (
        <p className="mt-1 text-[10px] text-muted-foreground">{t("panel.show_typing")}</p>
      )}
      <Handle type="source" position={Position.Bottom} />
      <SideHandles />
    </div>
  );
}
