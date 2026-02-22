import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConditionNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const condType = (d.type as string) || "contains";
  const pattern = (d.pattern as string) || "";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-yellow-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(234,179,8,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-yellow-400">
        <GitBranch className="h-4 w-4" />
        {t("nodes.condition")}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {condType}: {pattern || "..."}
      </p>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{t("panel.true")}</span>
        <span>{t("panel.false")}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: "30%" }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: "70%" }} />
    </div>
  );
}
