import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CornerDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function GotoNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const targetNodeId = (d.target_node_id as string) || "";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-indigo-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(99,102,241,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} id="left"
        className="!w-2 !h-2 !bg-muted-foreground/30 hover:!bg-primary/60 !border-0" />
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-400">
        <CornerDownRight className="h-4 w-4" />
        {t("nodes.goto")}
      </div>
      {targetNodeId ? (
        <p className="mt-1 text-xs text-muted-foreground truncate">→ {targetNodeId.slice(0, 8)}...</p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground/50">{t("panel.target_node_placeholder")}</p>
      )}
    </div>
  );
}
