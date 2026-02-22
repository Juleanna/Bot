import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Dices } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DiceNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const emoji = (d.emoji as string) || "\uD83C\uDFB2";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-amber-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
        <Dices className="h-4 w-4" />
        {t("nodes.dice")}
        <span className="text-lg">{emoji}</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
