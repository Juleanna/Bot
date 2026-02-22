import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MessageNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const text = (data as Record<string, unknown>).text as string || "Message";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-blue-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(59,130,246,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
        <MessageSquare className="h-4 w-4" />
        {t("nodes.message")}
      </div>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{text}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
