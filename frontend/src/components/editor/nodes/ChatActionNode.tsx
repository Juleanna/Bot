import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SideHandles } from "./SideHandles";

export default function ChatActionNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const action = (d.action as string) || "typing";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-gray-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(107,114,128,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
        <Activity className="h-4 w-4" />
        {t("nodes.chat_action")}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{action}</p>
      <Handle type="source" position={Position.Bottom} />
      <SideHandles />
    </div>
  );
}
