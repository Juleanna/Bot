import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BarChart } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PollNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const question = (d.question as string) || "";
  const options = (d.options as string[]) || [];
  const pollType = (d.type as string) || "regular";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-violet-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(139,92,246,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-violet-400">
        <BarChart className="h-4 w-4" />
        {t("nodes.poll")}
        <span className="rounded bg-violet-500/15 border border-violet-500/20 px-1 text-xs text-violet-400">{pollType}</span>
      </div>
      {question && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{question}</p>}
      {options.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {options.slice(0, 3).map((opt, i) => (
            <p key={i} className="text-[10px] text-muted-foreground">• {opt}</p>
          ))}
          {options.length > 3 && (
            <p className="text-[10px] text-muted-foreground">+{options.length - 3} ...</p>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
