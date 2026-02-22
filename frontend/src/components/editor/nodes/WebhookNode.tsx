import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SideHandles } from "./SideHandles";

export default function WebhookNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const url = (d.webhook_url as string) || "";
  const method = (d.method as string) || "POST";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-red-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(248,113,113,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-red-400">
        <Globe className="h-4 w-4" />
        {t("nodes.webhook")}
        <span className="rounded bg-red-500/15 border border-red-500/20 px-1 text-xs text-red-400">{method}</span>
      </div>
      {url && <p className="mt-1 truncate text-xs text-muted-foreground">{url}</p>}
      <Handle type="source" position={Position.Bottom} />
      <SideHandles />
    </div>
  );
}
