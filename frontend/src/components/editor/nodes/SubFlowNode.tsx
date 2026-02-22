import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Workflow } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SideHandles } from "./SideHandles";

export default function SubFlowNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const flowId = (d.flow_id as string) || "";
  const flowName = (d._flow_name as string) || "";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-rose-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(244,63,94,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-rose-400">
        <Workflow className="h-4 w-4" />
        {t("nodes.sub_flow")}
      </div>
      {flowId ? (
        <p className="mt-1 text-xs text-muted-foreground truncate">{flowName || flowId.slice(0, 8) + "..."}</p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground/50">{t("panel.target_flow_placeholder")}</p>
      )}
      <Handle type="source" position={Position.Bottom} />
      <SideHandles />
    </div>
  );
}
